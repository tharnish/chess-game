class Piece {
    static validTypes = Object.freeze(["pawn", "rook", "knight", "bishop", "queen", "king"]);
    static validColors = Object.freeze(["black", "white"]);
    static letters = Object.freeze(["a", "b", "c", "d", "e", "f", "g", "h"]);
    static map = Object.freeze(Object.assign(Object.create(null), {
        a: 0, b: 1, c: 2, d: 3,
        e: 4, f: 5, g: 6, h: 7
    }));
    #coordinate;
    #type;
    #color;
    #hasMoved = false;
    #promotable;

    constructor(color, type, coordinate) {
        Piece.validateCoordinate(coordinate);

        if (!Piece.validColors.includes(color.toLowerCase())) {
            throw new Error("Color must be either black or white.");
        }

        if (!Piece.validTypes.includes(type.toLowerCase())) {
            throw new Error("A piece must be a valid chess piece.");
        }

        this.#type = type.toLowerCase();

        if (this.type === "pawn") {
            this.#promotable = true;
        } else {
            this.#promotable = false;
        }

        this.#color = color.toLowerCase();
        this.#coordinate = coordinate;
    }

    get coordinate() {
        return [...this.#coordinate];
    }

    get type() {
        return this.#type;
    }

    get color() {
        return this.#color;
    }

    get position() {
        return Piece.toAlgebraic(this.#coordinate);
    }

    get hasMoved() {
        return this.#hasMoved;
    }

    set coordinate(coordinate) {
        try {
            Piece.validateCoordinate(coordinate);
            this.#hasMoved = true;
            this.#coordinate = coordinate;
        } catch (e) {
        }
    }

    static validateCoordinate(coordinate) {
        if (!Array.isArray(coordinate)) {
            throw new Error("Coordinate must be an array.");
        }

        if (coordinate.length !== 2) {
            throw new Error("Coordinate array must contain two elements.");
        }

        if (typeof coordinate[0] !== 'number' || typeof coordinate[1] !== 'number') {
            throw new Error("Both coordinate elements must be of type 'number'");
        }

        if (coordinate[0] < 0 || coordinate[0] > 7 || coordinate[1] < 0 || coordinate[1] > 7) {
            throw new Error("Invalid coordinate position.");
        }
    }

    static toAlgebraic(coordinate) {
        Piece.validateCoordinate(coordinate);
        const num = coordinate[1] + 1;
        return `${Piece.letters[coordinate[0]] + num}`;
    }

    static validatePosition(position) {
        if (typeof position !== "string" || position.length !== 2) {
            throw new Error("Invalid position.");
        }

        let [file, rank] = position.split("");
        rank = Number(rank);

        if (!(file in Piece.map)) {
            throw new Error("Invalid position.");
        }

        if (Number.isNaN(rank) || rank < 1 || rank > 8) {
            throw new Error("Invalid position.");
        }
    }

    static toCoordinate(position) {
        Piece.validatePosition(position);
        let [file, rank] = position.split("");
        file = Piece.map[file];
        rank = Number(rank);
        rank -= 1;
        return [file, rank];
    }

    static computeSlope(coordinate1, coordinate2) {
        return (coordinate2[1] - coordinate1[1]) / (coordinate2[0] - coordinate1[0]);
    }
}
module.exports = Piece;
