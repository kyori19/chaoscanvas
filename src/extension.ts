// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

class ChaosCanvas {
	private activeEditor: vscode.TextEditor | undefined;
	private enabled: boolean = false;
	private decorations: vscode.TextEditorDecorationType[] = [];
	private tokenRegex = /(\w+|[^\w\s]+|\s+)/g;
	private decorationTimeout: NodeJS.Timeout | undefined;
	private maxTokensPerFile = 5000; // Limit tokens to prevent performance issues

	constructor(context: vscode.ExtensionContext) {
		this.activeEditor = vscode.window.activeTextEditor;

		// Register event handlers
		vscode.window.onDidChangeActiveTextEditor(editor => {
			this.activeEditor = editor;
			if (this.enabled && editor) {
				this.triggerUpdateDecorations();
			}
		}, null, context.subscriptions);

		vscode.workspace.onDidChangeTextDocument(event => {
			if (this.enabled && this.activeEditor && event.document === this.activeEditor.document) {
				this.triggerUpdateDecorations();
			}
		}, null, context.subscriptions);

		// Set context value for when clause in menu
		vscode.commands.executeCommand('setContext', 'chaoscanvas.chaosEnabled', this.enabled);
	}

	public toggleChaos(): void {
		this.enabled = !this.enabled;
		vscode.commands.executeCommand('setContext', 'chaoscanvas.chaosEnabled', this.enabled);

		if (this.enabled) {
			this.triggerUpdateDecorations();
			vscode.window.showInformationMessage('Chaos mode activated! Your code is now a beautiful mess.');
		} else {
			this.clearDecorations();
			vscode.window.showInformationMessage('Order has been restored to your code.');
		}
	}

	public shuffleColors(): void {
		if (this.enabled) {
			this.clearDecorations();
			this.triggerUpdateDecorations();
			vscode.window.showInformationMessage('Colors have been shuffled! Enjoy the new chaos!');
		}
	}

	private clearDecorations(): void {
		this.decorations.forEach(decoration => {
			decoration.dispose();
		});
		this.decorations = [];

		if (this.decorationTimeout) {
			clearTimeout(this.decorationTimeout);
			this.decorationTimeout = undefined;
		}
	}

	private triggerUpdateDecorations(): void {
		if (this.decorationTimeout) {
			clearTimeout(this.decorationTimeout);
			this.decorationTimeout = undefined;
		}
		
		// Use a timeout to debounce multiple rapid changes
		this.decorationTimeout = setTimeout(() => {
			this.updateDecorations();
		}, 300);
	}

	private updateDecorations(): void {
		if (!this.activeEditor) {
			return;
		}

		this.clearDecorations();
		
		const text = this.activeEditor.document.getText();
		const totalChars = text.length;

		// Check if the file is too large
		if (totalChars > 200000) { // ~200KB
			vscode.window.showWarningMessage(
				'File is too large for ChaosCanvas. Performance may be affected. Consider disabling chaos mode for this file.'
			);
		}
		
		// Get configuration for color ranges
		const config = vscode.workspace.getConfiguration('chaoscanvas');
		const satRange = config.get('saturationRange') as number[];
		const lightRange = config.get('lightnessRange') as number[];

		// Get visible ranges to only decorate what's visible
		const visibleRanges = this.activeEditor.visibleRanges;
		let visibleText = '';
		let visibleOffsets: { start: number, end: number }[] = [];
		
		for (const range of visibleRanges) {
			const startOffset = this.activeEditor.document.offsetAt(range.start);
			const endOffset = this.activeEditor.document.offsetAt(range.end);
			visibleText += text.substring(startOffset, endOffset) + ' ';
			visibleOffsets.push({ start: startOffset, end: endOffset });
		}

		let match;
		let tokenCount = 0;
		
		// Create all decorations at once for better performance
		const decorationOptions: Map<vscode.TextEditorDecorationType, vscode.Range[]> = new Map();

		// Find all tokens and apply a random color to each
		while ((match = this.tokenRegex.exec(visibleText)) && tokenCount < this.maxTokensPerFile) {
			// Skip whitespace tokens
			if (match[0].trim() === '') {
				continue;
			}
			
			const matchStart = match.index;
			const matchEnd = match.index + match[0].length;
			
			// Create a new decoration with a random color
			const decoration = vscode.window.createTextEditorDecorationType({
				color: this.generateRandomColor(satRange, lightRange)
			});
			
			// Find the correct document position for this match
			let documentOffset = this.findDocumentOffset(matchStart, visibleText, visibleOffsets);
			if (documentOffset === -1) {
				continue;
			}
			
			const startPos = this.activeEditor.document.positionAt(documentOffset);
			const endPos = this.activeEditor.document.positionAt(documentOffset + (matchEnd - matchStart));
			
			decorationOptions.set(decoration, [new vscode.Range(startPos, endPos)]);
			this.decorations.push(decoration);
			tokenCount++;
		}
		
		// Apply all decorations at once
		decorationOptions.forEach((ranges, decoration) => {
			this.activeEditor?.setDecorations(decoration, ranges);
		});
	}

	private findDocumentOffset(matchOffset: number, visibleText: string, visibleOffsets: { start: number, end: number }[]): number {
		let currentOffset = 0;
		
		for (const range of visibleOffsets) {
			const rangeLength = range.end - range.start;
			
			if (matchOffset >= currentOffset && matchOffset < currentOffset + rangeLength) {
				return range.start + (matchOffset - currentOffset);
			}
			
			currentOffset += rangeLength + 1; // +1 for the space we added between ranges
		}
		
		return -1;
	}

	private generateRandomColor(satRange: number[], lightRange: number[]): string {
		// Generate random hue (0-360)
		const hue = Math.floor(Math.random() * 360);
		
		// Generate random saturation and lightness within configured ranges
		const saturation = this.randomInRange(satRange[0], satRange[1]);
		const lightness = this.randomInRange(lightRange[0], lightRange[1]);
		
		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
	}

	private randomInRange(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('ChaosCanvas is now active!');

	const chaosCanvas = new ChaosCanvas(context);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('chaoscanvas.toggleChaos', () => {
			chaosCanvas.toggleChaos();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('chaoscanvas.shuffleColors', () => {
			chaosCanvas.shuffleColors();
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// No cleanup needed
}
