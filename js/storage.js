'use strict'

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
    gBoardHistoryStates.push(histories)
    var temp = {
        shownCount: gGame.shownCount,
        markedCount: gGame.markedCount,
        playerLives: gGame.playerLives
    }
    gGameHistoryStates.push(temp);
    if (gBoardHistoryStates.length > 1) {
        document.querySelector('.undo-btn').classList.remove('selected')
    }
}

function loadPrevGameState(el) {
    if (gBoardHistoryStates.length <= 1 || !gGame.isOn) return
    //console.log(gGameHistoryStates)
    gBoard = gBoardHistoryStates[gBoardHistoryStates.length - 1]
    gBoardHistoryStates.pop()
    gGame.shownCount = gGameHistoryStates[gGameHistoryStates.length - 1].shownCount
    gGame.markedCount = gGameHistoryStates[gGameHistoryStates.length - 1].markedCount
    gGame.playerLives = gGameHistoryStates[gGameHistoryStates.length - 1].playerLives
    gGameHistoryStates.pop()
    renderBoard(gBoard)
    renderLife()
    if (gBoardHistoryStates.length <= 1) {
        if (gBoardHistoryStates.length <= 1) {
            el.classList.add('selected')
        }
    }
}

function checkLocalStorageTime() {
    let timeToComplete = gGame.secsPassed
    if (gLevel.SIZE === 4) {
        if (+gFastestTimes.beginnerTime > +timeToComplete || !gFastestTimes.beginnerTime) {
            gGame.isNewFastestTime = true;
            localStorage.setItem('beginnerTime', timeToComplete)
        }
    } else if (gLevel.SIZE === 8) {
        debugger
        if (+gFastestTimes.mediumTime > +timeToComplete || !gFastestTimes.mediumTime) {
            localStorage.setItem('mediumTime', timeToComplete)
            gGame.isNewFastestTime = true;
        }
    } else {
        if (+gFastestTimes.expertTime > +timeToComplete || !gFastestTimes.expertTime) {
            gGame.isNewFastestTime = true;
            localStorage.setItem('expertTime', timeToComplete)
        }
    }
    //console.log(localStorage)
}

function getLocalStorageTimes() {
    gFastestTimes = localStorage;
    //console.log(gFastestTimes)
}