import * as vscode from 'vscode';

export class SmallBasicCompletionProvider implements vscode.CompletionItemProvider {
    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const completionItems: vscode.CompletionItem[] = [];
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        
        // Check if we're typing after a dot
        if (context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter && context.triggerCharacter === '.') {
            // Improved logic to get the word before the dot
            const objectMatch = linePrefix.match(/(\w+)\.$/);
            if (objectMatch && objectMatch[1]) {
                const objectName = objectMatch[1];
                return this.getMembersForObject(objectName);
            }
            return [];
        }
        
        // If we're typing after a dot but not triggered by dot character (e.g., continuing to type)
        // or if we're at position right after the dot
        if (linePrefix.includes('.')) {
            const match = linePrefix.match(/(\w+)\.(\w*)$/);
            if (match) {
                const objectName = match[1];
                const partialMethodName = match[2];
                const members = this.getMembersForObject(objectName);
                
                // Filter by what's been typed so far after the dot
                if (partialMethodName) {
                    return members.filter(item => 
                        item.label.toString().toLowerCase().startsWith(partialMethodName.toLowerCase())
                    );
                }
                return members;
            }
        }
        
        // Not after a dot, show keywords and object names
        const keywords = ['If', 'Then', 'Else', 'ElseIf', 'EndIf', 'For', 'To', 'Step', 'Next', 'While', 'EndWhile', 'Sub', 'EndSub', 'Goto', 'Label', 'Return'];
        keywords.forEach(keyword => {
            const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
            completionItems.push(item);
        });

        // Built-in objects
        const builtInObjects = ['Clock', 'File', 'Flickr', 'GraphicsWindow', 'ImageList', 'Math', 'Mouse', 'Network', 'Program', 'Shapes', 'Sound', 'Stack', 'Text', 'TextWindow', 'Timer', 'Turtle'];
        builtInObjects.forEach(object => {
            const item = new vscode.CompletionItem(object, vscode.CompletionItemKind.Module);
            completionItems.push(item);
        });

