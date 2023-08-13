import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

export default {
    input: 'src/index.ts',
    plugins: [
        typescript({
            outDir: 'dist',
            declaration: true,
            declarationDir: 'dist',
        }),
        nodeResolve({
            preferBuiltins: true,
        }),
        commonjs(),
        json(),
    ],
    output: [
        {
            file: 'dist/index.cjs',
            format: 'cjs',
            sourcemap: true,
            banner: '#!/usr/bin/env node',
        },
    ],
    external: [
        'node-ssh',
        'dotenv',
        'archiver',
        'inquirer',
        'yargs',
        'chalk',
        'ora',
    ],
};
