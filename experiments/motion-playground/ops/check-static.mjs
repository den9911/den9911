import { readdir, readFile, stat } from 'node:fs/promises';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { performanceBudget } from './performance.mjs';
const exec=promisify(execFile);
async function walk(dir){const paths=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=`${dir}/${entry.name}`;if(entry.isDirectory())paths.push(...await walk(path));else paths.push(path);}return paths;}
const files=await walk('public');let raw=0,gzip=0;
await exec(process.execPath,['--experimental-vm-modules','ops/syntax.mjs',...files.filter(file=>file.endsWith('.js'))]);
for(const file of files){const data=await readFile(file);raw+=data.length;gzip+=gzipSync(data).length;
  if(file.endsWith('.html'))for(const match of data.toString().matchAll(/(?:src|href)="(\/[^"?#]*)"/g)){let p=resolve('public',`.${match[1]}`);if(match[1].endsWith('/'))p=resolve(p,'index.html');await stat(p);}
}
console.log(JSON.stringify({files:files.length,publicBytes:raw,publicGzipBytes:gzip,languages:await performanceBudget()},null,2));
