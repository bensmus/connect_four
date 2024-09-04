export const rowCount = 6
export const columnCount = 7

/**
 * Returns a randomInteger in [min, max) (interval notation)
 * assuming min and max are both integers.
 * 
 * @param {number} max 
 * @param {number} min 
 */
function randomInteger(min, max) {
    const range = max - min
    const integerDelta = Math.floor(Math.random() * range)
    return min + integerDelta
}

// Return column that computer moves
export function computerMove(gameState) {
    // Currently does a random move.
    const columns = gameState.tokens.columnsCanDrop()
    return columns[randomInteger(0, columns.length)]
    
    // Since there are 42 cells,
    // and computer always goes second,
    // it will always be able to find a move.
}

function zeroArray(count) {
    const ar = Array(count)
    ar.fill(0)
    return ar
}

class Tokens {
    constructor(ar) {
        this.ar = ar ?? zeroArray(rowCount * columnCount)
    }

    readToken(row, column) {
        return this.ar[row * columnCount + column]
    }

    setToken(row, column, to) {
        this.ar[row * columnCount + column] = to
    }

    clone() {
        return new Tokens([...this.ar])
    }

    // Return a row where the token would drop to.
    // If the row is filled, return -1.
    findDropRow(column) {
        for (let row = rowCount - 1; row > -1; row--) {
            if (this.readToken(row, column) == 0) {
                return row
            }
        }
        return -1
    }

    // Read a line of tokens.
    readLine(rowStart, columnStart, rowDelta, columnDelta, lineLength) {
        const line = []
        let row = rowStart
        let column = columnStart
        for (let iter = 0; iter < lineLength; iter++) {
            if (row < rowCount && row >= 0 && column < columnCount && column >= 0) {
                line.push(this.readToken(row, column))
            }
            row += rowDelta
            column += columnDelta
        }
        return line
    }

    // Returns in which columns a token can be dropped.
    columnsCanDrop() {
        const columns = []
        for (let column = 0; column < columnCount; column++) {
            if (this.readToken(0, column) == 0) {
                columns.push(column)
            }
        }
        return columns
    }
}

export class GameState {
    constructor(tokens, lastMove) {
        this.tokens = tokens ?? new Tokens()
        this.lastMove = lastMove ?? null
    }

    lastPlayer() {
        if (this.lastMove) {
            return this.tokens.readToken(this.lastMove.row, this.lastMove.column)
        }
        // childState of initial GameState: should put red tokens:
        // so, return -1.
        return -1
    }

    childState(column) {
        const row = this.tokens.findDropRow(column)
        if (row == -1) {
            throw new Error("No child state exists with that column")
        }
        const childTokens = this.tokens.clone()
        childTokens.setToken(row, column, -this.lastPlayer())
        return new GameState(childTokens, {row: row, column: column})
    }

    allChildStates() {
        const columns = this.tokens.columnsCanDrop()
        const childStates = []
        for (const column of columns) {
            childStates.push(this.childState(column))
        }
        return childStates
    }

    // Returns whether this is a winning state.
    // Assumes GameState is valid, i.e. 
    // lastMove would have to be winning move.
    checkWin() {
        // Returns whether `ar` contains `elem` repeated four consecutive times.
        function fourInARow(ar, elem) {
            let countInARow = 0
            for (let i = 0; i < ar.length; i++) {
                if (ar[i] == elem) {
                    countInARow++
                    if (countInARow == 4) {
                        return true
                    }
                } else {
                    countInARow = 0
                }
            }
            return false
        }
        const lineLength = 7
        const horiz = this.tokens.readLine(this.lastMove.row, this.lastMove.column - 3, 0, 1, lineLength)
        const vert = this.tokens.readLine(this.lastMove.row - 3, this.lastMove.column, 1, 0, lineLength)
        const diagDown = this.tokens.readLine(this.lastMove.row - 3, this.lastMove.column - 3, 1, 1, lineLength)
        const diagUp = this.tokens.readLine(this.lastMove.row + 3, this.lastMove.column - 3, -1, 1, lineLength)
        return (
            fourInARow(horiz, this.lastPlayer()) || fourInARow(vert, this.lastPlayer()) ||
            fourInARow(diagDown, this.lastPlayer()) || fourInARow(diagUp, this.lastPlayer())
        )
    }

    // Returns either:
    // [1, true]: P1 win 
    // [-1, true]: P2 win
    // [0, true]: draw
    // [0, false]: game not finished
    evaluate() {
        if (this.tokens.columnsCanDrop().length == 0) {
            return [0, true]
        }
        
        if (this.checkWin()) {
            return [this.lastPlayer(), true]
        }

        return [0, false]
    }
}