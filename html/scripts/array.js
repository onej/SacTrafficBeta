/**
 * @fileoverview Array extensions.
 */

if (typeof Array.prototype.max === 'undefined') {
  /**
   * Returns the largest value in an array.
   */
  Array.prototype.max = function () {
    return Math.max.apply(null, this);
  }
}

if (typeof Array.prototype.min === 'undefined') {
  /**
   * Returns the smallest value in an array.
   */
  Array.prototype.min = function () {
    return Math.min.apply(null, this);
  }
}

if (typeof Array.prototype.indexOf === 'undefined') {
  // For IE8
  Array.prototype.indexOf = function (elem) {
			len = this.length;

			for (var i = 0; i < len; i++) {
				if ( i in this && this[ i ] === elem ) {
					return i;
				}
			}
		}
}
