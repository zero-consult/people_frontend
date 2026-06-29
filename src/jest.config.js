import {defineConfig} from 'jest';

export default defineConfig({
    verbose: true,
    setupFilesAfterEnv: [
        "<rootDir>/support/setupTests.ts"
    ]
});