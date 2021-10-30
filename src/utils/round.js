/**
 * Redondea numeros con 2 decimales
 * @param {number} numero 
 * @returns 
 */
 exports.numRound = (numero) => Math.round((numero + Number.EPSILON) * 100) / 100