/**
 * 
 * @param {number} initial 
 * @param {number} current 
 * @returns 
 */
exports.getPercentage = (initial, current) => (( (initial - current) / initial ) * -100)