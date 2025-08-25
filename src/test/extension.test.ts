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
		this.timeout(15000);
		
		// Get the package.json to find extension ID
		const packageJSON = require(path.join(__dirname, '../../package.json'));
		const extensionId = `${packageJSON.publisher}.${packageJSON.name}`;
		
		// Try to find extension by full publisher.name format
		let extension = vscode.extensions.getExtension(extensionId);
		
		// If not found, try just the name
		if (!extension) {
			extension = vscode.extensions.getExtension(packageJSON.name);
		}
		
		// If still not found, check all extensions and find by commands
		if (!extension) {
			console.log(`Extension '${extensionId}' not found directly, checking by commands...`);
			
			// Wait a bit for extension activation to complete
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Test if our commands are registered, which means the extension is loaded
			const commands = await vscode.commands.getCommands(true);
			const toggleChaosCommandExists = commands.includes('chaoscanvas.toggleChaos');
			const shuffleCommandExists = commands.includes('chaoscanvas.shuffleColors');
			
			assert.ok(toggleChaosCommandExists, 'Extension toggleChaos command should be registered');
			assert.ok(shuffleCommandExists, 'Extension shuffleColors command should be registered');
			
			// Skip the direct extension assertion since we verified by command availability
			console.log('Extension verified by command registration');
			return;
		}
		
		// If we found the extension directly, continue with normal assertions
		assert.ok(extension, 'Extension should be present');
		
		// Check if the extension is activated and wait if needed
		if (!extension.isActive) {
			console.log('Extension not active, waiting for activation...');
			await extension.activate();
			// Give some time for full activation
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
		assert.ok(extension.isActive, 'Extension should be activated');
		
		console.log('Extension test completed successfully');
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
		this.timeout(10000);
		
		// Spy on window.showInformationMessage
		const showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
		
		try {
			// Execute the toggleChaos command twice (once to enable, once to disable)
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			// Wait a bit for the command to complete
			await new Promise(resolve => setTimeout(resolve, 100));
			
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			// Wait a bit for the second command to complete
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Verify the info message was shown twice
			assert.strictEqual(showInfoMessageStub.callCount, 2, 'Information message should be shown twice');
			
			// Verify the message contents for enabling and disabling
			const firstMessage = showInfoMessageStub.firstCall.args[0];
			const secondMessage = showInfoMessageStub.secondCall.args[0];
			
			// One should be activation, one should be restoration
			const hasActivationMessage = firstMessage.includes('activated') || secondMessage.includes('activated');
			const hasRestorationMessage = firstMessage.includes('restored') || secondMessage.includes('restored');
			
			assert.ok(hasActivationMessage, 'Should show activation message');
			assert.ok(hasRestorationMessage, 'Should show restoration message');
		} finally {
			// Restore the stub
			showInfoMessageStub.restore();
		}
	});
	
	// Test for shuffleColors command
	test('shuffleColors command should work when chaos is enabled', async function() {
		this.timeout(10000);
		
		// Spy on window.showInformationMessage
		const showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
		
		try {
			// First enable chaos mode
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			// Wait for the toggle to complete
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Clear the stub calls from the toggle command
			showInfoMessageStub.resetHistory();
			
			// Execute shuffleColors command
			await vscode.commands.executeCommand('chaoscanvas.shuffleColors');
			// Wait for the shuffle to complete
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Verify the info message was shown
			assert.strictEqual(showInfoMessageStub.callCount, 1, 'Information message should be shown');
			const message = showInfoMessageStub.firstCall.args[0];
			assert.ok(
				message.includes('shuffled'),
				'Should show shuffle message'
			);
			
			// Disable chaos mode for cleanup
			showInfoMessageStub.resetHistory();
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
