function printMat(mat, selector) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < mat.length; i++) {
    strHTML += '<tr>';
    for (var j = 0; j < mat[0].length; j++) {
      var cell = mat[i][j];
      var className = 'cell cell' + i + '-' + j;
      strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
    }
    strHTML += '</tr>'
  }
  strHTML += '</tbody></table>';
  var elContainer = document.querySelector(selector);
  elContainer.innerHTML = strHTML;
}

function copyMat(mat) {
  var newMat = [];
  for (var i = 0; i < mat.length; i++) {
      newMat[i] = []
      // newMat[i] = mat[i].slice();
      for (var j = 0; j < mat[0].length; j++) {
          newMat[i][j] = mat[i][j];
      }
  }
  return newMat;
}

// location such as: {i: 2, j: 7}
function renderCell(location, value) {
  // Select the elCell and set the value
  var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getEmptyCells() {
  var emptySpots = []
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      if (gBoard[i][j] === EMPTY) {
        emptySpots.push({
          i,
          j
        })
      }
    }
  }
  return emptySpots
}
function checkNegs(mat, pos) {
  for (var i = pos.i - 1; i <= pos.i + 1; i++) {
    if (i < 0 || i >= mat.length) continue

    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
      if (j < 0 || j >= mat.length) continue
      if (i === pos.i && j === pos.j) continue

      var cell = mat[i][j]
      console.log(cell);
    }
  }
}

function getNumsAverage(nums) {
  return getSum(nums) / nums.length
}

function getSum(nums){
   var sum = 0;
   for (var i = 0; i < nums.length; i++) {
       sum += nums[i]
   }
   return sum
}
function createMat(rows = 3, cols = 3,fillWith = '') {
  const mat = [];
  for (let i = 0; i < rows; i++) {
      mat[i] = [];
      for (let j = 0; j < cols; j++) {
          mat[i][j] = fillWith;
      }
  }
  return mat
}
function createMatWithFnc(rows = 3, cols = 3,fillWith = 0) {
  const mat = [];
  for (let i = 0; i < rows; i++) {
      mat[i] = [];
      for (let j = 0; j < cols; j++) {
          mat[i][j] = fillWith();
      }
  }
  return mat
}

// timer functions ? 

function startTimer() {
  gStartTime = Date.now()
  // var elTimer = document.querySelector('.timer span')
  gTimerInterval = setInterval(function () {
      var passedSeconds = (Date.now() - gStartTime) / 1000
      elTimer.innerText = passedSeconds.toFixed(3)
  }, 100);
}
