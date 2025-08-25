import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	version: '1.100.0',
	launchArgs: [
		'--skip-getting-started',
		'--skip-release-notes',
		'--disable-workspace-trust',
		'--no-sandbox',
		'--disable-gpu',
		'--disable-dev-shm-usage'
	],
	mocha: {
		timeout: 60000,
		retries: 2
	}
});
