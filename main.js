// Grid div that holds cell divs.
const cellContainer = document.querySelector("#cell-container")

// Grid div that holds trigger buttons.
const triggerContainer = document.querySelector("#trigger-container")

// Either "red" or "yellow" innerText.
const turnIndicator = document.querySelector("#turn-indicator")

// Player alternates between 1 and -1.
let player = 1

const rowCount = 6
const colCount = 7

// Create 2D array of numnbers containing 0, 1, or -1 which
// is current board state (empty, player 1, or player -1),
// and add cell divs to cell container.
function initGrid() {
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
}

const grid = initGrid()

// Respond to column triggered:
// Find the position of the affected cell,
// Update UI and grid.
function playColumn(j) {
    // Func to read grid column.
    function readColumn(j) {
        const column = []
        for (let i = 0; i < rowCount; i++) {
            column.push(grid[i][j])
        }
        return column
    }

    // Func to update UI and grid.
    function setCell(i, j) {
        grid[i][j] = player
        const cell = cellContainer.children[i * colCount + j]
        console.log(cell)
        cell.style.backgroundColor = player == 1 ? 'red' : 'yellow'
    }

    // Scan column for empty cell for player to play:
    const column = readColumn(j)
    for (let i = rowCount - 1; i > -1; i--) {
        if (column[i] == 0) { // Empty cell found:
            setCell(i, j, player) // Update UI and grid.
            player *= -1 // Alternate player.
            turnIndicator.innerText = player == 1 ? 'red' : 'yellow' // Update turn indicator text.
            return
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