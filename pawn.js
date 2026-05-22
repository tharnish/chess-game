const Piece = require("./piece");

class Pawn extends Piece {
    static startingPositions = {
        white: ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
        black: ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
    };

    constructor(color, coordinate) {
        super(color, "pawn", coordinate);
    }

    validateWhitePawn(position) {
        let coordinate;

        try {
            coordinate = Piece.toCoordinate(position);
        } catch (e) {
            return false;
        }

        const [file, rank] = this.coordinate;
        const [newFile, newRank] = coordinate;

        if ((newRank - rank === 2) && !this.hasMoved && newFile === file) {
            return true;
        }

        if ((newRank - rank == 1) && (newFile === file)) {
            return true;
        }

        if ((newRank - rank === 1) && (newFile - file === -1 || newFile - file === 1)) {
            return true;
        }

        return false;
    }

    validateBlackPawn(position) {
        let coordinate;

        try {
            coordinate = Piece.toCoordinate(position);
        } catch (e) {
            return false;
        }

        const [file, rank] = this.coordinate;
        const [newFile, newRank] = coordinate;

        if ((newRank - rank == -2) && !this.hasMoved && newFile === file) {
            return true;
        }

        if ((newRank - rank == -1) && (newFile === file)) {
            return true;
        }

        if ((newRank - rank === -1) && (newFile - file === -1 || newFile - file === 1)) {
            return true;
        }

        return false;
    }

    isLegalChessMove(position) {
        if (this.color === "white") {
            return this.validateWhitePawn(position);
        }

        return this.validateBlackPawn(position);
    }

    promote(type, coordinate) {
        if (type == "pawn" || !Piece.validTypes.includes(type)) throw new Error("Invalid promotion.");
        Piece.validateCoordinate(coordinate);

        this.type = type;
        this.promotable = false;
    }

    get reachableSquares() {
        const reachableSquares = [];
        let [x, y] = this.coordinate;

        if (this.hasMoved && this.color === "white" && y < 7 && y >= 0) {
            if (x >= 1 && x <= 6) {
                reachableSquares.push([x, y + 1]);
                reachableSquares.push([x + 1, y + 1]);
                reachableSquares.push([x - 1, y + 1]);
                return reachableSquares;
            } else if (x === 0) {
                reachableSquares.push([x, y + 1]);
                reachableSquares.push([x + 1, y + 1]);
                return reachableSquares;
            } else {
                reachableSquares.push([x, y + 1]);
                reachableSquares.push([x - 1, y + 1]);
                return reachableSquares;
            }
        }

        if (!this.hasMoved && this.color === "white" && y >= 0 && y < 7) {
            if (x >= 1 && x <= 6) {
                reachableSquares.push([x, y + 2]);
                reachableSquares.push([x, y + 1]);
                reachableSquares.push([x + 1, y + 1]);
                reachableSquares.push([x - 1, y + 1]);
                return reachableSquares;
            } else if (x === 0) {
                reachableSquares.push([x, y + 1]);
                reachableSquares.push([x, y + 2]);
                reachableSquares.push([x + 1, y + 1]);
                return reachableSquares;
            } else {
                reachableSquares.push([x, y + 1]);
                reachableSquares.push([x, y + 2]);
                reachableSquares.push([x - 1, y + 1]);
                return reachableSquares;
            }
        }

        if (this.hasMoved && this.color === "black" && y > 0 && y <= 7) {
            if (x >= 1 && x <= 6) {
                reachableSquares.push([x, y - 1]);
                reachableSquares.push([x - 1, y - 1]);
                reachableSquares.push([x + 1, y - 1]);
                return reachableSquares;
            } else if (x === 0) {
                reachableSquares.push([x, y - 1]);
                reachableSquares.push([x + 1, y - 1]);
                return reachableSquares;
            } else {
                reachableSquares.push([x, y - 1]);
                reachableSquares.push([x - 1, y - 1]);
                return reachableSquares;
            }
        }

        if (!this.hasMoved && this.color === "black" && y > 0 && y <= 7) {
            if (x >= 1 && x <= 6) {
                reachableSquares.push([x, y - 2]);
                reachableSquares.push([x, y - 1]);
                reachableSquares.push([x - 1, y - 1]);
                reachableSquares.push([x + 1, y - 1]);
                return reachableSquares;
            } else if (x === 0) {
                reachableSquares.push([x, y - 1]);
                reachableSquares.push([x, y - 2]);
                reachableSquares.push([x + 1, y - 1]);
                return reachableSquares;
            } else {
                reachableSquares.push([x, y - 1]);
                reachableSquares.push([x, y - 2]);
                reachableSquares.push([x - 1, y - 1]);
                return reachableSquares;
            }
        }

        return reachableSquares;
    }
}

module.exports = Pawn;
