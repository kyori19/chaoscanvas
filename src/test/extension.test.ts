import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Starting ChaosCanvas tests');

	test('Extension activation', async () => {
		// Check if the extension is activated
		const extension = vscode.extensions.getExtension('chaoscanvas');
		assert.ok(extension);
		
		// Ensure commands are registered
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('chaoscanvas.toggleChaos'));
		assert.ok(commands.includes('chaoscanvas.shuffleColors'));
	});
});
