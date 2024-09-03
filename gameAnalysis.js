import { rowCount, columnCount } from "./main.js";

// FIXME - You are not handling draw anywhere
/**
 * Returns 1 if player 1 won, 
 * -1 if player -1 won, 
 * 2 if draw,
 * and 0 otherwise.
 * 
 * @param {number[][]} tokens 
 * @param {number} rowLatest
 * @param {number} columnLatest 
 */
export function evalBoard(tokens, rowLatest, columnLatest) {
    function readLine(ar, rowStart, columnStart, rowDelta, columnDelta, lineLength) {
        const line = []
        let row = rowStart
        let column = columnStart
        for (let iter = 0; iter < lineLength; iter++) {
            if (row < rowCount && row >= 0 && column < columnCount && column >= 0) {
                line.push(ar[row][column])
            }
            row += rowDelta
            column += columnDelta
        }
        return line
    }

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

    function checkDraw() {
        // Draw can only occur if last move was in row 0.
        if (rowLatest != 0) {
            return false
        }
        // If row 0 is all nonzero, it is a draw.
        for (let column = 0; column < columnCount; column++) {
            if (tokens[0][column] == 0) {
                return false
            }
        }
        return true
    }

   
    if (checkDraw()) {
        return 2
    }

    const playerToCheck = tokens[rowLatest][columnLatest]

    const lineLength = 7
    const horiz = readLine(tokens, rowLatest, columnLatest - 3, 0, 1, lineLength)
    const vert = readLine(tokens, rowLatest - 3, columnLatest, 1, 0, lineLength)
    const diagDown = readLine(tokens, rowLatest - 3, columnLatest - 3, 1, 1, lineLength)
    const diagUp = readLine(tokens, rowLatest + 3, columnLatest - 3, -1, 1, lineLength)
    const win = (
        fourInARow(horiz, playerToCheck) || fourInARow(vert, playerToCheck) ||
        fourInARow(diagDown, playerToCheck) || fourInARow(diagUp, playerToCheck)
    )
    if (win) {
        return playerToCheck
    }
    return 0
}

/**
 * Return a row where the token would drop to.
 * If the row is filled, return -1.
 * 
 * @param {number[][]} tokens 
 * @param {number} column 
 */
export function findTokenDropRow(tokens, column) {
    // Start from bottom:
    for (let row = rowCount - 1; row > -1; row--) {
        if (tokens[row][column] == 0) {
            return row
        }
    }
    return -1
}

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

/**
 * Shuffle array in place.
 */
function shuffle(ar) {
    function swap(ar, i, j) {
        const tmp = ar[i]
        ar[i] = ar[j]
        ar[j] = tmp
    }
    for (let i = ar.length - 1; i > 0; i--) {
        const j = randomInteger(0, i + 1)
        swap(ar, i, j)
    }
}

/**
 * Return row and column of where the computer (always player -1) will move.
 * For now, computer chooses a random valid move.
 * 
 * @param {number[][]} tokens
 */
export function computerMove(tokens) {
    const columns = [...Array(columnCount).keys()] // [0, 1, ... columnCount - 1]
    shuffle(columns)
    // Chooses columns in a random order. If a column is full
    // it moves to the next column.
    for (let index = 0; index < columns.length; index++) {
        const column = columns[index]
        const row = findTokenDropRow(tokens, column)
        if (row != -1) {
            return [row, column]
        }
    }
    // Since there are 42 cells,
    // and computer always goes second,
    // it will always be able to find a move.
}

/**
 * Simple move evaluation function that returns
 * 1, -1, or 0 for player token at row and column.
 * 
 * 1 means immediate win. -1 means opponent will win next move. 0 otherwise.
 * Usage in computerMove: after doing the shuffle, track the highest score move, and make that move.
 */
function moveScoreTwoPly(tokens, row, column, player) {
    function isWinningMove(tokens, row, column, player) {
        //FIXME - This is terrible! Have a state object with update method. 
        return evalBoard(updateTokens(tokens, row, column, player), row, column) == player
    }
}