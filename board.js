const Piece = require("./piece");
const Square = require("./square");
const Pawn = require("./pawn");
const Rook = require("./rook");
const Knight = require("./knight");
const Bishop = require("./bishop");
const Queen = require("./queen");
const King = require("./king");

class Board {
    static castleSquares = {
        black: {
            king: {
                squares: ["f8", "g8"],
                kingSquare: "e8",
                rookSquare: "h8",
                kingFinalSquare: "g8",
                rookFinalSquare: "f8",
            },
            queen: {
                squares: ["b8", "c8", "d8"],
                kingSquare: "e8",
                rookSquare: "a8",
                kingFinalSquare: "c8",
                rookFinalSquare: "d8",
            },
        },
        white: {
            king: {
                squares: ["f1", "g1"],
                kingSquare: "e1",
                rookSquare: "h1",
                kingFinalSquare: "g1",
                rookFinalSquare: "f1",
            },
            queen: {
                squares: ["b1", "c1", "d1"],
                kingSquare: "e1",
                rookSquare: "a1",
                kingFinalSquare: "c1",
                rookFinalSquare: "d1",
            },
        }
    };
    static piecesByColor = {
        black: "blackPieces",
        white: "whitePieces",
    };
    static abbreviations = {
        r: "rook",
        n: "knight",
        B: "bishop",
        q: "queen",
        k: "king",
    };

    constructor() {
        this.enPassantSquare = null;
        this.board = this.initBoard();
        this.blackPieces = new Map();
        this.whitePieces = new Map();
        this.placePieces();
    }

    initBoard() {
        let board = [];

        for (let i = 0; i < 8; i++) {
            let row = [];

            for (let j = 0; j < 8; j++) {
                if (i % 2 === j % 2) {
                    row.push(new Square("black", [i, j]));
                } else {
                    row.push(new Square("white", [i, j]));
                }
            }

            board.push(row);
        }

        return board;
    }

    placePieces() {
        const pieces = [Pawn, Rook, Knight, Bishop, Queen, King];

        Piece.validColors.forEach(color => {
            pieces.forEach(piece => {
                piece.startingPositions[color].forEach(startingPosition => {
                    const coordinate = Piece.toCoordinate(startingPosition);
                    const [x, y] = coordinate;
                    const newPiece = new piece(color, coordinate);

                    this.board[x][y].piece = newPiece;
                    this[Board.piecesByColor[color]].set(newPiece.position, newPiece);
                });
            });
        });
    }

    hasObstaclesInPath(currentX, currentY, newX, newY, deltaX, deltaY, color) {
        if (deltaX === 0 && deltaY === 0) return false;

        while (true) {
            currentX += deltaX;
            currentY += deltaY;

            if (currentX > 7 || currentX < 0 || currentY < 0 || currentY > 7) {
                return false;
            }

            if (currentX === newX && currentY === newY) {
                if (this.board[currentX][currentY].occupied &&
                    this.board[currentX][currentY].piece.color === color) {
                    return true;
                }
                return false;
            }

            if (this.board[currentX][currentY].occupied) {
                return true;
            }
        }
    }

    computePositionChange(oldCoordinate, newCoordinate) {
        const [oldX, oldY] = oldCoordinate;
        const [newX, newY] = newCoordinate;
        const slope = Piece.computeSlope(oldCoordinate, newCoordinate);

        if (slope === 1) return oldX < newX ? [1, 1] : [-1, -1];
        if (slope === -1) return oldX < newX ? [1, -1] : [-1, 1];
        if (slope === 0) return oldX < newX ? [1, 0] : [-1, 0];
        if (slope === -Infinity) return [0, -1];
        return [0, 1];
    }

    canMove(piece, position) {
        try {
            Piece.validatePosition(position);
        } catch {
            return false;
        }

        const isValidChessMove = piece.isLegalChessMove(position);
        const [oldX, oldY] = piece.coordinate;
        const [newX, newY] = Piece.toCoordinate(position);
        const [deltaX, deltaY] =
            this.computePositionChange([oldX, oldY], [newX, newY]);

        const hasObstacles =
            this.hasObstaclesInPath(oldX, oldY, newX, newY, deltaX, deltaY, piece.color);

        if (piece.type === "knight") {
            return isValidChessMove &&
                (!this.board[newX][newY].occupied ||
                    this.board[newX][newY].piece.color !== piece.color);
        }

        if (isValidChessMove && !hasObstacles) {
            return true;
        }

        return false;
    }

    updatePosition(piece, oldX, oldY, newX, newY) {
        const captured = this.board[newX][newY].piece;
        const temp = piece.position;

        piece.coordinate = [newX, newY];
        this.board[oldX][oldY].piece = null;
        this.board[newX][newY].piece = piece;

        this[Board.piecesByColor[piece.color]].set(piece.position, piece);
        this[Board.piecesByColor[piece.color]].delete(temp);

        if (captured) {
            this[Board.piecesByColor[captured.color]].delete(captured.position);
        }

        return captured;
    }

