const Piece = require("./piece");

class King extends Piece {
    static startingPositions = {
        white: ["e1"],
        black: ["e8"],
    };

    constructor(color, coordinate) {
        super(color, "king", coordinate);
    }

    isLegalChessMove(position) {
        let newCoordinate;

        try {
            newCoordinate = Piece.toCoordinate(position);
        } catch (e) {
            return false;
        }

        let [x, y] = newCoordinate;
        let deltaX = Math.abs(x - this.coordinate[0]);
        let deltaY = Math.abs(y - this.coordinate[1]);

        return (deltaX === 1 && deltaY === 1) || (deltaX == 0 && deltaY === 1) || (deltaX === 1 && deltaY === 0);
    }

    get reachableSquares() {
        const [x, y] = this.coordinate;
        const possibleCoordinates = [];

        possibleCoordinates.push([x, y + 1]);
        possibleCoordinates.push([x, y - 1]);
        possibleCoordinates.push([x + 1, y]);
        possibleCoordinates.push([x - 1, y]);
        possibleCoordinates.push([x + 1, y + 1]);
        possibleCoordinates.push([x + 1, y - 1]);
        possibleCoordinates.push([x - 1, y + 1]);
        possibleCoordinates.push([x - 1, y - 1]);

        return possibleCoordinates.filter(coordinate => {
            const [a, b] = coordinate;
            return a >= 0 && a <= 7 && b >= 0 && b <= 7;
        });
    }
}

module.exports = King;
