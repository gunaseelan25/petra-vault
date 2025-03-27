import { nextJsConfig } from '@aptos-labs/eslint-config-petra-vault/next-js';

/** @type {import("eslint").Linter.Config} */
export default [{ ignores: ['components/ui/**'] }, ...nextJsConfig];
