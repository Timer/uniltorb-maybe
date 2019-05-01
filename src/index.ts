import firstChunkStream from 'first-chunk-stream';
import iltorb from 'iltorb';
import peek from 'peek-stream';
import pumpify from 'pumpify';
import { Duplex } from 'stream';
import through from 'through2';

// https://stackoverflow.com/a/39032023/4397028
function isBrotli(buf: Buffer | string) {
  if (!buf || buf.length < 4) {
    return false;
  }
  return (
    buf[0] === 0xce && buf[1] === 0xb2 && buf[2] === 0xcf && buf[3] === 0x81
  );
}

function uniltorb(): Duplex {
  return peek({ newline: false, maxBuffer: 10 }, function(
    data: Buffer | string,
    swap: (err: Error | undefined, parser: Duplex) => void
  ) {
    if (isBrotli(data)) {
      return swap(
        undefined,
        new pumpify(
          firstChunkStream(
            { chunkLength: 4 },
            (err: any, _: any, __: any, cb: Function) => {
              cb(err, '');
            }
          ),
          iltorb.decompressStream()
        )
      );
    }

    return swap(undefined, through());
  });
}

export { uniltorb as unbrotli, uniltorb };
