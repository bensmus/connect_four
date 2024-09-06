import { GameState } from './gameAnalysis.js'

console.log('Hello from test.js')

//  ------------------------

const playerWin2 = new GameState() // With perfect play on both sides, player will always win after computer move.
    .childState(3)
    .childState(3)
    .childState(4)
    .childState(4)
    .childState(5)

console.assert(playerWin2.lastPlayer() == 1)
console.assert(playerWin2.getMinimaxScore(0) == 0)
console.assert(playerWin2.getMinimaxScore(1) == 0)
console.assert(playerWin2.getMinimaxScore(2) == 1)

// ------------------------

const playerWin3 = new GameState() // Moves: player, computer, player (player wins).
    .childState(3)
    .childState(3)
    .childState(4)
    .childState(4)

console.assert(playerWin3.lastPlayer() == -1)
console.assert(playerWin3.getMinimaxScore(0) == 0)
console.assert(playerWin3.getMinimaxScore(1) == 0)
console.assert(playerWin3.getMinimaxScore(2) == 0)
console.assert(playerWin3.getMinimaxScore(3) == 1)

// ------------------------

const computerWin1 = new GameState() // Moves: computer (computer wins).
    .childState(6)
    .childState(5)
    .childState(4)
    .childState(4)
    .childState(3)
    .childState(3)
    .childState(2)
    .childState(5)
    .childState(2)

console.assert(computerWin1.lastPlayer() == 1)
console.assert(computerWin1.getMinimaxScore(0) == 0)
console.assert(computerWin1.getMinimaxScore(1) == -1)

// ------------------------

const computerWin2 = new GameState() // Moves: player, computer (computer wins).
    .childState(0) // 1
    .childState(3) // -1
    .childState(0) // 1
    .childState(4) // -1
    .childState(0) // 1
    .childState(0) // -1
    .childState(6) // 1
    .childState(2) // -1

console.assert(computerWin2.lastPlayer() == -1)
console.assert(computerWin2.getMinimaxScore(0) == 0)
console.assert(computerWin2.getMinimaxScore(1) == 0)
console.assert(computerWin2.getMinimaxScore(2) == -1)