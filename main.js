const rowCount = 6
const columnCount = 7

function playerToColor(player) {
    if (player == 1) { // Player 1: red
        return 'red'
    } else if (player == -1) { // Player -1: yellow
        return 'yellow'
    } else {
        throw new Error('Player integer must be -1 or 1');
    }
}

class Board {
    /**
     * @param {HTMLDivElement} cellContainer
     * 
     * Populate cellContainer (div with display grid styling) with cells and create
     * tokens which is a 2D array containing -1, 0, and 1
     * (player 1, player -1, and empty spaces on the board).
     */
    constructor(cellContainer) {
        this.cellContainer = cellContainer
        this.tokens = []
        for (let i = 0; i < rowCount; i++) {
            const row = []
            for (let j = 0; j < columnCount; j++) {
                const cell = document.createElement('div')
                cell.classList.add('cell')
                cellContainer.appendChild(cell)
                row.push(0)
            }
            this.tokens.push(row)
        }
    }

    /**
     * @param {number} column
     * 
     * Return a row where the token would drop to.
     * If the row is filled, return -1.
     */
    findTokenDropRow(column) {
        // Start from bottom:
        for (let row = rowCount - 1; row > -1; row--) {
            if (this.tokens[row][column] == 0) {
                return row
            }
        }
        return -1
    }
    
    /**
     * @param {number} row
     * @param {number} column
     * @param {number} player
     * 
     * Update `this.tokens` (logical) and `this.cellContainer.children[index]` (DOM)
     * to reflect player's token in a certain row and column.
     */
    setToken(row, column, player) {
        this.tokens[row][column] = player
        const cell = this.cellContainer.children[row * columnCount + column]
        cell.style.backgroundColor = playerToColor(player)
    }

    /**
     * @param {number} rowLatest
     * @param {number} columnLatest
     * 
     * Returns whether playing at (`rowLatest`, `columnLatest`)
     * is a winning move, looks at `this.tokens`.
     */
    checkWin(rowLatest, columnLatest) {
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

        const playerToCheck = this.tokens[rowLatest][columnLatest]

        const lineLength = 7
        const horiz = readLine(this.tokens, rowLatest, columnLatest - 3, 0, 1, lineLength)
        const vert = readLine(this.tokens, rowLatest - 3, columnLatest, 1, 0, lineLength)
        const diagDown = readLine(this.tokens, rowLatest - 3, columnLatest - 3, 1, 1, lineLength)
        const diagUp = readLine(this.tokens, rowLatest + 3, columnLatest - 3, -1, 1, lineLength)
        return (
            fourInARow(horiz, playerToCheck) || fourInARow(vert, playerToCheck) ||
            fourInARow(diagDown, playerToCheck) || fourInARow(diagUp, playerToCheck)
        )
    }

    /**
     * Reset tokens to all zeros (logical) and cells to be white (DOM).
     */
    reset() {
        for (let i = 0; i < rowCount; i++) {
            for (let j = 0; j < columnCount; j++) {
                this.tokens[i][j] = 0
                const cell = this.cellContainer.children[i * columnCount + j]
                cell.style.backgroundColor = 'white'
            }
        }
    }
}

/**
 * Row of buttons for dropping tokens into a certain column,
 * one button per column.
 */
class ColumnTriggers {
    /**
     * @param {HTMLDivElement} triggerContainer
     * @param {CallableFunction} callback
     * 
     * Populate triggerContainer with buttons
     * and give each button a listener to trigger callback.
     */
    constructor(triggerContainer, callback) {
        this.triggerContainer = triggerContainer
        for (let column = 0; column < columnCount; column++) {
            const columnTrigger = document.createElement('button')
            columnTrigger.addEventListener('click', () => {
                callback(column)
            })
            columnTrigger.innerText = '↓'
            columnTrigger.classList.add('col-trigger')
            triggerContainer.appendChild(columnTrigger)
        }
    }

    enable() {
        for (const child of this.triggerContainer.children) {
            child.disabled = false
        }
    }

    disable() {
        for (const child of this.triggerContainer.children) {
            child.disabled = true
        }
    }
}

class ReplayButton {
    constructor(replayButton, callback) {
        this.replayButton = replayButton
        this.replayButton.addEventListener('click', callback)
    }

    enable() {
        this.replayButton.disabled = false
    }

    disable() {
        this.replayButton.disabled = true
    }
}

const infoText = document.querySelector('#info-text') // E.g. 'red turn', 'yellow wins'.
let player = 1 // Alternates between 1 and -1.
const board = new Board(document.querySelector('#cell-container'))
// These are the core events: dropping a token in a certain column, and playing again.
const columnTriggers = new ColumnTriggers(document.querySelector('#trigger-container'), dropToken)
const replayButton = new ReplayButton(document.querySelector('#replay-button'), replay)

function dropToken(column) {
    const row = board.findTokenDropRow(column)
    if (row == -1) {
        return  
    } 
    board.setToken(row, column, player)
    if (board.checkWin(row, column)) {
        infoText.innerText = `${playerToColor(player)} wins`
        columnTriggers.disable()
        replayButton.enable()
    } else {
        player *= -1
        infoText.innerText = `${playerToColor(player)} turn`
    }
}

function replay() {
    board.reset()
    columnTriggers.enable()
    replayButton.disable()
    player = 1
    infoText.innerText = 'red turn'
}