import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

suite('ChaosCanvas Status Bar Tests', () => {
	// Test that chaos mode toggle updates the UI
	test('Toggle chaos mode should update UI and show message', async function() {
		this.timeout(5000);
		
		// Spy on window.showInformationMessage to detect the toggle
		const showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
		
		try {
			// First execute the toggleChaos command to enable
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Check that the information message was shown
			assert.ok(
				showInfoMessageStub.calledWithMatch(sinon.match(/(activated|restored)/)),
				'Should show information message when toggling chaos mode'
			);
			
			// Reset the stub
			showInfoMessageStub.resetHistory();
			
			// Execute the toggleChaos command again to disable
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Check that the information message was shown again
			assert.ok(
				showInfoMessageStub.calledWithMatch(sinon.match(/(activated|restored)/)),
				'Should show information message when toggling chaos mode back'
			);
		} finally {
			// Restore the stub
			showInfoMessageStub.restore();
		}
	});
	
	// Test that context value is properly set when toggling chaos mode
	test('Context value should be set when toggling chaos mode', async function() {
		this.timeout(5000);
		
		// Spy on the executeCommand method to check context setting
		const executeCommandSpy = sinon.spy(vscode.commands, 'executeCommand');
		
		try {
			// Execute the toggleChaos command
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Check that the context was set
			let contextSetCalled = false;
			let contextValue: boolean | undefined;
			
			for (let i = 0; i < executeCommandSpy.callCount; i++) {
				const call = executeCommandSpy.getCall(i);
				if (
					call.args[0] === 'setContext' && 
					call.args[1] === 'chaoscanvas.chaosEnabled'
				) {
					contextSetCalled = true;
					contextValue = call.args[2];
					break;
				}
			}
			
			assert.ok(contextSetCalled, 'Context should be set when toggling chaos mode');
			
			// Reset spy
			executeCommandSpy.resetHistory();
			
			// Toggle chaos mode back to original state
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Check that the context was updated
			let contextUpdated = false;
			let newContextValue: boolean | undefined;
			
			for (let i = 0; i < executeCommandSpy.callCount; i++) {
				const call = executeCommandSpy.getCall(i);
				if (
					call.args[0] === 'setContext' && 
					call.args[1] === 'chaoscanvas.chaosEnabled'
				) {
					contextUpdated = true;
					newContextValue = call.args[2];
					break;
				}
			}
			
			assert.ok(contextUpdated, 'Context should be updated when toggling chaos mode again');
			assert.notStrictEqual(contextValue, newContextValue, 'Context value should be toggled');
		} finally {
			executeCommandSpy.restore();
		}
	});
	
	// Test integration with shuffle command
	test('Shuffle command should preserve chaos mode state', async function() {
		this.timeout(10000);
		
		// Enable chaos mode if not already enabled
		const infoMessageStub = sinon.stub(vscode.window, 'showInformationMessage').resolves(undefined);
		
		try {
			// Use a spy on setContext to determine if chaos is enabled
			const setContextSpy = sinon.spy(vscode.commands, 'executeCommand');
			
			try {
				// Toggle once to ensure we know the state
				await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
				
				// Find what state we set
				let chaosEnabled: boolean | undefined;
				
				for (let i = 0; i < setContextSpy.callCount; i++) {
					const call = setContextSpy.getCall(i);
					if (
						call.args[0] === 'setContext' && 
						call.args[1] === 'chaoscanvas.chaosEnabled'
					) {
						chaosEnabled = call.args[2];
						break;
					}
				}
				
				// If it's not enabled, toggle again
				if (!chaosEnabled) {
					setContextSpy.resetHistory();
					await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
				}
				
				// Reset info message stub
				infoMessageStub.resetHistory();
				
				// Execute shuffle command
				await vscode.commands.executeCommand('chaoscanvas.shuffleColors');
				
				// Check that the shuffle message was shown
				assert.ok(
					infoMessageStub.calledWithMatch(sinon.match(/shuffled/)),
					'Should show shuffle message when chaos is enabled'
				);
				
				// Toggle back to disable chaos mode for cleanup
				await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			} finally {
				setContextSpy.restore();
			}
		} finally {
			infoMessageStub.restore();
		}
	});
}); 