    move(piece, position) {
        const [oldX, oldY] = piece.coordinate;
        const [newX, newY] = Piece.toCoordinate(position);

        try {
            Piece.validatePosition(position);
        } catch (e) {
            return { isMovementSuccessful: false };
        }

        if (piece.type === "pawn" && (!this.board[newX][newY].occupied || this.board[newX][newY].piece.color === piece.color) && Math.abs(Piece.computeSlope([oldX, oldY], [newX, newY])) === 1) {
            return { isMovementSuccessful: false };
        }

        if (!this.canMove(piece, position)) return { isMovementSuccessful: false };

        const moveObject = {
            capturedPiece: this.updatePosition(piece, oldX, oldY, newX, newY),
            from: [oldX, oldY],
            to: [newX, newY],
            isMovementSuccessful: true,
        };

        if (this.isKingInCheck(piece.color)) {
            this.revertMove(piece, moveObject);
            return { isMovementSuccessful: false };
        }

        return moveObject;
    }

    parseAlgebraicMove(move) {
        move = move.replace(/\s+/g, "");
        let pieceSymbol = move[0];
        let movePosition;
        let pieceName;
        const files = "abcdefgh12345678";

        if (move.length === 2) {
            movePosition = move;
        } else if (move.length === 3) {
            movePosition = move.slice(1);
        } else if (move.length === 4) {
            movePosition = move.slice(2);
        } else {
            return {};
        }

        try {
            Piece.validatePosition(movePosition);
        } catch {
            return {};
        }

        if (pieceSymbol in Board.abbreviations) {
            pieceName = Board.abbreviations[pieceSymbol];
        } else {
            pieceName = "pawn";
        }

        return { pieceName, movePosition };
    }

    search(color, pieceName) {
        return [...this[Board.piecesByColor[color]].values()]
            .filter(p => p.type === pieceName);
    }

    isKingInCheck(color) {
        let [king] = this.search(color, "king");
        let oppositeColor = color === "black" ? "white" : "black";
        let oppositePieces =
            [...this[Board.piecesByColor[oppositeColor]].values()];

        return oppositePieces.some(piece => {
            const [kingX, kingY] = king.coordinate;
            const [pieceX, pieceY] = piece.coordinate;
            const [deltaX, deltaY] = [Math.abs(kingX - pieceX), Math.abs(kingY - pieceY)];

            if (piece.type == "pawn" && deltaX === 0 && deltaY === 1) {
                return false;
            }

            return this.canMove(piece, king.position)
        });
    }

    canCastle(color, side) {
        const oppositeColor = color === "black" ? "white" : "black";
        const enemyPieces = Array.from(this[Board.piecesByColor[oppositeColor]].values());

        if (side !== "king" && side !== "queen") return false;
        if (this.isKingInCheck(color)) return false;
        const [king] = this.search(color, "king");

        if (king.hasMoved) return false;

        const [x, y] = Piece.toCoordinate(Board.castleSquares[color][side].rookSquare);
        const rook = this.board[x][y].piece;

        if (!rook || rook.type !== "rook" || rook.hasMoved) return false;

        const isAnyCastlingSquareOccupied = Board.castleSquares[color][side].squares.some(square => {
            const [x, y] = Piece.toCoordinate(square);
            return this.board[x][y].occupied;
        });

        if (isAnyCastlingSquareOccupied) return false;

        this.placeDumbies(Board.castleSquares[color][side].squares, color);
        const isAnyCastlingSquareDangerous = Board.castleSquares[color][side].squares.some(square => {
            return enemyPieces.some(piece => this.canMove(piece, square));
        });
        this.removeDumbies(Board.castleSquares[color][side].squares);

        if (isAnyCastlingSquareDangerous) return false;

        return true;
    }

    placeDumbies(squares, color) {
        for (let i = 0; i < squares.length; i++) {
            const [x, y] = Piece.toCoordinate(squares[i]);
            this.board[x][y].piece = new Piece(color, "knight", [x, y]);
        }
    }

    removeDumbies(squares) {
        for (let i = 0; i < squares.length; i++) {
            const [x, y] = Piece.toCoordinate(squares[i]);
            this.board[x][y].piece = null;
        }
    }

    revertMove(originalPiece, moveObject) {
        const [originalX, originalY] = moveObject.from;
        const [currentX, currentY] = moveObject.to;
        const capturedPiece = moveObject.capturedPiece;

        this.updatePosition(originalPiece, currentX, currentY, originalX, originalY);

        if (capturedPiece instanceof Piece) {
            const [x, y] = capturedPiece.coordinate;
            this.board[x][y].piece = capturedPiece;
            this[Board.piecesByColor[capturedPiece.color]]
                .set(capturedPiece.position, capturedPiece);
        }
    }

