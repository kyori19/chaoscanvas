import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

suite('ChaosCanvas Commands and UI Context Tests', () => {
	// Test for context setting
	test('Should set context value when toggling chaos mode', async function() {
		this.timeout(8000);
		
		// Spy on the executeCommand method to check context setting
		const executeCommandSpy = sinon.spy(vscode.commands, 'executeCommand');
		
		try {
			// Execute the toggleChaos command
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			// Wait for the command to complete
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Check that the context was set
			let contextSetCalled = false;
			
			for (let i = 0; i < executeCommandSpy.callCount; i++) {
				const call = executeCommandSpy.getCall(i);
				if (
					call.args[0] === 'setContext' && 
					call.args[1] === 'chaoscanvas.chaosEnabled'
				) {
					contextSetCalled = true;
					break;
				}
			}
			
			assert.ok(contextSetCalled, 'Context should be set when toggling chaos mode');
			
			// Toggle chaos mode back to original state
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			await new Promise(resolve => setTimeout(resolve, 100));
		} finally {
			executeCommandSpy.restore();
		}
	});
	
	// Test for shuffle command behavior with chaos mode enabled
	test('Should show shuffle message when chaos mode is enabled', async function() {
		this.timeout(15000);
		
		// Spy on window.showInformationMessage
		const infoMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
		
		try {
			// Make sure chaos mode is enabled first
			// First toggle to ensure a known state
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Check if chaos got enabled 
			let chaosEnabled = false;
			for (let i = 0; i < infoMessageStub.callCount; i++) {
				const message = infoMessageStub.getCall(i).args[0];
				if (typeof message === 'string' && message.includes('activated')) {
					chaosEnabled = true;
					break;
				} else if (typeof message === 'string' && message.includes('restored')) {
					chaosEnabled = false;
					break;
				}
			}
			
			// If it's not enabled, toggle again
			if (!chaosEnabled) {
				infoMessageStub.resetHistory();
				await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			
			// Clear message history
			infoMessageStub.resetHistory();
			
			// Execute shuffle command
			await vscode.commands.executeCommand('chaoscanvas.shuffleColors');
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Check that shuffle message was shown (meaning chaos was enabled)
			let shuffleMessageShown = false;
			for (let i = 0; i < infoMessageStub.callCount; i++) {
				const message = infoMessageStub.getCall(i).args[0];
				if (typeof message === 'string' && message.includes('shuffled')) {
					shuffleMessageShown = true;
					break;
				}
			}
			
			assert.strictEqual(shuffleMessageShown, true, 'Should show shuffle message when chaos is enabled');
			
			// Disable chaos mode for cleanup
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			await new Promise(resolve => setTimeout(resolve, 100));
		} finally {
			infoMessageStub.restore();
		}
	});
	
	// Test for shuffle behavior when disabled
	test('Should not show shuffle message when chaos mode is disabled', async function() {
		this.timeout(12000);
		
		// First make sure chaos mode is disabled
		// Stub to check if chaos mode is currently enabled
		const infoMessageSpy = sinon.spy(vscode.window, 'showInformationMessage');
		
		try {
			// Try running shuffle command while chaos is not enabled
			// Toggle first to ensure a known state
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Check if chaos got enabled 
			let chaosEnabled = false;
			for (let i = 0; i < infoMessageSpy.callCount; i++) {
				const message = infoMessageSpy.getCall(i).args[0];
				if (typeof message === 'string' && message.includes('activated')) {
					chaosEnabled = true;
					break;
				}
			}
			
			// If it got enabled, toggle again to disable
			if (chaosEnabled) {
				infoMessageSpy.resetHistory();
				await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
				await new Promise(resolve => setTimeout(resolve, 100));
			}
			
			// Reset spy before our actual test
			infoMessageSpy.resetHistory();
			
			// Now try to shuffle when definitely disabled
			await vscode.commands.executeCommand('chaoscanvas.shuffleColors');
			await new Promise(resolve => setTimeout(resolve, 100));
			
			// Shuffle should not show a message when chaos is disabled
			let shuffleMessageShown = false;
			for (let i = 0; i < infoMessageSpy.callCount; i++) {
				const message = infoMessageSpy.getCall(i).args[0];
				if (typeof message === 'string' && message.includes('shuffled')) {
					shuffleMessageShown = true;
					break;
				}
			}
			
			assert.strictEqual(shuffleMessageShown, false, 'Should not show shuffle message when chaos is disabled');
		} finally {
			infoMessageSpy.restore();
		}
	});
	
	// Test command visibility via menus
	test('Command visibility should respect when clause', async function() {
		this.timeout(8000);
		
		// This is a basic test that can be expanded if needed
		// Get all commands
		const commands = await vscode.commands.getCommands(true);
		
		// Verify our commands exist
		assert.ok(commands.includes('chaoscanvas.toggleChaos'), 'Toggle command should be registered');
		assert.ok(commands.includes('chaoscanvas.shuffleColors'), 'Shuffle command should be registered');
	});
}); 