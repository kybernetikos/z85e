# z85e

This project implements an extended version of the ZeroMQ z85 encoding standard described [here](https://rfc.zeromq.org/spec/32/).  It is a port of [coenm/Z85e](https://github.com/coenm/Z85e) from C# to javascript.  The extension is simply to enable encoding and decoding of arbirary length inputs, where the original required inputs to be multiples of 4 bytes to encode or 5 characters to decode.

The Z85 encoding has a few nice properties.  It doesn't blow up data as much as Base64 does, and it is source code safe - you can copy and paste it into a string, and not have to worry about escapes or quotes causing problems.

This library can be included as a single file without dependencies in a browser or node (./src/z85e.js).

Stream support is provided in a separate file (./src/streams.js)

## Installation

```shell
npm install z85e
```

If you plan to use the z85encode and z85decode cli tools, you might want to use the `-g` flag to install them globally.

## Use

```js
import {decode, encode} from "z85e"
import {readFileSync} from "fs"

const fileContentBuffer = readFileSync("./src/z85e.js", null)
const fileContentStr = readFileSync("./src/z85e.js", "utf-8")
const str = encode(fileContentBuffer)
const decodedStr = decode(str)
if (new TextDecoder().decode(decodedStr) !== fileContentStr) {
    throw new Error("Decode failed")
}
```

## API

### encode

`encode` takes a buffer or string and returns a string of it encoded in the z85e encoding.  You can instead call `encodeToUint8Array` which performs the encoding and returns a Uint8Array of the character codes.

### decode

`decode` can operate on strings or Uint8Arrays.  It will decode a z85e encoded string to a Uint8Array.

### streams

I have included web transform streams that can be included to encode or decode streams.

Here's encoding a stream from node.

```js
#! /usr/bin/env node

import {Z85EncodeTransform} from "z85e"
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
```

This also shows how easy it is to include gzip in the stream.

### cli

```shell
cat ReadMe.md | z85encode -z > encodedReadMe.txt
cat encodedReadMe.txt
cat encodedReadMe | z85decode -z
```

The `-z` argument includes gzip compression / decompression which depending on the data being encoded can reduce the size of the final encoding.
