const Piece = require("./piece");

class Bishop extends Piece {
    static startingPositions = {
        white: ["c1", "f1"],
        black: ["c8", "f8"],
    };

    constructor(color, coordinate) {
        super(color, "bishop", coordinate);
        this.possibleSlopes = [-1, 1];
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
        const reachableSquares = [];
        let [x, y] = this.coordinate;

        while (x < 7 && y < 7) {
            x += 1;
            y += 1;
            reachableSquares.push([x, y]);
        }

        [x, y] = this.coordinate;

        while (x > 0 && y < 7) {
            x -= 1;
            y += 1;
            reachableSquares.push([x, y]);
        }

        [x, y] = this.coordinate;

        while (x < 7 && y > 0) {
            x += 1;
            y -= 1;
            reachableSquares.push([x, y]);
        }

        [x, y] = this.coordinate;

        while (x > 0 && y > 0) {
            x -= 1;
            y -= 1;
            reachableSquares.push([x, y]);
        }

        return reachableSquares;
    }
}

module.exports = Bishop;
