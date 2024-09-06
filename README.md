# About
Source code for JavaScript connect four with 'local PVP' and 'vs computer' modes.
[Try it out](connect-four-1234.surge.sh)

# How 'vs computer' works
The computer uses depth 5 [minimax](https://en.wikipedia.org/wiki/Minimax) 
with a heuristic function which prefers placing tokens in the center of the board.

The core of the algorithm is in the `getMinimaxScore(depthLimit)` function in `gameAnalysis.js`.