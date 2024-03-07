import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import eslint from '@rollup/plugin-eslint';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    strict: true
  },
  plugins: [
    eslint(),
    typescript({tsconfig: "./tsconfig.json"}), 
    commonjs(),
    nodeResolve(),
    terser()
  ]
};