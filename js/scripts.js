'use strict'
const MINE = '<img class="mine" src="./img/mine.png" alt="mine"/>'
const MARKED = '🚩'
const HEART = '❤'
const HAPPY_FACE = '😀'
const NEUTRAL_FACE = '😐'
const WORRIED_FACE = '😯'
const DEAD_FACE = '💀'
const WIN_FACE = '🥳'
const UNDO_FACE = '🤔'

var gBoard;
var gLevel = {
    SIZE: 4,
    MINES: 3
}
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    timerInterval: null,
    secsPassed: 0,
    startTime: 0,
    playerLives: 3
}
var gBoardHistoryStates;
var gGameHistoryStates;
var gFastestTimes;
var gTimerInterval;

function initGame() {
    if (gTimerInterval) {
        clearInterval(gTimerInterval)
    }
    clearTimer()
    hideModal()
    gBoard = buildBoard(gLevel.SIZE)

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        startTime: 0,
        playerLives: 3,
        isHintActive: false,
        isFirstClick: true
    }
    getLocalStorageTimes()
    renderBoard(gBoard)
    renderLife()
    resetHints()
    renderLocalFastTime()
    setPlayImg(HAPPY_FACE)
    gBoardHistoryStates = []
    gGameHistoryStates = []

    // console.log(gBoard)
}

function buildBoard(size) {
    var board = createMat(size, size)
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
        }
    }
    return board;
}

function placeMines(board, firstPos) {
    // will randomly place mines after first click
    var tempBoard = getBoardPos(board, firstPos)
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdx = getRandomInt(0, tempBoard.length)
        var randPos = tempBoard[randIdx]
        console.log(tempBoard[randIdx])
        board[randPos.i][randPos.j].isMine = true;
        tempBoard.splice(randIdx, 1)
    }
}

function getBoardPos(board, firstPos) {
    var emptySpots = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (i === firstPos.i && j === firstPos.j) continue
            emptySpots.push({
                i,
                j
            })
        }
    }
    return emptySpots
}

function setMineNegCount(board) {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            board[i][j].minesAroundCount = getMinesNegCount(board, i, j)
        }
    }
}

function getMinesNegCount(board, posI, posJ) {
    var count = 0;

    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (i === posI && j === posJ) continue
            var cell = board[i][j]
            if (cell.isMine) count++
        }
    }
    return count
}

function cellClicked(event, i, j) {

    if (!gGame.isOn) return
    // console.log(event.button, event.target);
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (event.button === 0) {
        if (gGame.isFirstClick) {
            {
                gGame.isFirstClick = false
                startTimer()
                placeMines(gBoard, {
                    i,
                    j
                })
                setMineNegCount(gBoard)
            }
        }
        cloneGameState()
        if (gGame.isHintActive) {
            hintShow({
                i,
                j
            }, gBoard)
            renderBoard(gBoard)
            return
        }
        if (cell.isMarked) return
        if (cell.isMine) {
            gGame.playerLives--;
            renderLife()
            cell.isShown = true;
        }
        showCell(i, j, gBoard)
    }
    if (event.button === 2) {
        cellMarked(i, j, gBoard)
    }

    renderBoard(gBoard)
    checkGameOver()

}

function showCell(posI, posJ, board) {
    var cell = gBoard[posI][posJ]
    cell.isShown = true;
    gGame.shownCount++;


    if (cell.minesAroundCount === 0 && !cell.isMine) {
        expandShow({
            i: posI,
            j: posJ
        }, board)
    }
}

function expandShow(pos, board) {

    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (i === pos.i && j === pos.j) continue
            var cell = board[i][j]
            if (cell.isMarked) continue
            if (!cell.isShown) {
                cell.isShown = true;
                gGame.shownCount++;
                if (cell.minesAroundCount === 0 && !cell.isMine) {
                    expandShow({
                        i: i,
                        j: j
                    }, board)
                }
            }
        }
    }
}

function hintShow(pos, board) {
    gGame.isHintActive = false;
    var exposedCells = [];
    var exposedCellsVisibility = [];
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue
            var cell = board[i][j]
            exposedCells.push(cell)
            exposedCellsVisibility.push(cell.isShown)
        }
    }
    for (var idx = 0; idx < exposedCells.length; idx++) {
        exposedCells[idx].isShown = true;
    }
    setTimeout(() => {
        for (var idx = 0; idx < exposedCells.length; idx++) {
            exposedCells[idx].isShown = exposedCellsVisibility[idx];
        }
        renderBoard(gBoard)
    }, 1000)
}

function cellMarked(i, j, board) {
    var cell = board[i][j];
    if (cell.isShown) return
    cell.isMarked = cell.isMarked ? false : true;
    gGame.markedCount = cell.isMarked ? ++gGame.markedCount : --gGame.markedCount;
    // console.log(gGame.markedCount)
}

function checkGameOver() {
    if (gGame.playerLives > 0) {
        var minesNotShown = gLevel.MINES - (3 - gGame.playerLives);
        // console.log('needs to be shown to win:', ((gLevel.SIZE ** 2) - (gGame.markedCount)))
        // console.log('shown', gGame.shownCount)
        if (gGame.markedCount === minesNotShown) {
            if (gGame.shownCount === ((gLevel.SIZE ** 2) - (gGame.markedCount))) {
                winGame()
                console.log('won')
            }
        }
    } else {
        console.log('lost')
        loseGame()
    }
}

function startTimer() {
    gGame.startTime = Date.now()
    var elTimer = document.querySelector('.timer')
    gTimerInterval = setInterval(function () {
        gGame.secsPassed = (Date.now() - gGame.startTime) / 1000
        elTimer.innerText = gGame.secsPassed.toFixed(2)
    }, 100);

}

function clearTimer() {
    document.querySelector('.timer').innerText = '0:00'
}

function winGame() {
    showModal('win')
    for (var i = 0; i < gBoard.length; i++)
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j]
            cell.isShown = true;
        }
    setPlayImg(WIN_FACE)
    checkLocalStorageTime()
    gameOver()

}

function loseGame() {
    showModal('lose')
    for (var i = 0; i < gBoard.length; i++)
        for (var j = 0; j < gBoard.length; j++) {
            var cell = gBoard[i][j]
            if (cell.isMine) cell.isShown = true;
        }
    setPlayImg(DEAD_FACE)
    gameOver()
}

function gameOver() {
    gGame.isOn = false
    clearInterval(gTimerInterval)
    renderBoard(gBoard)
}

function changeSize(size) {
    gLevel.SIZE = size;
    gLevel.MINES = size === 4 ? 3 : Math.floor(size ** 2 / 6);
    gameOver()
    initGame()
}

function getLocalStorageTimes() {
    gFastestTimes = localStorage;
    console.log(gFastestTimes)

}

function renderLocalFastTime() {
    var elFastTimeSpan = document.querySelector('.fast-time');
    if (gLevel.SIZE === 4) {
        elFastTimeSpan.innerText = gFastestTimes.beginnerTime ? gFastestTimes.beginnerTime : '0:000';
    } else if (gLevel.SIZE === 8) {
        elFastTimeSpan.innerText = gFastestTimes.mediumTime ? gFastestTimes.mediumTime : '0:000';
    } else {
        elFastTimeSpan.innerText = gFastestTimes.expertTime ? gFastestTimes.expertTime : '0:000';
    }
}

function setHintActive(el) {
    gGame.isHintActive = true;
    el.classList.add('hidden')
}