    findSquaresInBetween(from, to) {
        const [fromX, fromY] = from;
        const [toX, toY] = to;
        const deltaX = Math.sign(toX - fromX);
        const deltaY = Math.sign(toY - fromY);
        const result = [];
        let newX = fromX;
        let newY = fromY;

        while (true) {
            if (newY == toY && newX == toX) {
                result.pop();
                break;
            }

            newX += deltaX;
            newY += deltaY;
            result.push([newX, newY]);
        }

        return result;
    }

    isCheckmate(color) {
        const [king] = this.search(color, "king");
        const reachableSquares = king.reachableSquares;
        const kingSafeSquares = reachableSquares.filter(square => {
            const position = Piece.toAlgebraic(square);
            const movementStatus = this.move(king, position);
            if (movementStatus.isMovementSuccessful) {
                this.revertMove(king, movementStatus);
            }

            return movementStatus.isMovementSuccessful;
        });

        if (!this.isKingInCheck(color)) {
            return false;
        }

        if (kingSafeSquares.length > 0) {
            return false;
        }

        const oppositeColor = color === "black" ? "white" : "black";
        const piecesAttackingKing = Array.from(this[Board.piecesByColor[oppositeColor]].values()).filter(piece => {
            return this.canMove(piece, king.position);
        });

        if (piecesAttackingKing.length > 1) {
            return true;
        }

        const attackingPiecePosition = piecesAttackingKing[0].position;
        const canCaptureAttackingPiece = !!Array.from(this[Board.piecesByColor[color]].values()).filter(piece => {
            const movementStatus = this.move(piece, attackingPiecePosition);

            if (movementStatus.isMovementSuccessful) {
                this.revertMove(piece, movementStatus);
            }

            return movementStatus.isMovementSuccessful;
        }).length;

        if (canCaptureAttackingPiece) {
            return false;
        }

        const attackingPiece = piecesAttackingKing[0];

        if (attackingPiece.type === "knight") {
            return true;
        }

        const canAnyPieceBlockCheck = this.findSquaresInBetween(king.coordinate, attackingPiece.coordinate).some(square => {
            const position = Piece.toAlgebraic(square);

            return Array.from(this[Board.piecesByColor[color]].values())
                .some(piece => {
                    if (piece.type === "king") return false;

                    const movementStatus = this.move(piece, position);

                    if (movementStatus.isMovementSuccessful) {
                        this.revertMove(piece, movementStatus);
                    }

                    return movementStatus.isMovementSuccessful;
                });
        });

        if (canAnyPieceBlockCheck)
            return false;

        return true;
    }

    isStalemate(color) {
        const pieces = Array.from(this[Board.piecesByColor[color]].values());

        if (this.isKingInCheck(color)) return false;

        for (let i = 0; i < pieces.length; i++) {
            const piece = pieces[i];

            for (let j = 0; j < piece.reachableSquares.length; j++) {
                const square = piece.reachableSquares[j];
                const position = Piece.toAlgebraic(square);
                const moveInfo = this.move(piece, position);

                if (moveInfo.isMovementSuccessful) {
                    this.revertMove(piece, moveInfo);
                    return false;
                }
            }
        }

        return true;
    }

    castle(color, side) {
        if (!this.canCastle(color, side)) return;

        const kingSquare = Piece.toCoordinate(Board.castleSquares[color][side].kingSquare);
        const rookSquare = Piece.toCoordinate(Board.castleSquares[color][side].rookSquare);
        const [rookX, rookY] = rookSquare;
        const [kingX, kingY] = kingSquare;
        const king = this.board[kingX][kingY].piece;
        const rook = this.board[rookX][rookY].piece;
        const [kingFinalX, kingFinalY] = Piece.toCoordinate(Board.castleSquares[color][side].kingFinalSquare);
        const [rookFinalX, rookFinalY] = Piece.toCoordinate(Board.castleSquares[color][side].rookFinalSquare);
        this.updatePosition(king, kingX, kingY, kingFinalX, kingFinalY);
        this.updatePosition(rook, rookX, rookY, rookFinalX, rookFinalY);
    }

    toString() {
        console.log("Black pieces:");
        const blackPieces = this[Board.piecesByColor["black"]];
        const whitePieces = this[Board.piecesByColor["white"]];

        for (let [key, value] of blackPieces) {
            console.log(`${value.type}: ${key}`);
        }

        console.log("White pieces:");

        for (let [key, value] of whitePieces) {
            console.log(`${value.type}: ${key}`);
        }
    }
}

module.exports = Board;
const b = new Board();
b.board[5][0].piece = null;
b.board[6][0].piece = null;
b.move(b.board[7][0].piece, "g1");
b.move(b.board[6][0].piece, "h1");
console.log(b.whitePieces);
b.castle("white", "king");