        return completionItems;
    }

    private getMembersForObject(objectName: string): vscode.CompletionItem[] {
        const completionItems: vscode.CompletionItem[] = [];
        const lowerCaseObject = objectName.toLowerCase();

        switch (lowerCaseObject) {
            case 'clock':
                return this.createMemberItems(['Hour', 'Minute', 'Second', 'Date', 'Day', 'Month', 'Year']);
            
            case 'file':
                return this.createMethodItems(['ReadContents', 'WriteContents', 'AppendContents', 'GetTemporaryFileName', 
                              'GetDirectoryName', 'GetFileName', 'GetExtension', 'OpenRead', 'OpenWrite', 
                              'OpenAppend', 'Close', 'ReadLine', 'WriteLine', 'ReadAllLines', 'WriteAllLines', 
                              'CopyFile', 'DeleteFile', 'CreateDirectory', 'DeleteDirectory', 'GetFiles', 
                              'GetDirectories', 'Exists']);
            
            case 'flickr':
                return this.createMethodItems(['GetPictureURL', 'Search']);
            
            case 'graphicswindow':
                const gwProps = ['BackgroundColor', 'BrushColor', 'PenColor', 'PenWidth', 'FontName', 
                               'FontSize', 'Title', 'Left', 'Top', 'Width', 'Height'];
                const gwMethods = ['Show', 'Hide', 'Clear', 'DrawLine', 'DrawRectangle', 'FillRectangle', 
                                  'DrawEllipse', 'FillEllipse', 'DrawTriangle', 'FillTriangle', 'DrawText', 
                                  'DrawTextAligned', 'GetPixel', 'SetPixel', 'GetRandomColor', 'GetDrawingStyle'];
                return [...this.createMemberItems(gwProps), ...this.createMethodItems(gwMethods)];
            
            case 'imagelist':
                return this.createMethodItems(['LoadImage', 'GetImage', 'GetHeight', 'GetWidth']);
                
            case 'math':
                return this.createMethodItems(['Abs', 'Acos', 'Asin', 'Atan', 'Ceiling', 'Cos', 'Floor',
                              'GetDegrees', 'GetRadians', 'Log', 'Max', 'Min', 'Power', 'Round',
                              'Sin', 'SquareRoot', 'Tan', 'GetSeed', 'SetSeed', 'GetRandomNumber']);
                
            case 'mouse':
                return this.createMemberItems(['MouseX', 'MouseY', 'IsLeftButtonDown', 'IsRightButtonDown']);
                
            case 'network':
                return this.createMethodItems(['GetHTTPText']);
                
            case 'program':
                return this.createMethodItems(['Delay', 'End', 'Pause', 'Restart', 'Launch', 'Argument']);
                
            case 'shapes':
                return this.createMethodItems(['AddEllipse', 'AddImage', 'AddLine', 'AddRectangle', 'AddText',
                               'Remove', 'Move', 'Rotate', 'Zoom', 'SetOpacity', 'GetLeft', 'GetTop',
                               'GetWidth', 'GetHeight', 'SetText', 'SetImage', 'SetBrushColor', 'SetPenColor',
                               'SetPenWidth', 'SetFontSize', 'SetFontName', 'SetTextAlignment']);
                
            case 'sound':
                return this.createMethodItems(['PlayClick', 'PlayBell', 'PlayChime', 'PlayBeep', 'PlayWaveFile', 'Stop']);
                
            case 'stack':
                return this.createMethodItems(['PushValue', 'PopValue', 'GetCount']);
                
            case 'text':
                return this.createMethodItems(['GetLength', 'GetSubText', 'ConvertToUpperCase', 'ConvertToLowerCase',
                              'IsSubText', 'GetIndexOf', 'GetReverseIndexOf', 'StartsWith', 'EndsWith',
                              'Replace', 'Append', 'GetCharacter', 'GetCharCode', 'CreateFromCharCode',
                              'GetLines', 'AppendLines', 'InsertLine', 'RemoveLine', 'GetLine', 'GetLineCount']);
            
            case 'textwindow':
                const twProps = ['BackgroundColor', 'ForegroundColor', 'CursorLeft', 'CursorTop', 'Title', 'Width', 'Height'];
                const twMethods = ['WriteLine', 'Write', 'Read', 'Clear', 'Pause'];
                return [...this.createMemberItems(twProps), ...this.createMethodItems(twMethods)];
            
            case 'timer':
                const timerProps = ['Interval', 'Tick'];
                const timerMethods = ['Start', 'Stop'];
                return [...this.createMemberItems(timerProps), ...this.createMethodItems(timerMethods)];
            
            case 'turtle':
                const turtleProps = ['X', 'Y', 'Angle', 'Speed', 'PenWidth', 'PenColor', 'BrushColor', 'IsVisible'];
                const turtleMethods = ['Move', 'Turn', 'TurnRight', 'TurnLeft', 'PenUp', 'PenDown', 'Show', 'Hide', 
                                      'Reset', 'GetColor', 'SetSpeed', 'GoTo', 'XCenter', 'YCenter', 'MoveTo', 
                                      'TurnTowards', 'ShowTurtle', 'HideTurtle'];
                return [...this.createMemberItems(turtleProps), ...this.createMethodItems(turtleMethods)];
            
            default:
                return completionItems;
        }
    }

    private createMemberItems(members: string[]): vscode.CompletionItem[] {
        return members.map(member => {
            const item = new vscode.CompletionItem(member, vscode.CompletionItemKind.Property);
            item.commitCharacters = ['.', '(', ' ', '='];
            return item;
        });
    }

    private createMethodItems(methods: string[]): vscode.CompletionItem[] {
        return methods.map(method => {
            const item = new vscode.CompletionItem(method, vscode.CompletionItemKind.Method);
            item.commitCharacters = ['('];
            // Add snippet for calling the method with parentheses
            item.insertText = new vscode.SnippetString(`${method}($0)`);
            return item;
        });
    }
}