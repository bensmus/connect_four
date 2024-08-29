const cellContainer = document.querySelector("#cell-container")
const triggerContainer = document.querySelector("#trigger-container")
const turnIndicator = document.querySelector("#turn-indicator")
let player = 1

const rowCount = 6
const colCount = 7

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

function playColumn(j) {
    function setCell(i, j) {
        grid[i][j] = player
        const cell = cellContainer.children[i * colCount + j]
        console.log(cell)
        cell.style.backgroundColor = player == 1 ? 'red' : 'yellow'
    }

    function readColumn(j) {
        const column = []
        for (let i = 0; i < rowCount; i++) {
            column.push(grid[i][j])
        }
        return column
    }

    const column = readColumn(j)
    for (let i = rowCount - 1; i > -1; i--) {
        if (column[i] == 0) {
            setCell(i, j, player)
            player *= -1
            turnIndicator.innerText = player == 1 ? 'red' : 'yellow'
            return
        }
    }
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