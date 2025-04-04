import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { SmallBasicCompletionProvider } from './completionProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "small-basic-vscode-extension" is now active!');

    // Store extension path for use in commands
    const extensionPath = context.extensionPath;

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
    
    context.subscriptions.push(compileCommand, runCommand, compileAndRunCommand);
    
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
            const compilation = cp.spawnSync('node', [compilerScriptPath, filePath], {
                encoding: 'utf8',
                env: { ...process.env, EXTENSION_PATH: extensionPath },
                cwd: fileDir // Set current working directory to the source file's directory
            });
            
            if (compilation.stderr && compilation.stderr.length > 0) {
                outputChannel.appendLine(`Error: ${compilation.stderr}`);
                vscode.window.showErrorMessage('Compilation failed. See output for details.');
                return false;
            }
            
            if (compilation.status !== 0) {
                outputChannel.appendLine(`Compilation failed with code: ${compilation.status}`);
                vscode.window.showErrorMessage('Compilation failed. See output for details.');
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
}

export function deactivate() {}
