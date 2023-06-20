/*tslint:disable:no-console*/

/**
 * Script to download cld3 wasm binary from https://github.com/kwonoj/docker-cld3-wasm.
 */

import * as crypto from 'crypto';
import * as path from 'path';
import { exec, mkdir } from 'shelljs';
import { promisify } from 'util';
//tslint:disable-next-line: no-require-imports no-var-requires
const { config } = require('./package.json');

// Package.json defines `cld3-version` under `config` section to find corresponding release version
const version = config['cld3-version'];
const asyncExec = promisify(exec);

/**
 * Actually download binary from remote. This is direct invocation to wget, need local wget installation.
 *
 */
const downloadSingleBinary = async (libPath: string, binaryFile: { url: string; binaryType: string; localBinaryPath: string }) => {
  const { url, binaryType, localBinaryPath } = binaryFile;
  const outPath = path.join(libPath, binaryType);
  mkdir(outPath);
  await asyncExec(`wget -O ${localBinaryPath} ${url}`);
};

/**
 * Main script execution
 */
(async () => {
  const libPath = path.resolve('./src/lib');
  const binaryFiles = ['node', 'browser'].map(binaryType => {
    const fileName = `cld3_${binaryType}.js`;

    return {
      url: `https://github.com/cohenerickson/docker-cld3-wasm/releases/download/${version}/${fileName}`,
      localBinaryPath: path.join(libPath, binaryType, 'cld3.js'),
      binaryType,
      type: path.extname(fileName) === '.js' ? 'hex' : ('binary' as crypto.HexBase64Latin1Encoding)
    };
  });

    console.log(`Downloading cld3 wasm binary version '${version}'`);

    for (const singleFile of binaryFiles) {
      await downloadSingleBinary(libPath, singleFile);
    }
})();
