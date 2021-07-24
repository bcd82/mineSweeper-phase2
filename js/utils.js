function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function createMat(rows = 3, cols = 3, fillWith = '') {
  const mat = [];
  for (let i = 0; i < rows; i++) {
    mat[i] = [];
    for (let j = 0; j < cols; j++) {
      mat[i][j] = fillWith;
    }
  }
  return mat
}