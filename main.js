import { rowCount, columnCount, GameState, computerMove} from "./gameAnalysis.js"

function playerToColor(player) {
    if (player == 1) { // Player 1: red
        return 'red'
    } else if (player == -1) { // Player -1: yellow
        return 'yellow'
    } else {
        throw new Error('Player integer must be -1 or 1');
    }
}

class TokenUI {
    /**
     * @param {HTMLDivElement} cellContainer
     */
    constructor(cellContainer) {
        this.cellContainer = cellContainer
        for (let i = 0; i < rowCount * columnCount; i++) {
            const cell = document.createElement('div')
            cell.classList.add('cell')
            cellContainer.appendChild(cell)
        }
    }

    renderMove(move, player) {
        const {row, column} = move
        const cell = this.cellContainer.children[row * columnCount + column]
        cell.style.backgroundColor = playerToColor(player)
    }

    highlightMove(move) {
        const {row, column} = move
        const cell = this.cellContainer.children[row * columnCount + column] 
        cell.style.zIndex = '1'
        cell.style.outline = '7px solid cyan'
    }

    dehighlightMove(move) {
        const {row, column} = move
        const cell = this.cellContainer.children[row * columnCount + column] 
        cell.style.outline = 'none'
        cell.style.zIndex = '0'
    }

    reset() {
        for (let i = 0; i < rowCount * columnCount; i++) {
            const cell = this.cellContainer.children[i]
            cell.style.backgroundColor = 'white'
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

class Game {
    constructor() {
        this.infoText = document.querySelector('#info-text') // E.g. 'red turn', 'yellow wins'.
        this.tokenUI = new TokenUI(document.querySelector('#cell-container'))
        this.gameState = new GameState()
        this.columnTriggers = new ColumnTriggers(document.querySelector('#trigger-container'), this.#columnCallback.bind(this))
        this.vsComputer = false
    }

    #scoreMessage(score) {
        if (score == -1) {
            return 'yellow wins'
        }
        if (score == 1) {
            return 'red wins'
        }
        return 'draw'
    }

    #turnMessage(player) {
        if (player == -1) {
            return 'yellow turn'
        } else {
            return 'red turn'
        }
    }

    #gameOver(score) {
        this.infoText.innerText = this.#scoreMessage(score)
        this.columnTriggers.disable()
    }

    #dropToken(column) {
        if (this.gameState.lastMove) {
            this.tokenUI.dehighlightMove(this.gameState.lastMove)
        }
        this.gameState = this.gameState.childState(column)
        this.tokenUI.renderMove(this.gameState.lastMove, this.gameState.lastPlayer())
        this.tokenUI.highlightMove(this.gameState.lastMove)
        this.infoText.innerText = this.#turnMessage(-this.gameState.lastPlayer())
    }

    async #columnCallback(column) {
        this.#dropToken(column)
        const [score, isGameOver] = this.gameState.evaluate()
        if (isGameOver) {
            this.#gameOver(score)
        } else if (this.vsComputer) {
            this.columnTriggers.disable()
            const computerColumn = await this.#runComputerMoveAsync()
            this.#dropToken(computerColumn)
            this.columnTriggers.enable()
            const [score, isGameOver] = this.gameState.evaluate()
            if (isGameOver) {
                this.#gameOver(score)
            }
        }
    }

    // Running `computerMove` in this way sets priority to the browser
    // and makes it so it doesn't block browser UI updating.
    #runComputerMoveAsync() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const computerColumn = computerMove(this.gameState)
                resolve(computerColumn)
            }, 100);
        })
    }

    newGame() {
        this.tokenUI.dehighlightMove(this.gameState.lastMove)
        this.gameState = new GameState()
        this.tokenUI.reset()
        this.columnTriggers.enable()
        this.infoText.innerText = 'red turn'
    }
}

const game = new Game()
const newGameButton = document.querySelector('#new-game-button')
const overlay = document.querySelector('#overlay')
const vsComputerButton = document.querySelector('#vs-computer-button')
const vsHumanLocalButton = document.querySelector('#vs-human-local-button')
newGameButton.addEventListener('click', () => {overlay.style.display = 'block'; game.newGame()})
vsComputerButton.addEventListener('click', () => {overlay.style.display = 'none'; game.vsComputer = true})
vsHumanLocalButton.addEventListener('click', () => {overlay.style.display = 'none'; game.vsComputer = false})