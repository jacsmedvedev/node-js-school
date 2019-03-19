const { Writable } = require('stream');

const outStream = new Writable({
    write(chunk, encoding, callback) {
        console.log(chunk.toString());
        callback();
    }
});

class WritableStream extends Writable {
}

process.stdin.pipe(outStream);