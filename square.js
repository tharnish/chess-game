const Piece = require("./piece");

class Square {
    constructor(color, coordinate) {
        this.color = color;
        this.coordinate = coordinate;
        this._piece = null;
    }

    get position() {
        return Piece.toAlgebraic(this.coordinate);
    }

    set piece(piece) {
        this._piece = piece;
    }

    get piece() {
        return this._piece;
    }

    get occupied() {
        return !!this.piece;
    }
}

module.exports = Square;
