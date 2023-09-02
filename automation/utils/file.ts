import * as path from 'path';
import * as fs from 'fs';

export const downloadDir = path.join(__dirname, 'tempDownload');

export const rmdir = (dir: string) => {
  const list = fs.readdirSync(dir);
  for (let i = 0; i < list.length; i += 1) {
    const filename = path.join(dir, list[i]);
    const stat = fs.statSync(filename);

    if (filename === '.' || filename === '..') {
      continue;
    }

    if (stat.isDirectory()) {
      rmdir(filename);
      continue;
    }

    fs.unlinkSync(filename);
  }
  fs.rmdirSync(dir);
};
