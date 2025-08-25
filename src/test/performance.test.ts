import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

suite('ChaosCanvas Performance Tests', () => {
	// Test for large file handling
	test('Should show warning for large files', async function() {
		// This test needs longer timeout
		this.timeout(30000);
		
		// Stub the showWarningMessage method
		const showWarningStub = sinon.stub(vscode.window, 'showWarningMessage').resolves(undefined);
		
		try {
			// Create a large string (approximately 250KB)
			const largeContent = 'x'.repeat(250000);
			
			// Open a text document with the large content
			const document = await vscode.workspace.openTextDocument({
				content: largeContent,
				language: 'plaintext'
			});
			
			await vscode.window.showTextDocument(document);
			
			// Enable chaos mode
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Wait for decorations to be applied (they use setTimeout)
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Verify that a warning was shown
			assert.ok(showWarningStub.called, 'Should show warning for large file');
			assert.ok(
				showWarningStub.firstCall.args[0].includes('too large'),
				'Warning should mention file size'
			);
			
			// Disable chaos mode before cleanup
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Close the document
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		} finally {
			showWarningStub.restore();
		}
	});
	
	// Test for token limitation
	test('Should limit decorations for performance reasons', async function() {
		// This test needs longer timeout
		this.timeout(30000);
		
		// Stub the createTextEditorDecorationType method to count decorations
		const createDecorationStub = sinon.stub(vscode.window, 'createTextEditorDecorationType').callThrough();
		
		try {
			// Create a document with many tokens
			const manyTokensContent = 'a '.repeat(6000); // Should create 6000 tokens
			
			const document = await vscode.workspace.openTextDocument({
				content: manyTokensContent,
				language: 'plaintext'
			});
			
			await vscode.window.showTextDocument(document);
			
			// Enable chaos mode
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Wait for decorations to be applied (they use setTimeout)
			await new Promise(resolve => setTimeout(resolve, 1000));
			
			// Verify that decorations were created but limited
			assert.ok(createDecorationStub.called, 'Should have created text editor decorations');
			
			// The maxTokensPerFile in extension.ts is set to 5000
			assert.ok(
				createDecorationStub.callCount <= 5000, 
				`Decoration count (${createDecorationStub.callCount}) should be limited to maxTokensPerFile (5000)`
			);
			
			// Disable chaos mode before cleanup
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Close the document
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		} finally {
			createDecorationStub.restore();
		}
	});
}); 