// Grid div that holds cell divs.
const cellContainer = document.querySelector("#cell-container")

// Grid div that holds trigger buttons.
const triggerContainer = document.querySelector("#trigger-container")

// Either "red" or "yellow" innerText.
const infoText = document.querySelector("#info-text")

// Player alternates between 1 and -1.
let player = 1

const rowCount = 6
const colCount = 7

// Create 2D array of numbers containing 0, 1, or -1 which
// is current board state (empty, player 1, or player -1),
// and add cell divs to cell container.
const grid = (function initGrid() {
    const grid = []
    for (let i = 0; i < rowCount; i++) {
        const row = []
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('div')
            cell.classList.add('cell')
            cellContainer.appendChild(cell)
            row.push(0)
        }
        grid.push(row)
    }
    return grid
})()


// Respond to column triggered:
// Find the position of the affected cell,
// Update UI and grid.
function playColumn(j) {
    // Func to get player color.
    function playerColor(player) {
        return player == 1 ? 'red' : 'yellow' 
    }

    function readLine(iStart, jStart, iDelta, jDelta, count) {
        const line = []
        let i = iStart
        let j = jStart
        for (let x = 0; x < count; x++) {
            if (i < rowCount && i >= 0 && j < colCount && j >= 0) {
                line.push(grid[i][j])
            }
            i += iDelta
            j += jDelta
        }
        return line
    }
    
    // Func to read grid column.
    function readColumn(j) {
        return readLine(0, j, 1, 0, rowCount)
    }

    // Func to update UI and grid.
    function setCell(i, j) {
        grid[i][j] = player
        const cell = cellContainer.children[i * colCount + j]
        cell.style.backgroundColor = playerColor(player)
    }

    // Func to check win, given i, j move was the last one made.
    function checkWin(i, j) {
        const playerToCheck = grid[i][j]
        const lineLength = 7
        const horiz = readLine(i, j - 3, 0, 1, lineLength)
        const vert = readLine(i - 3, j, 1, 0, lineLength)
        const diagDown = readLine(i - 3, j - 3, 1, 1, lineLength)
        const diagUp = readLine(i + 3, j - 3, -1, 1, lineLength)
        console.log({
            'horiz': horiz,
            'vert': vert,
            'diagDown': diagDown,
            'diagUp': diagUp
        })
        return false
    }

    // Scan column for empty cell for player to play:
    const column = readColumn(j)

    for (let i = rowCount - 1; i > -1; i--) {
        if (column[i] == 0) { // Empty cell found:
            setCell(i, j, player) // Update cell color and grid.
            if (checkWin(i, j)) { // Update text and disable all triggers.
                infoText.innerText = `${playerColor(player)} wins`
                for (child of triggerContainer.children) {
                    child.disabled = true
                }
                break // Winning move.
            }
            player *= -1 // Alternate player.
            infoText.innerText = `${playerColor(player)} turn` // Update turn indicator text.
            break // Found empty cell, done handling column triggered.
        }
    }

    // If here, empty cell not found, player not updated, no action taken.
}

for (let i = 0; i < colCount; i++) {
    const colTrigger = document.createElement('button')
    colTrigger.innerText = '↓'
    colTrigger.classList.add('col-trigger')
    colTrigger.addEventListener('click', () => {
        playColumn(i)
    })
    triggerContainer.appendChild(colTrigger)
}