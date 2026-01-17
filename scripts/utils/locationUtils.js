/**
 * 
 * @param {{x: number, y: number, z: number}} startPos 
 * @param {{x: number, y: number, z: number}} endPos 
 * @returns {number}
 */
export function getDistance(startPos, endPos) {
    const distance = Math.sqrt(
        (startPos.x - endPos.x) ** 2 + (startPos.y - endPos.y) ** 2 + (startPos.z - endPos.z) ** 2
    );
    return distance;
}