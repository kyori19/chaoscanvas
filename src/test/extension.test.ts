import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

suite('ChaosCanvas Extension Test Suite', () => {
	// Test for extension activation
	test('Extension should be present and activated', async function() {
		this.timeout(10000);
		
		// Get the package.json to find extension ID
		const packageJSON = require(path.join(__dirname, '../../package.json'));
		const extensionId = packageJSON.name;
		
		// Try both the package name and standard form (publisher.name)
		let extension = vscode.extensions.getExtension(extensionId);
		
		// If not found, check all extensions
		if (!extension) {
			console.log(`Extension '${extensionId}' not found directly, finding by commands...`);
			
			// Test if our commands are registered, which means the extension is loaded
			const commands = await vscode.commands.getCommands(true);
			const toggleChaosCommandExists = commands.includes('chaoscanvas.toggleChaos');
			
			assert.ok(toggleChaosCommandExists, 'Extension commands should be registered');
			
			// Skip the extension assertion since we're already testing by command availability
			return;
		}
		
		// If we found the extension directly, continue with normal assertions
		assert.ok(extension, 'Extension should be present');
		
		// Check if the extension is activated
		if (!extension.isActive) {
			await extension.activate();
		}
		assert.ok(extension.isActive, 'Extension should be activated');
		
		// Show a notification that tests are running
		await vscode.window.showInformationMessage('Running ChaosCanvas tests');
	});
	
	// Test for command registration
	test('Commands should be registered', async function() {
		this.timeout(5000);
		
		const commands = await vscode.commands.getCommands(true);
		
		assert.ok(commands.includes('chaoscanvas.toggleChaos'), 'toggleChaos command should be registered');
		assert.ok(commands.includes('chaoscanvas.shuffleColors'), 'shuffleColors command should be registered');
	});
	
	// Test for command execution
	test('toggleChaos command should trigger information message', async function() {
		this.timeout(5000);
		
		// Spy on window.showInformationMessage
		const showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
		
		try {
			// Execute the toggleChaos command twice (once to enable, once to disable)
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Verify the info message was shown twice
			assert.strictEqual(showInfoMessageStub.callCount, 2, 'Information message should be shown twice');
			
			// Verify the message contents for enabling and disabling
			assert.ok(
				showInfoMessageStub.firstCall.args[0].includes('activated') || 
				showInfoMessageStub.secondCall.args[0].includes('activated'),
				'Should show activation message'
			);
			
			assert.ok(
				showInfoMessageStub.firstCall.args[0].includes('restored') || 
				showInfoMessageStub.secondCall.args[0].includes('restored'),
				'Should show restoration message'
			);
		} finally {
			// Restore the stub
			showInfoMessageStub.restore();
		}
	});
	
	// Test for shuffleColors command
	test('shuffleColors command should work when chaos is enabled', async function() {
		this.timeout(5000);
		
		// Spy on window.showInformationMessage
		const showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
		
		try {
			// First enable chaos mode
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Clear the stub calls from the toggle command
			showInfoMessageStub.reset();
			
			// Execute shuffleColors command
			await vscode.commands.executeCommand('chaoscanvas.shuffleColors');
			
			// Verify the info message was shown
			assert.strictEqual(showInfoMessageStub.callCount, 1, 'Information message should be shown');
			assert.ok(
				showInfoMessageStub.firstCall.args[0].includes('shuffled'),
				'Should show shuffle message'
			);
			
			// Disable chaos mode for cleanup
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
		} finally {
			// Restore the stub
			showInfoMessageStub.restore();
		}
	});
	
	// Test for extension configuration
	test('Extension should have proper configuration defaults', function() {
		this.timeout(5000);
		
		const config = vscode.workspace.getConfiguration('chaoscanvas');
		
		const satRange = config.get('saturationRange') as number[];
		const lightRange = config.get('lightnessRange') as number[];
		
		assert.ok(Array.isArray(satRange), 'Saturation range should be an array');
		assert.ok(Array.isArray(lightRange), 'Lightness range should be an array');
		
		assert.strictEqual(satRange.length, 2, 'Saturation range should have two values');
		assert.strictEqual(lightRange.length, 2, 'Lightness range should have two values');
	});
});
