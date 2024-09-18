#! /usr/bin/env node

import {Z85DecodeTransform} from "../src/streams.js";
import {Readable, Writable} from "stream";
import {argv} from "node:process";

const input = Readable.toWeb(process.stdin)
const output = Writable.toWeb(process.stdout)

let stream = Z85DecodeTransform.z85DecodeFromBytes(input)
if (argv[argv.length - 1] === "-z") {
   stream = stream.pipeThrough(new DecompressionStream("gzip"))
}

stream.pipeTo(output)