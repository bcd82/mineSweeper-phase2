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
var gGame
var gBoardHistoryStates;
var gGameHistoryStates;
var gFastestTimes;
var gTimerInterval;

function initGame() {
    if (gTimerInterval) clearInterval(gTimerInterval)
    gBoard = buildBoard(gLevel.SIZE)
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        startTime: 0,
        playerLives: 3,
        isHintActive: false,
        isFirstClick: true,
        safeClicks: 3,
        isSafeClickActive: false,
        isManualMode: false,
        isManualGame: false
    }
    getLocalStorageTimes()
    resetDOMElements()
    renderBoard(gBoard)

    gBoardHistoryStates = []
    gGameHistoryStates = []
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
    var cell = gBoard[i][j]
    if (cell.isShown) return
    if (event.button === 0) {
        if (gGame.isManualMode) {
            cell.isMine = true
            cell.isShown = true;
            renderBoard(gBoard)
            return
        }
        if (gGame.isFirstClick) {
            {
                gGame.isFirstClick = false
                if (!gGame.isManualGame) {
                    
                    placeMines(gBoard, {
                        i,
                        j
                    })
                }
                startTimer()
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

function changeSize(size, elBtn) {
    if(gGame.isManualMode) return;
    gLevel.SIZE = size;
    gLevel.MINES = size === 4 ? 3 : Math.floor(size ** 2 / 6);
    var elBtns = document.querySelectorAll('.size-btn')
    elBtns.forEach(btn => {
        btn.classList.remove('selected')
    });
    elBtn.classList.add('selected');
    gameOver()
    initGame()
}

function getLocalStorageTimes() {
    gFastestTimes = localStorage;
    console.log(gFastestTimes)

}

function setHintActive(el) {
    if (gGame.isHintActive || !gGame.isOn|| gGame.isManualMode) return
    gGame.isHintActive = true;
    el.classList.add('used')
    el.disabled = true;
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

function showRandomSafeCell() {
    if (gGame.isSafeClickActive || !gGame.isOn || gGame.isManualMode) return
    else {
        if (gGame.safeClicks <= 0) return
        gGame.isSafeClickActive = true;
        var safeCells = getSafeCells(gBoard)
        var randIdx = safeCells[getRandomInt(0, safeCells.length)]

        var elCell = document.querySelector(`td[onmousedown*='${randIdx.i},${randIdx.j}']`)
        elCell.classList.add('safe-cell')
        console.log(elCell)
        gGame.safeClicks--
        setTimeout(() => {
            elCell.classList.remove('safe-cell')
            gGame.isSafeClickActive = false
        }, 3000)
    }

    document.querySelector('.safe-text span').innerText = gGame.safeClicks;
}

function getSafeCells(board) {
    var safeCells = []
    for (var i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            var cell = board[i][j];
            if (!cell.isMine && !cell.isMarked && !cell.isShown) {
                safeCells.push({
                    i,
                    j
                })
            }
        }
    }
    return safeCells
}

function resetDOMElements() {
    clearTimer()
    hideModal()
    renderLife()
    resetHints()
    renderLocalFastTime()
    document.querySelector('.safe-text span').innerText = gGame.safeClicks;
    document.querySelector('.manual').classList.remove('hidden');
    setPlayImg(HAPPY_FACE)
}

function setManualMode(elBtn) {
    if (!gGame.isManualMode) {
        gGame.isManualMode = true;
        elBtn.classList.add('manual-selected')
        console.log('manual mode on')
        elBtn.innerText="PLAY"           

    } else {
        var count= 0;
        for (var i = 0; i < gBoard.length; i++) {
            for (let j = 0; j < gBoard.length; j++) {
                if (gBoard[i][j].isShown) count++  
                gBoard[i][j].isShown = false
            }
            if (count > 0) {
                gGame.isManualGame = true;
                gLevel.MINES = count  
                elBtn.classList.add('hidden')            
            } 
            else {
                gGame.isManualGame = false;
            }
            renderBoard(gBoard)
        }
        elBtn.innerText="MANUAL"           
        elBtn.classList.remove('manual-selected')
        console.log('manual mode off')
        gGame.isManualMode = false

    }
}