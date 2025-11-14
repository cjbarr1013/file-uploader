function isDescending(arr) {
  if (arr.length <= 1) {
    return true;
  }

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === null) {
      continue;
    }
    if (arr[i] < arr[i + 1]) {
      return false;
    }
  }

  return true;
}

function isAscending(arr) {
  if (arr.length <= 1) {
    return true;
  }

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === null) {
      continue;
    }
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }

  return true;
}

module.exports = {
  isDescending,
  isAscending,
};
