const Piece = require("./piece");
const Rook = require("./rook");
const Bishop = require("./bishop");

class Queen extends Piece {
    static startingPositions = {
        white: ["d1"],
        black: ["d8"],
    };

    constructor(color, coordinate) {
        super(color, "queen", coordinate);
        this.possibleSlopes = [0, -Infinity, Infinity, 1, -1];
    }

    isLegalChessMove(position) {
        let newCoordinate;

        try {
            newCoordinate = Piece.toCoordinate(position);
        } catch (e) {
            return false;
        }

        return this.possibleSlopes.includes(Piece.computeSlope(this.coordinate, newCoordinate));
    }

    get reachableSquares() {
        const b = new Bishop(this.color, this.coordinate);
        const r = new Rook(this.color, this.coordinate);

        return b.reachableSquares.concat(r.reachableSquares);
    }
}

module.exports = Queen;
