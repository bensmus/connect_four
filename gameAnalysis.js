import { rowCount, columnCount } from "./main.js";

/**
 * Returns 1 if player 1 won, -1 if player -1 won, and 0 otherwise.
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