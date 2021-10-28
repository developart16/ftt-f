
exports.checkNum = num => {

    if( typeof num !== 'number') throw new Error("Not a number");
    return num;

}


/**
 * Calculates the average of the given array of numbers
 * @param {number[]} numbers 
 * @throws will `throw` an `Error` if any of the elemets is not a number
 * @returns {number} `number`
 */
exports.calcAverage = numbers => {

    // checks every input to verify everythis is a type number
    const allNumbers = numbers.every( _num => typeof _num !== 'number' );
    if ( ! allNumbers ) throw new Error("Not a number");

    // sums all numbers starting from position 0
    const sumatory = numbers.reduce( ( _prevNum, _currNum ) => _prevNum + _currNum, 0 );
    const average = (sumatory / numbers.length );

    return average;
}