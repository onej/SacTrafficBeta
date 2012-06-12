if (typeof Array.prototype.max === 'undefined') {
  Array.prototype.max = function () {
    return Math.max.apply(null, this);
  }
}

if (typeof Array.prototype.min === 'undefined') {
  Array.prototype.min = function () {
    return Math.min.apply(null, this);
  }
}
