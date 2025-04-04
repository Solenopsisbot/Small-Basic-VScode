import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { SmallBasicCompletionProvider } from './completionProvider';
import { checkSyntax } from './syntaxChecker';
import { SmallBasicHoverProvider } from './hoverProvider';
import { SmallBasicCodeActionProvider } from './codeActionProvider';
import { SmallBasicDocumentFormatter } from './formatter';
import { getConfig, updateConfig } from './configUtils';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "small-basic-vscode-extension" is now active!');

    // Store extension path for use in commands
    const extensionPath = context.extensionPath;
    
    // Load configuration
    const config = getConfig(extensionPath);
    
    // Completion Provider
    const completionProvider = new SmallBasicCompletionProvider();

    // Register for auto-triggering on dot
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'smallbasic', 
            completionProvider,
            '.' // Trigger character
        )
    );

    // Also register for manual invocation (Ctrl+Space)
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            'smallbasic',
            completionProvider
        )
    );
    
    // Register the formatter
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('smallbasic', new SmallBasicDocumentFormatter())
    );
    
    // Set up auto-formatting on save if enabled in config
    if (config.autoFormatOnSave) {
        context.subscriptions.push(
            vscode.workspace.onWillSaveTextDocument(event => {
                if (event.document.languageId === 'smallbasic') {
                    event.waitUntil(
                        vscode.commands.executeCommand('editor.action.formatDocument')
                    );
                }
            })
        );
    }
    
    // Register compile command
    const compileCommand = vscode.commands.registerCommand('smallbasic.compile', async () => {
        await runCompiler();
    });
    
    // Register run command
    const runCommand = vscode.commands.registerCommand('smallbasic.run', async () => {
        await runCompiledProgram();
    });
    
    // Register the compile and run command
    const compileAndRunCommand = vscode.commands.registerCommand('smallbasic.compileAndRun', async () => {
        await compileAndRun();
    });
    
    // Register command to open settings
    const settingsCommand = vscode.commands.registerCommand('smallbasic.settings', async () => {
        const config = getConfig(extensionPath);
        
        // Create QuickPick for settings
        const items: vscode.QuickPickItem[] = [
            {
                label: `Compiler Path: ${config.compilerPath}`,
                description: 'Set the path to the Small Basic compiler'
            },
            {
                label: `Syntax Check Level: ${config.syntaxCheckLevel}`,
                description: 'Set the level of syntax checking (minimal, standard, strict)'
            },
            {
                label: `Auto Format on Save: ${config.autoFormatOnSave ? 'Enabled' : 'Disabled'}`,
                description: 'Toggle auto-formatting when saving'
            }
        ];
        
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a setting to change'
        });
        
        if (selected) {
            if (selected.label.startsWith('Compiler Path')) {
                const newPath = await vscode.window.showInputBox({
                    prompt: 'Enter the path to the Small Basic compiler',
                    value: config.compilerPath
                });
                
                if (newPath) {
                    updateConfig(extensionPath, { compilerPath: newPath });
                    vscode.window.showInformationMessage('Compiler path updated');
                }
            } else if (selected.label.startsWith('Syntax Check Level')) {
                const level = await vscode.window.showQuickPick(['minimal', 'standard', 'strict'], {
                    placeHolder: 'Select syntax checking level'
                }) as 'minimal' | 'standard' | 'strict';
                
                if (level) {
                    updateConfig(extensionPath, { syntaxCheckLevel: level });
                    vscode.window.showInformationMessage(`Syntax check level set to ${level}`);
                }
            } else if (selected.label.startsWith('Auto Format')) {
                const newValue = !config.autoFormatOnSave;
                updateConfig(extensionPath, { autoFormatOnSave: newValue });
                vscode.window.showInformationMessage(`Auto format on save: ${newValue ? 'enabled' : 'disabled'}`);
            }
        }
    });
    
    context.subscriptions.push(compileCommand, runCommand, compileAndRunCommand, settingsCommand);
    
    // Add a status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(play) Run Small Basic";
    statusBarItem.command = 'smallbasic.compileAndRun';
    statusBarItem.tooltip = 'Compile and Run Small Basic program';
    
    // Show status bar item when editing Small Basic files
    function updateStatusBarItem(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.languageId === 'smallbasic') {
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    }
    
    updateStatusBarItem();
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
    context.subscriptions.push(statusBarItem);

    // Create a diagnostics collection for syntax errors
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('smallbasic');
    // Create a separate collection for compiler errors
    const compilerDiagnosticsCollection = vscode.languages.createDiagnosticCollection('smallbasic-compiler');
    context.subscriptions.push(diagnosticsCollection, compilerDiagnosticsCollection);
    
    // Register code action provider for quick fixes
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('smallbasic', new SmallBasicCodeActionProvider(), {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
        })
    );
    
    // Function to check syntax and update diagnostics
    function updateDiagnostics(document: vscode.TextDocument) {
        if (document.languageId !== 'smallbasic') {
            return;
        }
        
        // Skip syntax check if set to minimal in config
        if (config.syntaxCheckLevel === 'minimal') {
            diagnosticsCollection.clear();
            return;
        }
        
        // Save the document to a temporary file to check syntax
        const tempFile = path.join(os.tmpdir(), `sb-syntax-check-${Date.now()}.sb`);
        fs.writeFileSync(tempFile, document.getText());
        
        try {
            const syntaxErrors = checkSyntax(tempFile);
            
            // Filter errors based on syntax check level
            const filteredErrors = syntaxErrors.filter(error => {
                if (config.syntaxCheckLevel === 'strict') {
                    return true; // Show all errors in strict mode
                }
                
                // In standard mode, show errors and warnings but not all informational messages
                if (error.severity === 'error' || error.severity === 'warning') {
                    return true;
                }
                
                // Only show some informational messages in standard mode
                return ['unclosed-block', 'undefined-subroutine', 'undefined-label'].includes(error.code || '');
            });
            
            const diagnostics: vscode.Diagnostic[] = filteredErrors.map(error => {
                const line = error.line - 1;  // Lines are 0-indexed in VSCode
                
                // Create a range that only covers the specific member if column info is available
                let range;
                if (error.column !== undefined) {
                    const startCol = error.column;
                    // For member errors, highlight just the member name (estimated 10 chars)
                    const endCol = error.code === 'invalid-member' ? 
                        Math.min(startCol + 10, document.lineAt(line).text.length) : 
                        document.lineAt(line).text.length;
                    
                    range = new vscode.Range(line, startCol, line, endCol);
                } else {
                    range = new vscode.Range(line, 0, line, document.lineAt(line).text.length);
                }
                
                const severity = error.severity === 'error' ? 
                    vscode.DiagnosticSeverity.Error : 
                    error.severity === 'warning' ?
                        vscode.DiagnosticSeverity.Warning :
                        vscode.DiagnosticSeverity.Information;
                
                const diagnostic = new vscode.Diagnostic(range, error.message, severity);
                diagnostic.source = 'smallbasic';
                diagnostic.code = error.code || '';
                return diagnostic;
            });
            
            diagnosticsCollection.set(document.uri, diagnostics);
        } catch (err) {
            console.error('Error checking syntax:', err);
        } finally {
            // Clean up temp file
            try {
                fs.unlinkSync(tempFile);
            } catch (err) {
                console.error('Error deleting temp file:', err);
            }
        }
    }
    
    // Check syntax on more events for better responsiveness
    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics),
        vscode.workspace.onDidChangeTextDocument(debounce((e: vscode.TextDocumentChangeEvent) => {
            updateDiagnostics(e.document);
        }, 500)) // Debounce to avoid too many updates
    );
    
    // Also check current document if any
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document);
    }

    // Parse compiler output for error reporting
    function parseCompilerOutput(output: string, filePath: string): vscode.Diagnostic[] {
        const diagnostics: vscode.Diagnostic[] = [];
        const errorRegex = /Error at line (\d+): (.+)/gi;
        const warningRegex = /Warning at line (\d+): (.+)/gi;
        
        // Clear any existing compiler diagnostics
        compilerDiagnosticsCollection.clear();
        
        let match;
        // Find error messages
        while ((match = errorRegex.exec(output)) !== null) {
            const lineNum = parseInt(match[1], 10) - 1; // Convert to 0-based
            const message = match[2];
            
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(lineNum, 0, lineNum, 1000), // We don't know the exact columns
                message,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = 'Small Basic Compiler';
            diagnostics.push(diagnostic);
        }
        
        // Find warning messages
        while ((match = warningRegex.exec(output)) !== null) {
            const lineNum = parseInt(match[1], 10) - 1; // Convert to 0-based
            const message = match[2];
            
            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(lineNum, 0, lineNum, 1000), // We don't know the exact columns
                message,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.source = 'Small Basic Compiler';
            diagnostics.push(diagnostic);
        }
        
        // Set diagnostics for this file
        if (diagnostics.length > 0) {
            const uri = vscode.Uri.file(filePath);
            compilerDiagnosticsCollection.set(uri, diagnostics);
        }
        
        return diagnostics;
    }

    // Utility functions for direct command execution
    async function runCompiler() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'smallbasic') {
            vscode.window.showErrorMessage('No active Small Basic file found');
            return false;
        }
        
        // Save the document before compiling
        try {
            await editor.document.save();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save document: ${error}`);
            return false;
        }
        
        const filePath = editor.document.uri.fsPath;
        
        // Check syntax first
        const syntaxErrors = checkSyntax(filePath);
        const hasErrors = syntaxErrors.some(error => error.severity === 'error');
        
        if (hasErrors) {
            vscode.window.showErrorMessage('Syntax errors found. Please fix them before compiling.');
            return false;
        }
        
        const fileDir = path.dirname(filePath);
        const compilerScriptPath = path.join(extensionPath, 'out', 'smallBasicCompiler.js');
        
        // Verify the compiler script exists
        if (!fs.existsSync(compilerScriptPath)) {
            vscode.window.showErrorMessage(`Compiler script not found at: ${compilerScriptPath}`);
            return false;
        }
        
        // Show output channel
        const outputChannel = vscode.window.createOutputChannel('Small Basic Compiler');
        outputChannel.clear(); // Clear previous output
        outputChannel.show(true);
        outputChannel.appendLine(`Compiling: ${filePath}`);
        
        try {
            // Clear any existing compiler diagnostics
            compilerDiagnosticsCollection.clear();
            
            const compilation = cp.spawnSync('node', [compilerScriptPath, filePath], {
                encoding: 'utf8',
                env: { ...process.env, EXTENSION_PATH: extensionPath },
                cwd: fileDir // Set current working directory to the source file's directory
            });
            
            if (compilation.stderr && compilation.stderr.length > 0) {
                outputChannel.appendLine(`Error: ${compilation.stderr}`);
                // Parse the compiler output to show errors in the editor
                const diagnostics = parseCompilerOutput(compilation.stderr, filePath);
                if (diagnostics.length > 0) {
                    vscode.window.showErrorMessage(`Compilation failed with ${diagnostics.length} error(s). See problems panel for details.`);
                } else {
                    vscode.window.showErrorMessage('Compilation failed. See output for details.');
                }
                return false;
            }
            
            if (compilation.status !== 0) {
                outputChannel.appendLine(`Compilation failed with code: ${compilation.status}`);
                // Parse the compiler output to show errors in the editor
                if (compilation.stdout) {
                    const diagnostics = parseCompilerOutput(compilation.stdout, filePath);
                    if (diagnostics.length > 0) {
                        vscode.window.showErrorMessage(`Compilation failed with ${diagnostics.length} error(s). See problems panel for details.`);
                    } else {
                        vscode.window.showErrorMessage('Compilation failed. See output for details.');
                    }
                } else {
                    vscode.window.showErrorMessage('Compilation failed. See output for details.');
                }
                return false;
            }
            
            outputChannel.appendLine(compilation.stdout || 'Compilation successful');
            vscode.window.showInformationMessage('Small Basic program compiled successfully');
            return true;
        } catch (error) {
            outputChannel.appendLine(`Error during compilation: ${error}`);
            vscode.window.showErrorMessage(`Compilation failed: ${error}`);
            return false;
        }
    }
    
    async function runCompiledProgram() {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'smallbasic') {
            vscode.window.showErrorMessage('No active Small Basic file found');
            return;
        }
        
        const filePath = editor.document.uri.fsPath;
        const fileDir = path.dirname(filePath);
        const exePath = filePath.replace(/\.sb$/i, '.exe');
        
        if (!fs.existsSync(exePath)) {
            vscode.window.showErrorMessage('Compiled program not found. Please compile first.');
            return;
        }
        
        const runnerScriptPath = path.join(extensionPath, 'out', 'smallBasicRunner.js');
        
        try {
            const outputChannel = vscode.window.createOutputChannel('Small Basic Runner');
            outputChannel.show(true);
            outputChannel.appendLine(`Running: ${exePath}`);
            
            cp.spawn('node', [runnerScriptPath, exePath], {
                detached: true,
                stdio: 'ignore',
                env: { ...process.env, EXTENSION_PATH: extensionPath },
                cwd: fileDir // Set current working directory to the source file's directory
            }).unref();
            
            outputChannel.appendLine('Program launched');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to run program: ${error}`);
        }
    }
    
    async function compileAndRun() {
        const success = await runCompiler();
        if (success) {
            await runCompiledProgram();
        }
    }

    // Register the hover provider
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('smallbasic', new SmallBasicHoverProvider())
    );
    
    // Add ability to run the syntax checker as a separate command
    const checkSyntaxCommand = vscode.commands.registerCommand('smallbasic.checkSyntax', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'smallbasic') {
            vscode.window.showErrorMessage('No active Small Basic file found');
            return;
        }
        
        await editor.document.save();
        const filePath = editor.document.uri.fsPath;
        
        const syntaxErrors = checkSyntax(filePath);
        
        const outputChannel = vscode.window.createOutputChannel('Small Basic Syntax Check');
        outputChannel.clear();
        outputChannel.show(true);
        
        if (syntaxErrors.length === 0) {
            outputChannel.appendLine('No syntax issues found. Your code looks good!');
            vscode.window.showInformationMessage('No syntax issues found');
        } else {
            const errorCount = syntaxErrors.filter(e => e.severity === 'error').length;
            const warningCount = syntaxErrors.filter(e => e.severity === 'warning').length;
            const infoCount = syntaxErrors.filter(e => e.severity === 'information').length;
            
            outputChannel.appendLine(`Syntax check found: ${errorCount} error(s), ${warningCount} warning(s), ${infoCount} info(s)`);
            outputChannel.appendLine('');
            
            syntaxErrors.forEach(error => {
                const severityLabel = error.severity === 'error' ? 'ERROR' : 
                                    error.severity === 'warning' ? 'WARNING' : 'INFO';
                
                outputChannel.appendLine(`[${severityLabel}] Line ${error.line}: ${error.message}`);
            });
            
            if (errorCount > 0) {
                vscode.window.showErrorMessage(`Syntax check found ${errorCount} error(s) and ${warningCount} warning(s)`);
            } else if (warningCount > 0) {
                vscode.window.showWarningMessage(`Syntax check found ${warningCount} warning(s)`);
            } else {
                vscode.window.showInformationMessage(`Syntax check found ${infoCount} suggestion(s)`);
            }
        }
    });
    
    context.subscriptions.push(checkSyntaxCommand);
    
    // Add command to show runtime statistics after program execution
    const showStatsCommand = vscode.commands.registerCommand('smallbasic.showStats', async () => {
        // This command would analyze the program statically to provide insights
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'smallbasic') {
            vscode.window.showErrorMessage('No active Small Basic file found');
            return;
        }
        
        const text = editor.document.getText();
        const lines = text.split('\n');
        
        // Count various elements
        const stats = {
            lines: lines.length,
            codeLines: lines.filter(line => line.trim() && !line.trim().startsWith('\'')).length,
            commentLines: lines.filter(line => line.trim().startsWith('\'')).length,
            emptyLines: lines.filter(line => !line.trim()).length,
            ifStatements: (text.match(/\bIf\b/gi) || []).length,
            forLoops: (text.match(/\bFor\b/gi) || []).length,
            whileLoops: (text.match(/\bWhile\b/gi) || []).length,
            subroutines: (text.match(/\bSub\b/gi) || []).length,
            variableAssignments: (text.match(/\b\w+\s*=/g) || []).length,
            maxLineLength: Math.max(...lines.map(line => line.length))
        };
        
        const outputChannel = vscode.window.createOutputChannel('Small Basic Program Statistics');
        outputChannel.clear();
        outputChannel.show(true);
        
        outputChannel.appendLine('# Small Basic Program Statistics');
        outputChannel.appendLine('');
        outputChannel.appendLine(`File: ${editor.document.fileName}`);
        outputChannel.appendLine('');
        outputChannel.appendLine('## Line Counts');
        outputChannel.appendLine(`Total lines: ${stats.lines}`);
        outputChannel.appendLine(`Code lines: ${stats.codeLines}`);
        outputChannel.appendLine(`Comment lines: ${stats.commentLines}`);
        outputChannel.appendLine(`Empty lines: ${stats.emptyLines}`);
        outputChannel.appendLine(`Longest line: ${stats.maxLineLength} characters`);
        outputChannel.appendLine('');
        outputChannel.appendLine('## Program Structure');
        outputChannel.appendLine(`If statements: ${stats.ifStatements}`);
        outputChannel.appendLine(`For loops: ${stats.forLoops}`);
        outputChannel.appendLine(`While loops: ${stats.whileLoops}`);
        outputChannel.appendLine(`Subroutines: ${stats.subroutines}`);
        outputChannel.appendLine(`Variable assignments: ${stats.variableAssignments}`);
        
        // Complexity estimate
        const complexity = stats.ifStatements + stats.forLoops * 2 + stats.whileLoops * 2 + Math.floor(stats.codeLines / 20);
        let complexityRating = 'Low';
        if (complexity > 30) complexityRating = 'Very High';
        else if (complexity > 20) complexityRating = 'High';
        else if (complexity > 10) complexityRating = 'Medium';
        
        outputChannel.appendLine('');
        outputChannel.appendLine('## Complexity Analysis');
        outputChannel.appendLine(`Complexity score: ${complexity} (${complexityRating})`);
        
        if (complexity > 20) {
            outputChannel.appendLine('');
            outputChannel.appendLine('### Recommendations');
            outputChannel.appendLine('- Consider breaking this program into smaller subroutines');
            outputChannel.appendLine('- Simplify complex if-else structures where possible');
            outputChannel.appendLine('- Add more comments to explain complex logic');
        }
    });
    
    context.subscriptions.push(showStatsCommand);
    
    // Add a documentation panel command
    const showDocsCommand = vscode.commands.registerCommand('smallbasic.showDocs', async () => {
        const panel = vscode.window.createWebviewPanel(
            'smallBasicDocs',
            'Small Basic Documentation',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true
            }
        );
        
        panel.webview.html = getDocumentationHtml();
    });
    
    context.subscriptions.push(showDocsCommand);
}

