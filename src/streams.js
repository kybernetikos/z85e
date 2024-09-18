import {decode, encodeToUint8Array, encode} from "./z85e.js"

export class RechunkTransform {
    #segmentLength = null
    #leftOver = null
    #join = null
    #sub = null

    constructor(joinSub, segmentLength) {
        this.#segmentLength = segmentLength
        this.#join = joinSub.join
        this.#sub = joinSub.sub
        this.#leftOver = null
    }

    start(controller) {}

    transform(chunk, controller) {
        if (this.#leftOver !== null) {
            chunk = this.#join(this.#leftOver, chunk)
            this.#leftOver = null
        }
        const remainder = chunk.length % this.#segmentLength
        const bytes = chunk.length - remainder
        if (remainder !== chunk.length) {
            const newChunk = this.#sub(chunk, 0, bytes)
            controller.enqueue(newChunk)
        }
        if (remainder > 0) {
            this.#leftOver = this.#sub(chunk, bytes, bytes + remainder)
        }
    }

    flush(controller) {
        if (this.#leftOver !== null) {
            controller.enqueue(this.#leftOver)
        }
    }

    static stringRechunk(stream, divisor = 5) {
        return stream.pipeThrough(new TransformStream(new RechunkTransform({
            join: (a,b) => a + b,
            sub: (a, start, end) => a.substring(start, end)
        }, divisor)))
    }

    static uint8ArrayRechunk(stream, divisor = 4) {
        return stream.pipeThrough(new TransformStream(new RechunkTransform({
            join: (a,b) => {
                const result = new Uint8Array(a.length + b.length)
                result.set(a)
                result.set(b, a.length)
                return result
            },
            sub: (a, start, end) => a.subarray(start, end)
        }, divisor)))
    }
}

export class Z85EncodeTransform {
    start(controller) {}
    transform(chunk, controller) {controller.enqueue(encodeToUint8Array(chunk))}
    flush(controller) {}
    static z85Encode(stream) {
        return RechunkTransform.uint8ArrayRechunk(stream, 4).pipeThrough(new TransformStream(new Z85EncodeTransform()))
    }
}

export class Z85DecodeTransform {
    transform(chunk, controller) {controller.enqueue(decode(chunk))}
    static z85DecodeFromBytes(stream) {
        return RechunkTransform.uint8ArrayRechunk(stream, 5).pipeThrough(new TransformStream(new Z85DecodeTransform()))
    }
    static z85DecodeFromString(stream) {
        return RechunkTransform.stringRechunk(stream, 5).pipeThrough(new TransformStream(new Z85DecodeTransform()))
    }
}
