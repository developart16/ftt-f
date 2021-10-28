/**
 * Checks if the provided value is a correct timesatmp
 * @param {number} timestamp 
 * @throws will `throw` an `Error` if provided `timestamp` is not a number type
 * @returns {number} `number`
 */
exports.checkTimestamp = timestamp => {

    if ( ! timestamp || typeof timestamp !== 'number' ) throw new Error("Wrong Timestamp!");
    return timestamp;

}

/**
 * returns a `Date` format from provided timestamp
 * @param {number} timestamp 
 * @throws will `throw` an `Error` if provided `timestamp` is not a number type
 * @returns {Date} `Date`
 */
exports.getDate = timestamp => {
    
    this.checkTimestamp(timestamp);

    const date = new Date( timestamp * 1000 );

    return date;
}

/**
 * Formats timestamp in provided format
 * @param {number} timestamp the timestamp to format
 * @param {string} formatTo provides information about the desired format of output, default `Y-m-d H:i:s`
 * @param {boolean} prefix includes prefix `0` before any number below 10, example `2020-9-9 => 2020-09-09`
 * @throws will `throw` an `Error` if provided `timestamp` is not a number type
 * @returns {string} `string`
 */
exports.formatTimestamp = ( timestamp, formatTo = 'Y-m-d H:i:s', prefix = true ) => {

    this.checkTimestamp(timestamp);

    const addPrefix = _num => {
        if ( prefix && +_num < 10 ) return '0' + _num;
        return _num;
    }

    const date = this.getDate(timestamp);

    const year = date.getFullYear();
    const month = addPrefix( date.getMonth() );
    const day = addPrefix( date.getDate() );

    const hour = addPrefix( date.getHours() );
    const min = addPrefix( date.getMinutes() );
    const sec = addPrefix( date.getSeconds() );

    formatTo = formatTo.replace( 'Y', year );
    formatTo = formatTo.replace( 'm', month );
    formatTo = formatTo.replace( 'd', day );
    formatTo = formatTo.replace( 'H', hour );
    formatTo = formatTo.replace( 'i', min );
    formatTo = formatTo.replace( 's', sec );

    return formatTo;

}