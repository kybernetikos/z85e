#! /usr/bin/env node

import {Z85DecodeTransform} from "../src/streams.js"
import {Readable, Writable} from "stream"
import {createReadStream, createWriteStream} from "fs"
import {argv, stdin, stdout} from "node:process"

let inputFile = null, outputFile = null, useGzip = false

for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "-z" || argv[i] === "--gzip") {
        useGzip = true
    } else if (argv[i] === "-i" || argv[i] === "--input") {
        inputFile = argv[++i]
    } else if (argv[i] === "-o" || argv[i] === "--output") {
        outputFile = argv[++i]
    } else if (argv[i] === "-h" || argv[i] === "--help") {
        console.info("Usage: z85decode [-i <input file>] [-o <output file>] [-z]")
        process.exit(0)
    } else {
        inputFile = argv[i]
    }
}

const input = Readable.toWeb(inputFile ? createReadStream(inputFile) : stdin)
const output = Writable.toWeb(outputFile ? createWriteStream(outputFile) : stdout)

let stream = Z85DecodeTransform.z85DecodeFromBytes(input)

if (useGzip) {
  stream = stream.pipeThrough(new DecompressionStream("gzip"))
}

await stream.pipeTo(output)