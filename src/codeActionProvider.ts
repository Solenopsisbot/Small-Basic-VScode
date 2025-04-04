import * as vscode from 'vscode';

export class SmallBasicCodeActionProvider implements vscode.CodeActionProvider {
    public provideCodeActions(
        document: vscode.TextDocument,
        _range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        const codeActions: vscode.CodeAction[] = [];
        
        // Process each diagnostic reported by our linter
        for (const diagnostic of context.diagnostics) {
            // Only process diagnostics from our extension
            if (diagnostic.source !== 'smallbasic') {
                continue;
            }
            
            const diagnosticCode = (diagnostic.code as string) || '';
            
            switch (diagnosticCode) {
                case 'zero-index-array': {
                    // Fix for zero-based array indexing
                    const lineText = document.lineAt(diagnostic.range.start.line).text;
                    const fixAction = this.createReplaceAction(
                        'Use index 1 (standard in Small Basic)',
                        document,
                        diagnostic.range.start.line,
                        lineText.replace(/\[0\]/g, '[1]')
                    );
                    fixAction.diagnostics = [diagnostic];
                    codeActions.push(fixAction);
                    break;
                }
                
                case 'zero-based-loop': {
                    // Fix for loops starting at 0
                    const lineText = document.lineAt(diagnostic.range.start.line).text;
                    const fixAction = this.createReplaceAction(
                        'Start loop from 1 (standard in Small Basic)',
                        document,
                        diagnostic.range.start.line,
                        lineText.replace(/For\s+(\w+)\s*=\s*0\b/i, 'For $1 = 1')
                    );
                    fixAction.diagnostics = [diagnostic];
                    codeActions.push(fixAction);
                    break;
                }
                
                case 'semicolon-usage': {
                    // Fix for semicolons (not used in Small Basic)
                    const lineText = document.lineAt(diagnostic.range.start.line).text;
                    const fixAction = this.createReplaceAction(
                        'Remove semicolon',
                        document,
                        diagnostic.range.start.line,
                        lineText.replace(/;/g, '')
                    );
                    fixAction.diagnostics = [diagnostic];
                    codeActions.push(fixAction);
                    break;
                }
                
                case 'lowercase-keyword': {
                    // Fix for lowercase keywords
                    const lineText = document.lineAt(diagnostic.range.start.line).text;
                    const fixAction = this.createReplaceAction(
                        'Use proper case for keyword',
                        document,
                        diagnostic.range.start.line,
                        this.fixKeywordCase(lineText)
                    );
                    fixAction.diagnostics = [diagnostic];
                    codeActions.push(fixAction);
                    break;
                }
                
                case 'missing-parentheses': {
                    // Fix for methods called without parentheses
                    const lineText = document.lineAt(diagnostic.range.start.line).text;
                    const matches = Array.from(lineText.matchAll(/\b(\w+)\.(\w+)(?!\(|\s*=)/g));
                    
                    for (const match of matches) {
                        const methodName = match[2];
                        const startPos = match.index! + match[0].length;
                        const fixAction = new vscode.CodeAction(
                            `Add parentheses to ${methodName}()`,
                            vscode.CodeActionKind.QuickFix
                        );
                        
                        const replaceRange = new vscode.Range(
                            new vscode.Position(diagnostic.range.start.line, startPos),
                            new vscode.Position(diagnostic.range.start.line, startPos)
                        );
                        
                        fixAction.edit = new vscode.WorkspaceEdit();
                        fixAction.edit.insert(document.uri, replaceRange.start, '()');
                        fixAction.diagnostics = [diagnostic];
                        codeActions.push(fixAction);
                    }
                    break;
                }
            }
        }
        
        return codeActions;
    }
    
    private createReplaceAction(title: string, document: vscode.TextDocument, line: number, newText: string): vscode.CodeAction {
        const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        const lineRange = document.lineAt(line).range;
        
        action.edit = new vscode.WorkspaceEdit();
        action.edit.replace(document.uri, lineRange, newText);
        
        return action;
    }
    
    private fixKeywordCase(text: string): string {
        const keywords = [
            { pattern: /\bif\b/gi, replacement: 'If' },
            { pattern: /\bthen\b/gi, replacement: 'Then' },
            { pattern: /\belse\b/gi, replacement: 'Else' },
            { pattern: /\belseif\b/gi, replacement: 'ElseIf' },
            { pattern: /\bendif\b/gi, replacement: 'EndIf' },
            { pattern: /\bfor\b/gi, replacement: 'For' },
            { pattern: /\bto\b/gi, replacement: 'To' },
            { pattern: /\bstep\b/gi, replacement: 'Step' },
            { pattern: /\bnext\b/gi, replacement: 'Next' },
            { pattern: /\bwhile\b/gi, replacement: 'While' },
            { pattern: /\bendwhile\b/gi, replacement: 'EndWhile' },
            { pattern: /\bsub\b/gi, replacement: 'Sub' },
            { pattern: /\bendsub\b/gi, replacement: 'EndSub' },
            { pattern: /\bgoto\b/gi, replacement: 'Goto' },
            { pattern: /\blabel\b/gi, replacement: 'Label' }
        ];
        
        let result = text;
        for (const keyword of keywords) {
            result = result.replace(keyword.pattern, keyword.replacement);
        }
        
        return result;
    }
}
