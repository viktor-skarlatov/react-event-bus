import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve'
import dts from 'rollup-plugin-dts';

const baseConfig = createBasicConfig();

export default merge(baseConfig, [
  {
    input: './js/src/index.js',
    output: {
      dir: 'dist',
      format: 'esm',
    },
    external: [
      'react'
    ],
    plugins: [
      nodeResolve(),
    ],
  },
  {
    input: './js/src/index.d.ts',
    output: [{ file: 'dist/types.d.ts', format: 'es' }],
    plugins: [dts()],
  }
]);
