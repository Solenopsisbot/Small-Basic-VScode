import * as vscode from 'vscode';

export class SmallBasicDocumentFormatter implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        const edits: vscode.TextEdit[] = [];
        const text = document.getText();
        const lines = text.split(/\r?\n/);
        
        let indentLevel = 0;
        let formattedLines: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Skip empty lines
            if (line === '') {
                formattedLines.push('');
                continue;
            }
            
            // Handle comments
            const commentStart = line.indexOf("'");
            let code = line;
            let comment = '';
            
            if (commentStart >= 0) {
                code = line.substring(0, commentStart).trim();
                comment = line.substring(commentStart);
            }
            
            // Adjust indent based on content
            if (/\b(EndIf|EndWhile|Next|EndSub)\b/i.test(code)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Create indentation
            const indent = ' '.repeat(indentLevel * options.tabSize);
            
            // Format the line
            let formattedLine = '';
            if (code) {
                formattedLine = indent + code;
            }
            
            // Add comment if it exists
            if (comment) {
                if (formattedLine) {
                    formattedLine += ' ' + comment;
                } else {
                    formattedLine = indent + comment;
                }
            }
            
            formattedLines.push(formattedLine);
            
            // Increase indentation for block starts
            if (/\b(If\s+.*\s+Then|While|For\s+.*\s+To|Sub)\b/i.test(code) && 
                !/\bThen\s+.*\bEndIf\b/i.test(code)) { // Skip one-line If statements
                indentLevel++;
            }
        }
        
        // Create a single edit that replaces the entire document
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(text.length)
        );
        
        edits.push(vscode.TextEdit.replace(fullRange, formattedLines.join('\n')));
        return edits;
    }
}
