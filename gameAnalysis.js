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

function randomChoice(array) {
    const randomIndex = randomInteger(0, array.length)
    return array[randomIndex]
}

// Return column that computer moves.
export function computerMove(gameState) {
    const states = gameState.allChildStates()
    // let bestScore = 1
    // let bestState = states[0]
    // for (const state of states) {
    //     const score = state.getMinimaxScore(5) 
    //     if (score < bestScore) {
    //         bestScore = score
    //         bestState = state
    //     }
    // }

    function makeMap(keys, keyFunc) {
        const map = new Map()
        for (const key of keys) {
            const value = keyFunc(key)
            map.set(key, value)
        }
        return map
    }

    function minValue(map) {
        return Math.min(...map.values())
    }

    function keysWithValue(map, targetValue) {
        const keys = []
        for (const [key, value] of map.entries()) {
            if (value == targetValue) {
                keys.push(key)
            }
        }
        return keys
    }

    let stateScoreMap = makeMap(states, (state) => state.getMinimaxScore(5))
    let bestScore = minValue(stateScoreMap)

    if (bestScore == 1) { // "Mate in 5" or less from the player: computer can't do anything.
        // Repeat the process assuming the player
        // isn't smart enough to read 5 moves ahead?
        
        // Bandaid fix: Delay the win:
        stateScoreMap = makeMap(states, (state) => state.getMinimaxScore(1))
        bestScore = minValue(stateScoreMap)
    }

    const bestStates = keysWithValue(stateScoreMap, bestScore)
    const bestState = randomChoice(bestStates)
    return bestState.lastMove.column

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

    // Returns 1, -1, or 0.
    getMinimaxScore(depthLimit) {
        // Also returns 1, -1, or 0.
        function minimaxRecursive(gameState, depth, depthLimit) {
            const [score, gameOver] = gameState.evaluate()
            
            // Base case 1:
            if (gameOver) {
                return score
            }
            
            // Base case 2:
            if (depth == depthLimit) {
                return 0 // Could not reach a winning or loosing state.
            }
            
            // Recursive case:
            const states = gameState.allChildStates()
            const isMaximizer = gameState.lastPlayer() == -1
            let bestScore = isMaximizer ? -1 : 1
            const betterScore = (score, referenceScore) => {
                if (isMaximizer) {
                    return score > referenceScore
                }
                return score < referenceScore
            }
            for (const state of states) {
                const score = minimaxRecursive(state, depth + 1, depthLimit)
                if (betterScore(score, bestScore)) {
                    bestScore = score
                }
            }
            return bestScore
        }
        
        return minimaxRecursive(this, 0, depthLimit)
    }
}