#! /usr/bin/env node

import {Z85EncodeTransform} from "../src/streams.js"
import {Readable, Writable} from "stream"
import {createWriteStream, createReadStream} from "fs"
import {argv, stdout, stdin} from "node:process"

let inputFile = null, outputFile = null, useGzip = false

for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "-z" || argv[i] === "--gzip") {
        useGzip = true
    } else if (argv[i] === "-i" || argv[i] === "--input") {
        inputFile = argv[++i]
    } else if (argv[i] === "-o" || argv[i] === "--output") {
        outputFile = argv[++i]
    } else if (argv[i] === "-h" || argv[i] === "--help") {
        console.info("Usage: z85encode [-i <input file>] [-o <output file>] [-z]")
        process.exit(0)
    } else {
       inputFile = argv[i]
    }
}

let input = Readable.toWeb(inputFile ? createReadStream(inputFile) : stdin)
const output = Writable.toWeb(outputFile ? createWriteStream(outputFile) : stdout)

if (useGzip) {
    input = input.pipeThrough(new CompressionStream("gzip"))
}

await Z85EncodeTransform
    .z85Encode(input)
    .pipeTo(output)
