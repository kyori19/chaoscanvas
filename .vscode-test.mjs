import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	version: 'stable',
	launchArgs: [
		'--disable-extensions',
		'--skip-getting-started',
		'--skip-release-notes',
		'--disable-workspace-trust'
	],
	mocha: {
		timeout: 60000,
		retries: 2
	}
});
