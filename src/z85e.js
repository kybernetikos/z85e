// This file is adapted from the original c# code https://github.com/coenm/Z85e
// which is MIT licensed and copyright CoenM

const base256_1 = 256
const base256_2 = 256 * 256
const base256_3 = 256 * 256 * 256
const base85_1 = 85
const base85_2 = 85 * 85
const base85_3 = 85 * 85 * 85
const base85_4 = 85 * 85 * 85 * 85

const Base85CharCodes = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
    'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
    'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D',
    'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', '.', '-', ':', '+', '=', '^', '!', '/',
    '*', '?', '&', '<', '>', '(', ')', '[', ']', '{',
    '}', '@', '%', '$', '#'
].map(chr => chr.charCodeAt(0))

const CharCodeToBase85 = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x44, 0x00, 0x54, 0x53, 0x52, 0x48, 0x00,
    0x4B, 0x4C, 0x46, 0x41, 0x00, 0x3F, 0x3E, 0x45,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
    0x08, 0x09, 0x40, 0x00, 0x49, 0x42, 0x4A, 0x47,
    0x51, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A,
    0x2B, 0x2C, 0x2D, 0x2E, 0x2F, 0x30, 0x31, 0x32,
    0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A,
    0x3B, 0x3C, 0x3D, 0x4D, 0x00, 0x4E, 0x43, 0x00,
    0x00, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F, 0x10,
    0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18,
    0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20,
    0x21, 0x22, 0x23, 0x4F, 0x00, 0x50, 0x00, 0x00
]

export function decode(str) {
    const size = str.length
    const remainder = size % 5
    if (remainder === 1) {
        // No legitimate z85e encoded data has a remainder of 1 when divided by 5
        throw new Error("Bad input.")
    }
    let at = (index) => str.charCodeAt(index)
    if (typeof str !== "string") {
        at = (index) => str[index]
    }
    const extraBytes = remainder === 0 ? 0 : remainder - 1
    const decodedSize = ((size - extraBytes) * 4 / 5  |0) + extraBytes
    const decoded = new Uint8Array(decodedSize)
    let batchSize = size - remainder
    let byteNo = 0, charNo = 0
    while (charNo < batchSize) {
        let value = CharCodeToBase85[at(charNo)]
        value = (value * 85) + CharCodeToBase85[at(charNo + 1)]
        value = (value * 85) + CharCodeToBase85[at(charNo + 2)]
        value = (value * 85) + CharCodeToBase85[at(charNo + 3)]
        value = (value * 85) + CharCodeToBase85[at(charNo + 4)]
        charNo += 5

        decoded[byteNo] = (value / base256_3) % 256
        decoded[byteNo + 1] = (value / base256_2) % 256
        decoded[byteNo + 2] = (value / base256_1) % 256
        decoded[byteNo + 3] = value % 256
        byteNo += 4
    }
    if (remainder > 0) {
        let value = 0
        while (charNo < size) {
            value = (value * 85) + CharCodeToBase85[at(charNo++)]
        }
        let divisor = Math.pow(256, extraBytes - 1)
        while (divisor !== 0) {
            decoded[byteNo++] = (value / divisor) % 256
            divisor /= 256
        }
    }
    return decoded
}

export function encodeToUint8Array(buffer) {
    let buf = buffer
    if (typeof buffer === "string") {
        buf = new TextEncoder().encode(buffer)
    } else if (!(buf instanceof Uint8Array)) {
        buf = new Uint8Array(buffer)
    }
    const size = buf.length
    const remainder = size % 4
    const batchSize = size - remainder
    const extraChars = remainder > 0 ? remainder + 1 : 0
    const encodedSize = ((size - remainder) * 5 / 4 |0) + extraChars
    const destination = new Uint8Array(encodedSize)
    let charNo = 0, byteNo = 0
    while (byteNo < batchSize) {
        const value = buf[byteNo] * base256_3
            + buf[byteNo + 1] * base256_2
            + buf[byteNo + 2] * base256_1
            + buf[byteNo + 3]
        byteNo += 4
        destination[charNo] = Base85CharCodes[(value / base85_4 |0) % 85]
        destination[charNo + 1] = Base85CharCodes[(value / base85_3 |0) % 85]
        destination[charNo + 2] = Base85CharCodes[(value / base85_2 |0) % 85]
        destination[charNo + 3] = Base85CharCodes[(value / base85_1 |0) % 85]
        destination[charNo + 4] = Base85CharCodes[value % 85]
        charNo += 5
    }
    if (extraChars > 0) {
        let value = 0
        while (byteNo < size) {
            value = (value * 256) + buf[byteNo++]
        }
        let divisor = Math.pow(85, remainder)
        while (divisor !== 0) {
            destination[charNo++] = Base85CharCodes[(value / divisor |0) % 85]
            divisor /= 85
        }
    }
    return destination
}

export function encode(buffer) {
    return new TextDecoder().decode(encodeToUint8Array(buffer))
}