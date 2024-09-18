#! /usr/bin/env node

import {Z85EncodeTransform} from "../src/streams.js"
import {Readable, Writable} from "stream"
import {argv} from "node:process";

let input = Readable.toWeb(process.stdin)
let output = Writable.toWeb(process.stdout)

if (argv[argv.length - 1] === "-z") {
    input = input.pipeThrough(new CompressionStream("gzip"))
}

Z85EncodeTransform
    .z85Encode(input)
    .pipeTo(output)