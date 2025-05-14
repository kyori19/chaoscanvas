import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

suite('ChaosCanvas Commands and UI Context Tests', () => {
	// Test for context setting
	test('Should set context value when toggling chaos mode', async () => {
		// Spy on the executeCommand method to check context setting
		const executeCommandSpy = sinon.spy(vscode.commands, 'executeCommand');
		
		try {
			// Execute the toggleChaos command
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
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
		} finally {
			executeCommandSpy.restore();
		}
	});
	
	// Test for shuffle command behavior with chaos mode enabled
	test('Should show shuffle message when chaos mode is enabled', async function() {
		this.timeout(10000);
		
		// Spy on window.showInformationMessage
		const infoMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
		
		try {
			// Make sure chaos mode is enabled first
			// First toggle to ensure a known state
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
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
			}
			
			// Clear message history
			infoMessageStub.resetHistory();
			
			// Execute shuffle command
			await vscode.commands.executeCommand('chaoscanvas.shuffleColors');
			
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
		} finally {
			infoMessageStub.restore();
		}
	});
	
	// Test for shuffle behavior when disabled
	test('Should show message when shuffling colors while disabled', async () => {
		// First make sure chaos mode is disabled
		// Stub to check if chaos mode is currently enabled
		const infoMessageSpy = sinon.spy(vscode.window, 'showInformationMessage');
		
		try {
			// Try running shuffle command while chaos is not enabled
			// Toggle twice in case it's currently enabled
			let chaosEnabled = false;
			
			// Toggle first to ensure a known state
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Check if chaos got enabled 
			for (let i = 0; i < infoMessageSpy.callCount; i++) {
				if (infoMessageSpy.getCall(i).args[0].includes('activated')) {
					chaosEnabled = true;
					break;
				}
			}
			
			// If it got enabled, toggle again to disable
			if (chaosEnabled) {
				infoMessageSpy.resetHistory();
				await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			}
			
			// Reset spy before our actual test
			infoMessageSpy.resetHistory();
			
			// Now try to shuffle when definitely disabled
			await vscode.commands.executeCommand('chaoscanvas.shuffleColors');
			
			// Shuffle should not show a message when chaos is disabled
			let shuffleMessageShown = false;
			for (let i = 0; i < infoMessageSpy.callCount; i++) {
				if (infoMessageSpy.getCall(i).args[0].includes('shuffled')) {
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
	test('Command visibility should respect when clause', async () => {
		// This is a basic test that can be expanded if needed
		// Get all commands
		const commands = await vscode.commands.getCommands(true);
		
		// Verify our commands exist
		assert.ok(commands.includes('chaoscanvas.toggleChaos'), 'Toggle command should be registered');
		assert.ok(commands.includes('chaoscanvas.shuffleColors'), 'Shuffle command should be registered');
	});
}); 