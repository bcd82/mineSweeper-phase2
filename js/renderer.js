'use strict'

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
            if (cell.isMarked) classesStr += 'marked'
            strHTML += `<td class="${classesStr}" onmousedown="cellClicked(event,${i},${j})"> ${cellContent} </td>`
        }
        strHTML += '</tr>'
    }

    var elContainer = document.querySelector('tbody');
    elContainer.innerHTML = strHTML;
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
    } else if (gGame.playerLives === 0) {
        heartStr = NO_HEARTS
    } else if (!gGame.playerLive) {
        btnIcon = UNDO_FACE
    }
    setPlayImg(btnIcon)
    elLives.innerText = heartStr;
}

function showModal(gameResult) {
    var elModal = document.querySelector('.modal')
    elModal.classList.remove('hidden')
    elModal.classList.add('modal-pos')
    if (gameResult === 'win') {
        elModal.querySelector('h1').innerText = 'YAY !\n you are a mine sweeping master \n I\'m proud of you'
    } else {
        elModal.querySelector('h1').innerText = 'Sad face :( \n you were blown up.\n R.I.P you '

    }
}

function hideModal() {
    var elModal = document.querySelector('.modal')
    elModal.classList.remove('modal-pos')
    setTimeout(() => {
        elModal.classList.add('hidden')
    }, 500)
}

function setPlayImg(icon) {
    var elBtn = document.querySelector('.game-btn p');
    elBtn.innerText = icon;
}

function resetHints() {
    var elHints = document.querySelectorAll('.hint')
    elHints.forEach(hint => {
        hint.classList.remove('used');
        hint.disabled = false;
    });
}

function renderLocalFastTime() {
    var elFastTimeSpan = document.querySelector('.fast-time');
    if (gLevel.SIZE === 4) {
        elFastTimeSpan.innerText = gFastestTimes.beginnerTime ? gFastestTimes.beginnerTime : '0.00';
    } else if (gLevel.SIZE === 8) {
        elFastTimeSpan.innerText = gFastestTimes.mediumTime ? gFastestTimes.mediumTime : '0.00';
    } else {
        elFastTimeSpan.innerText = gFastestTimes.expertTime ? gFastestTimes.expertTime : '0.00';
    }
}

function changeBgClr(result) {
    if (result === 'win') {
        document.querySelector('.background-overlay').classList.add('win')
        document.querySelector('.background-overlay').classList.add('half-opacity')
    } else {
        document.querySelector('.background-overlay').classList.add('dead')
        document.querySelector('.background-overlay').classList.add('half-opacity')
    }
}

function removeBgClr() {
    document.querySelector('.background-overlay').classList.remove('half-opacity')
    setTimeout(() => {
        document.querySelector('.background-overlay').classList.remove('dead')
        document.querySelector('.background-overlay').classList.remove('win')
    }, 2000)

}