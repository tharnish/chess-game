const Piece = require("./piece");

class Knight extends Piece {
    static startingPositions = {
        white: ["b1", "g1"],
        black: ["b8", "g8"],
    };

    constructor(color, coordinate) {
        super(color, "knight", coordinate);
    }

    isLegalChessMove(position) {
        let coordinate;

        try {
            coordinate = Piece.toCoordinate(position);
        } catch (e) {
            return false;
        }

        const [x, y] = coordinate;
        const deltaX = Math.abs(x - this.coordinate[0]);
        const deltaY = Math.abs(y - this.coordinate[1]);

        return (deltaX === 1 && deltaY === 2) || (deltaX === 2 && deltaY === 1);
    }

    get reachableSquares() {
        const reachableSquares = [];
        let [x, y] = this.coordinate;
        const directions = [[1, 2], [2, 1], [-1, 2], [-2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1]];

        for (let i = 0; i < directions.length; i++) {
            const [deltaX, deltaY] = directions[i];
            x += deltaX;
            y += deltaY;

            if (x > 7 || x < 0 || y > 7 || y < 0) {
                [x, y] = this.coordinate;
                continue;
            }

            reachableSquares.push([x, y]);
            [x, y] = this.coordinate;
        }

        return reachableSquares;
    }
}

module.exports = Knight;
