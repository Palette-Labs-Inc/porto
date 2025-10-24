import { appendFile, glob, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
await mkdir(resolve(import.meta.dirname, '../src/_generated'), {
    recursive: true,
});
const out = resolve(import.meta.dirname, '../src/_generated/contracts.ts');
await writeFile(out, '');
const fileNames = [];
for await (const file of glob(resolve(import.meta.dirname, '../contracts/out/**/*.json'))) {
    if (file.includes('build-info'))
        continue;
    const fileName = file.split('/').pop()?.replace('.json', '');
    if (fileNames.includes(fileName))
        continue;
    const { abi, bytecode } = JSON.parse(await readFile(file, 'utf-8'));
    fileNames.push(fileName);
    appendFile(out, `export const ${fileName} = ${JSON.stringify({ abi, bytecode }, null, 2)} as const;\n\n`);
}
