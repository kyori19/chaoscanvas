import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';

suite('ChaosCanvas Decoration Tests', () => {
	// Utility to create and open a document for testing
	async function createTestDocument(content: string): Promise<vscode.TextDocument> {
		const document = await vscode.workspace.openTextDocument({
			content: content,
			language: 'typescript'
		});
		
		await vscode.window.showTextDocument(document);
		return document;
	}
	
	// Utility to clean up a document
	async function closeTestDocument(document: vscode.TextDocument): Promise<boolean> {
		return await vscode.workspace.openTextDocument(document.uri)
			.then(async () => vscode.commands.executeCommand('workbench.action.closeActiveEditor') as Promise<boolean>);
	}
	
	// Test for document opening behavior
	test('Should apply decorations when chaos mode is enabled', async function() {
		// This test needs longer timeout
		this.timeout(10000);
		
		// Stub the createTextEditorDecorationType method to track decorations
		const createDecorationStub = sinon.stub(vscode.window, 'createTextEditorDecorationType').callThrough();
		
		try {
			// Create a simple test document
			const document = await createTestDocument('function testFunction() {\n  console.log("Hello, world!");\n}');
			
			// Enable chaos mode first
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Wait for decorations to be applied (they use setTimeout)
			await new Promise(resolve => setTimeout(resolve, 500));
			
			// Verify that decorations were created
			assert.ok(createDecorationStub.called, 'Should have created text editor decorations');
			
			// Disable chaos mode before cleanup
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Clean up
			await closeTestDocument(document);
		} finally {
			createDecorationStub.restore();
		}
	});
	
	// Test for config impact on decorations
	test('Configuration changes should affect decorations', async function() {
		// This test needs longer timeout
		this.timeout(10000);
		
		// Set custom configuration for the test
		const originalSatRange = vscode.workspace.getConfiguration('chaoscanvas').get('saturationRange') as number[];
		const originalLightRange = vscode.workspace.getConfiguration('chaoscanvas').get('lightnessRange') as number[];
		
		try {
			// Set custom values for the test
			await vscode.workspace.getConfiguration('chaoscanvas').update('saturationRange', [50, 60], vscode.ConfigurationTarget.Global);
			await vscode.workspace.getConfiguration('chaoscanvas').update('lightnessRange', [30, 40], vscode.ConfigurationTarget.Global);
			
			// Create a stub to verify the decoration colors
			const createDecorationStub = sinon.stub(vscode.window, 'createTextEditorDecorationType').callThrough();
			
			// Create a test document
			const document = await createTestDocument('const test = "color test";');
			
			// Enable chaos mode
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Wait for decorations to be applied
			await new Promise(resolve => setTimeout(resolve, 500));
			
			// Verify that decorations were created with expected properties
			assert.ok(createDecorationStub.called, 'Should have created text editor decorations');
			
			// Regex to check HSL values within our ranges
			const hslRegex = /hsl\(\d+, (5\d|60)%, (3\d|40)%\)/;
			
			// At least one decoration should have HSL values in our range
			let foundMatchingDecoration = false;
			
			for (let i = 0; i < createDecorationStub.callCount; i++) {
				const options = createDecorationStub.getCall(i).args[0];
				if (options.color && typeof options.color === 'string' && hslRegex.test(options.color)) {
					foundMatchingDecoration = true;
					break;
				}
			}
			
			assert.ok(foundMatchingDecoration, 'At least one decoration should use the configured color ranges');
			
			// Disable chaos mode
			await vscode.commands.executeCommand('chaoscanvas.toggleChaos');
			
			// Clean up
			await closeTestDocument(document);
			createDecorationStub.restore();
		} finally {
			// Restore original configuration
			await vscode.workspace.getConfiguration('chaoscanvas').update('saturationRange', originalSatRange, vscode.ConfigurationTarget.Global);
			await vscode.workspace.getConfiguration('chaoscanvas').update('lightnessRange', originalLightRange, vscode.ConfigurationTarget.Global);
		}
	});
}); 