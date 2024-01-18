import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';

const baseConfig = createBasicConfig();

export default merge(baseConfig, [
  {
    input: './js/src/index.js',
    output: {
      dir: 'dist',
      format: 'cjs',
    },
    external: [
      'react'
    ],
    plugins: [
      commonjs(),
      nodeResolve(),
    ],
  },
  {
    input: './js/src/index.d.ts',
    output: [{ file: 'dist/types.d.ts', format: 'es' }],
    plugins: [dts()],
  }
]);
