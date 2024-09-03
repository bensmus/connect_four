import { evalBoard, findTokenDropRow, computerMove} from "./gameAnalysis.js"

export const rowCount = 6
export const columnCount = 7

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
     * Populate cellContainer (div with display grid styling) with cells and create
     * tokens which is a 2D array containing -1, 0, and 1
     * (player 1, player -1, and empty spaces on the board).
     * 
     * @param {HTMLDivElement} cellContainer
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
     * Update `this.tokens` (logical) and `this.cellContainer.children[index]` (DOM)
     * to reflect player's token in a certain row and column.
     * 
     * @param {number} row
     * @param {number} column
     * @param {number} player
     */
    setToken(row, column, player) {
        this.tokens[row][column] = player
        const cell = this.cellContainer.children[row * columnCount + column]
        cell.style.backgroundColor = playerToColor(player)
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
     * Populate triggerContainer with buttons
     * and give each button a listener to trigger callback.
     * 
     * @param {HTMLDivElement} triggerContainer
     * @param {CallableFunction} callback
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

const infoText = document.querySelector('#info-text') // E.g. 'red turn', 'yellow wins'.
let player = 1 // Alternates between 1 and -1.
const board = new Board(document.querySelector('#cell-container'))
// These are the core events: dropping a token in a certain column, and playing again.
const columnTriggers = new ColumnTriggers(document.querySelector('#trigger-container'), handleColumnTrigger)

let vsComputer = true
const newGameButton = document.querySelector('#new-game-button')
const overlay = document.querySelector('#overlay')
const vsComputerButton = document.querySelector('#vs-computer-button')
const vsHumanLocalButton = document.querySelector('#vs-human-local-button')
newGameButton.addEventListener('click', () => {overlay.style.display = 'block'})
vsComputerButton.addEventListener('click', () => {newGame(true)})
vsHumanLocalButton.addEventListener('click', () => {newGame(false)})

function newGame(vsComputerVal) {
    vsComputer = vsComputerVal
    overlay.style.display = 'none'
    board.reset()
    columnTriggers.enable()
    player = 1
    infoText.innerText = 'red turn'
}

function scoreMessage(score) {
    if (score == -1) {
        return 'yellow wins'
    }
    if (score == 1) {
        return 'red wins'
    }
    return 'draw'
}

// Either:
// a) column trigger does nothing because column is full OR
// b) column trigger drops token and player wins OR
// c) column trigger drops token and is next turn.
function handleColumnTrigger(column) {
    const row = findTokenDropRow(board.tokens, column)
    if (row == -1) { // a) Column is full:
        return
    } 
    board.setToken(row, column, player)
    const [score, gameOver] = evalBoard(board.tokens, row, column)
    if (gameOver) { // b) Player wins or draw:
        infoText.innerText = scoreMessage(score)
        columnTriggers.disable()
    } else { // c) Next turn:
        if (vsComputer) { // Computer makes move:
            const [row, column] = computerMove(board.tokens)
            board.setToken(row, column, -1)
            const [score, gameOver] = evalBoard(board.tokens, row, column)
            if (gameOver) { // Computer wins or draw:
                infoText.innerText = scoreMessage(score)
                columnTriggers.disable()   
            }
            // Computer did not win.
        } else { // Allow next human player to make move:
            player *= -1
            infoText.innerText = `${playerToColor(player)} turn`
        }
    }
}