// Debounce function to limit the frequency of function calls
function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout | null = null;
    
    return function executedFunction(...args: any[]) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

function getDocumentationHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Small Basic Documentation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.5; margin: 20px; }
        h1 { color: #0066cc; }
        h2 { color: #0099cc; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        h3 { color: #00cc99; }
        code { background-color: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
        pre { background-color: #f0f0f0; padding: 10px; border-radius: 5px; overflow-x: auto; }
        .example { background-color: #e6f7ff; padding: 10px; border-left: 3px solid #0099cc; margin: 10px 0; }
        .note { background-color: #fff9e6; padding: 10px; border-left: 3px solid #ffcc00; margin: 10px 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Small Basic Quick Reference</h1>
    
    <h2>Language Basics</h2>
    
    <h3>Variables</h3>
    <p>Variables in Small Basic don't need to be declared and are case-insensitive.</p>
    <div class="example">
        <code>message = "Hello"<br>
        count = 5</code>
    </div>
    
    <h3>Control Structures</h3>
    
    <h4>If-Then-Else</h4>
    <pre>
If condition Then
  statements
ElseIf anotherCondition Then
  statements
Else
  statements
EndIf</pre>
    
    <h4>For Loop</h4>
    <pre>
For variable = start To end [Step value]
  statements
Next</pre>
    
    <h4>While Loop</h4>
    <pre>
While condition
  statements
EndWhile</pre>
    
    <h4>Subroutines</h4>
    <pre>
Sub name
  statements
EndSub

' Call the subroutine
name()</pre>
    
    <h2>Objects Reference</h2>
    
    <h3>TextWindow</h3>
    <p>Methods and properties for console input/output.</p>
    <table>
        <tr><th>Member</th><th>Description</th></tr>
        <tr><td>WriteLine(text)</td><td>Outputs text followed by a new line</td></tr>
        <tr><td>Write(text)</td><td>Outputs text without a new line</td></tr>
        <tr><td>Read()</td><td>Reads a line of text from the user</td></tr>
        <tr><td>BackgroundColor</td><td>Sets the console background color</td></tr>
        <tr><td>ForegroundColor</td><td>Sets the console text color</td></tr>
    </table>
    
    <h3>GraphicsWindow</h3>
    <p>Methods and properties for graphical output.</p>
    <table>
        <tr><th>Member</th><th>Description</th></tr>
        <tr><td>DrawLine(x1, y1, x2, y2)</td><td>Draws a line between two points</td></tr>
        <tr><td>DrawRectangle(x, y, width, height)</td><td>Draws a rectangle outline</td></tr>
        <tr><td>FillRectangle(x, y, width, height)</td><td>Draws a filled rectangle</td></tr>
        <tr><td>Width, Height</td><td>Set the window dimensions</td></tr>
        <tr><td>PenColor, PenWidth</td><td>Set the drawing pen attributes</td></tr>
        <tr><td>BrushColor</td><td>Set the fill color</td></tr>
    </table>
    
    <div class="note">
        <strong>Note:</strong> For more detailed documentation, visit the <a href="https://smallbasic-publicwebsite.azurewebsites.net/tutorials">official Small Basic tutorials</a>.
    </div>
</body>
</html>`;
}

export function deactivate() {}
