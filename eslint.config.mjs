import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = require('eslint-config-next');

export default eslintConfig;
