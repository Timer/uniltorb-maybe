import iltorb from 'iltorb';
import { Duplex } from 'stream';
import util from 'util';

import { uniltorb } from '../src';

const wrap = require('wrap-stream');
const toArray = require('stream-to-array');

function bufferToStream(buffer: Buffer) {
  let stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

const Data = Buffer.from('Hello world!');

const getBuffer = function(parts: any) {
  const buffers = parts.map((part: any) =>
    util.isBuffer(part) ? part : Buffer.from(part)
  );
  return Buffer.concat(buffers);
};

describe('uniltorb', () => {
  it('does nothing', async () => {
    expect(
      await toArray(bufferToStream(Data).pipe(uniltorb())).then(getBuffer)
    ).toEqual(Data);
  });
  it('decompresses', async () => {
    expect(
      await toArray(
        bufferToStream(Data)
          .pipe(iltorb.compressStream())
          .pipe(wrap(Buffer.from([0xce, 0xb2, 0xcf, 0x81])))
          .pipe(uniltorb())
      ).then(getBuffer)
    ).toEqual(Data);
  });
});
