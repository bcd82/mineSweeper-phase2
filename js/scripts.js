'use strict'
const MINE = '<img class="mine" src="./img/mine.png" alt="mine"/>'
const MARKED = '🚩'
const HEART = '❤'
const HAPPY_FACE = '😀'
const NEUTRAL_FACE = '😐'
const WORRIED_FACE = '😯'
const DEAD_FACE = '💀'
const WIN_FACE = '🥳'

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
var gHistoryStates = []
var gFastestTimes;

function initGame() {
    if (gGame.timerInterval) {
        clearInterval(gGame.timerInterval)
    }
    clearTimer()
    hideModal()
    gBoard = buildBoard(gLevel.SIZE)

    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        timerInterval: null,
        secsPassed: 0,
        startTime: 0,
        playerLives: 3
    }
    getLocalStorageTimes()
    renderBoard(gBoard)
    renderLife()
    renderLocalFastTime()
    setPlayImg(HAPPY_FACE)

    // console.log(gBoard)
}

function cloneGameState() {
    var histories = []
    for (let i = 0; i < gBoard.length; i++) {
        histories[i] = []
        for (let j = 0; j < gBoard.length; j++) {
            histories[i][j] = {
                minesAroundCount: gBoard[i][j].minesAroundCount,
                isShown: gBoard[i][j].isShown,
                isMine: gBoard[i][j].isMine,
                isMarked: gBoard[i][j].isMarked
            }

        }
    }
    gHistoryStates.push(histories)
}
// , {
//     isON: gGame.isOn,
//     shownCount: gGame.shownCount,
//     markedCount: gGame.markedCount,
//     timerInterval: gGame.timerInterval,
//     secsPassed: gGame.secsPassed,
//     startTime: gGame.startTime,
//     playerLives: gGame.playerLives
// }
function loadPrevGameState() {
    if (gHistoryStates.length === 0) return
    console.log(gHistoryStates)
    gBoard = gHistoryStates.pop()
    renderBoard(gBoard)
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

function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        var rowClass = ''
        if (gLevel.SIZE === 4) {
            rowClass = 'beginner'
        } else if (gLevel.SIZE === 8) {
            rowClass = 'medium'
        } else {
            rowClass = 'expert'

        }
        strHTML += `<tr class="${rowClass}">`;
        for (var j = 0; j < board.length; j++) {
            var cell = board[i][j];
            var cellContent = '';
            if (cell.isShown) {
                cellContent = cell.minesAroundCount !== 0 ? cell.minesAroundCount : ''
                if (cell.isMine)
                    cellContent = MINE

            } else if (cell.isMarked)
                cellContent = MARKED
            var colorClassStr = ''
            if (cell.minesAroundCount !== 0) {
                switch (cell.minesAroundCount) {
                    case 1:
                        colorClassStr = 'blue'
                        break;
                    case 2:
                        colorClassStr = 'green'
                        break;
                    case 3:
                        colorClassStr = 'red'
                        break;
                    case 4:
                        colorClassStr = 'darkblue'
                        break;
                    case 5:
                        colorClassStr = 'pink'
                        break;
                    case 6:
                        colorClassStr = 'salmon'
                        break;
                    case 7:
                        colorClassStr = 'purple'
                        break;
                    case 8:
                        colorClassStr = 'yellow'
                        break;
                    default:
                        break;
                }
            }
            var classesStr = `cell ${colorClassStr} ${cell.isShown ? 'shown': ''}`
            if (cell.isShown && cell.isMine) {
                classesStr += ' mine-bg'
            }
            strHTML += `<td class="${classesStr}" onmousedown="cellClicked(event,${i},${j})"> ${cellContent} </td>`
        }
        strHTML += '</tr>'
    }

    var elContainer = document.querySelector('tbody');
    elContainer.innerHTML = strHTML;
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
    if (!gGame.shownCount)
        startTimer()
    if (event.button === 0) {
        if (!gGame.shownCount) {
            {
                placeMines(gBoard, {
                    i,
                    j
                })
                setMineNegCount(gBoard)
            }
        }
        cloneGameState()

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
    cloneGameState()

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
    gGame.timerInterval = setInterval(function () {
        gGame.secsPassed = (Date.now() - gGame.startTime) / 1000
        elTimer.innerText = gGame.secsPassed.toFixed(3)
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
    clearInterval(gGame.timerInterval)
    renderBoard(gBoard)
}

function changeSize(size) {
    gLevel.SIZE = size;
    gLevel.MINES = size === 4 ? 3 : Math.floor(size ** 2 / 6);
    gameOver()
    initGame()
}

function renderLife() {
    var elLives = document.querySelector('.lives')
    var heartStr = ''
    var btnIcon;
    for (var i = 0; i < gGame.playerLives; i++) {
        heartStr += HEART
    }
    if (gGame.playerLives === 2) {
        btnIcon = NEUTRAL_FACE;
    } else if (gGame.playerLives === 1) {
        btnIcon = WORRIED_FACE;
    }
    setPlayImg(btnIcon)
    elLives.innerText = heartStr;
}

function showModal(gameResult) {
    var elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
    if (gameResult === 'win') {
        elModal.querySelector('h1').innerText = 'YAY !\n you are a mine sweeping master \n good for you dude'
    } else {
        elModal.querySelector('h1').innerText = 'Sad face !\n you were blown up :(\n R.I.P you '

    }
}

function hideModal() {
    var elModal = document.querySelector('.modal')
    elModal.classList.add('hidden')
}

function setPlayImg(icon) {
    var elBtn = document.querySelector('.game-btn');
    elBtn.innerText = icon;
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
    } else  {
        elFastTimeSpan.innerText = gFastestTimes.expertTime ? gFastestTimes.expertTime : '0:000';
    }
}

function checkLocalStorageTime() {
    let timeToComplete = document.querySelector('.timer').innerText
    if (gLevel.SIZE === 4) {
        if (+gFastestTimes.beginnerTime > +timeToComplete || !gFastestTimes.beginnerTime)
            localStorage.setItem('beginnerTime', timeToComplete)
    } else if (gLevel.SIZE === 8) {
        if (+gFastestTimes.mediumTime > +timeToComplete || !gFastestTimes.mediumTime)
            localStorage.setItem('mediumTime', timeToComplete)
    } else {
        if (+gFastestTimes.expertTime > +timeToComplete || !gFastestTimes.expertTime)
            localStorage.setItem('expertTime', timeToComplete)
    }
    console.log(localStorage)
}