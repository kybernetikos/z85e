import {decode, encode} from "./z85e.js"

const testExamples = {
    "WorldWorldHello": [
        181, 89, 247, 91, 181,
        89, 247, 91, 134, 79,
        210, 111
    ],
    "": [],
    "2b": [0xb5],
    "6Af": [0xb5, 0x59],
    "jt#7": [0xb5, 0x59, 0xf7],
    "World": [0xb5, 0x59, 0xf7, 0x5b],
    "Hello6Af": [0x86, 0x4f, 0xd2, 0x6f, 0xb5, 0x59],
    "Hellojt#7": [0x86, 0x4f, 0xd2, 0x6f, 0xb5, 0x59, 0xf7],
    "HelloWorld": [0x86, 0x4f, 0xd2, 0x6f, 0xb5, 0x59, 0xf7, 0x5b],
 }

function compareArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        console.error("Arrays not same length", arr1, arr2)
        throw new Error("Arrays not same length")
    }
    arr1.forEach((x,i) => {
        if (arr2[i] !== x) {
            console.error("Arrays different", arr1, arr2)
            throw new Error("Arrays different")
        }
    })
}

for (let [encoded, decoded] of Object.entries(testExamples)) {
    const d = decode(encoded)
    compareArrays(d, decoded)
    const r= encode(d)
    if (r !== encoded) {
        console.error("Encoding/decoding cycle produced different result", d, r)
        throw new Error("Encoding different")
    }
}

console.log("ok")