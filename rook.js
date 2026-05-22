const Piece = require("./piece");

class Rook extends Piece {
    static startingPositions = {
        white: ["a1", "h1"],
        black: ["a8", "h8"],
    };

    constructor(color, coordinate) {
        super(color, "rook", coordinate);
        this.possibleSlopes = [0, -Infinity, Infinity];
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
        let [x, y] = this.coordinate;
        const reachableSquares = [];

        while (x < 7) {
            x += 1;
            reachableSquares.push([x, y]);
        }

        [x, y] = this.coordinate;

        while (x > 0) {
            x -= 1;
            reachableSquares.push([x, y]);
        }

        [x, y] = this.coordinate;

        while (y < 7) {
            y += 1;
            reachableSquares.push([x, y]);
        }

        [x, y] = this.coordinate;

        while (y > 0) {
            y -= 1;
            reachableSquares.push([x, y]);
        }

        return reachableSquares;
    }
}
module.exports = Rook;
