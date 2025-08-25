import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	useInstallation: {
		fromMachine: false
	},
	launchArgs: [
		'--disable-extensions',
		'--skip-getting-started',
		'--skip-release-notes',
		'--disable-workspace-trust',
		'--no-sandbox',
		'--disable-gpu',
		'--disable-dev-shm-usage',
		'--disable-gpu-sandbox',
		'--disable-updates'
	]
});
