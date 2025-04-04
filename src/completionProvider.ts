import * as vscode from 'vscode';

interface ObjectMember {
    name: string;
    type: 'property' | 'method';
    description: string;
    parameters?: string[];
    returnType?: string;
    example?: string;
}

interface SmallBasicObject {
    name: string;
    description: string;
    members: ObjectMember[];
}

export class SmallBasicCompletionProvider implements vscode.CompletionItemProvider {
    // Complete local API definitions
    private SMALL_BASIC_OBJECTS: SmallBasicObject[] = [
        {
            name: 'TextWindow',
            description: 'Provides methods for console input and output',
            members: [
                { 
                    name: 'WriteLine', 
                    type: 'method', 
                    description: 'Writes text to the console followed by a new line'
                },
                { 
                    name: 'Write', 
                    type: 'method', 
                    description: 'Writes text to the console without a new line'
                },
                { name: 'Read', type: 'method', description: 'Reads a line of text from user input' },
                { name: 'ReadNumber', type: 'method', description: 'Reads a number from user input' },
                { name: 'ReadKey', type: 'method', description: 'Reads a single key press from user input' },
                { name: 'Clear', type: 'method', description: 'Clears the text window' },
                { name: 'Pause', type: 'method', description: 'Pauses execution until user presses a key' },
                { name: 'Hide', type: 'method', description: 'Hides the text window' },
                { name: 'Show', type: 'method', description: 'Shows the text window' },
                { name: 'BackgroundColor', type: 'property', description: 'Gets or sets the background color' },
                { name: 'ForegroundColor', type: 'property', description: 'Gets or sets the text color' },
                { name: 'CursorLeft', type: 'property', description: 'Gets or sets the horizontal cursor position' },
                { name: 'CursorTop', type: 'property', description: 'Gets or sets the vertical cursor position' },
                { name: 'Left', type: 'property', description: 'Gets or sets the left position of the window' },
                { name: 'Top', type: 'property', description: 'Gets or sets the top position of the window' },
                { name: 'Title', type: 'property', description: 'Gets or sets the title of the window' }
            ]
        },
        {
            name: 'GraphicsWindow',
            description: 'Provides methods and properties for creating graphics and animations',
            members: [
                { name: 'BackgroundColor', type: 'property', description: 'Gets or sets the background color' },
                { name: 'BrushColor', type: 'property', description: 'Gets or sets the brush color for filling shapes' },
                { name: 'CanResize', type: 'property', description: 'Gets or sets whether the window can be resized' },
                { name: 'FontBold', type: 'property', description: 'Gets or sets whether the font is bold' },
                { name: 'FontItalic', type: 'property', description: 'Gets or sets whether the font is italic' },
                { name: 'FontName', type: 'property', description: 'Gets or sets the name of the font' },
                { name: 'FontSize', type: 'property', description: 'Gets or sets the size of the font' },
                { name: 'Height', type: 'property', description: 'Gets or sets the height of the window' },
                { name: 'LastKey', type: 'property', description: 'Gets the last key pressed' },
                { name: 'Left', type: 'property', description: 'Gets or sets the left position of the window' },
                { name: 'MouseX', type: 'property', description: 'Gets the X position of the mouse' },
                { name: 'MouseY', type: 'property', description: 'Gets the Y position of the mouse' },
                { name: 'PenColor', type: 'property', description: 'Gets or sets the pen color for outlines' },
                { name: 'PenWidth', type: 'property', description: 'Gets or sets the width of the pen' },
                { name: 'Title', type: 'property', description: 'Gets or sets the title of the window' },
                { name: 'Top', type: 'property', description: 'Gets or sets the top position of the window' },
                { name: 'Width', type: 'property', description: 'Gets or sets the width of the window' },
                { name: 'Clear', type: 'method', description: 'Clears the graphics window' },
                { name: 'DrawBoundText', type: 'method', description: 'Draws text within a specified area' },
                { name: 'DrawEllipse', type: 'method', description: 'Draws an ellipse outline' },
                { name: 'DrawImage', type: 'method', description: 'Draws an image at the specified position' },
                { name: 'DrawLine', type: 'method', description: 'Draws a line between two points' },
                { name: 'DrawRectangle', type: 'method', description: 'Draws a rectangle outline' },
                { name: 'DrawResizedImage', type: 'method', description: 'Draws a resized image' },
                { name: 'DrawText', type: 'method', description: 'Draws text at the specified position' },
                { name: 'DrawTriangle', type: 'method', description: 'Draws a triangle outline' },
                { name: 'FillEllipse', type: 'method', description: 'Draws a filled ellipse' },
                { name: 'FillRectangle', type: 'method', description: 'Draws a filled rectangle' },
                { name: 'FillTriangle', type: 'method', description: 'Draws a filled triangle' },
                { name: 'GetColorFromRGB', type: 'method', description: 'Creates a color from RGB values' },
                { name: 'GetPixel', type: 'method', description: 'Gets the color of a pixel' },
                { name: 'GetRandomColor', type: 'method', description: 'Gets a random color' },
                { name: 'Hide', type: 'method', description: 'Hides the graphics window' },
                { name: 'KeyDown', type: 'method', description: 'Event for key press' },
                { name: 'KeyUp', type: 'method', description: 'Event for key release' },
                { name: 'MouseDown', type: 'method', description: 'Event for mouse button press' },
                { name: 'MouseMove', type: 'method', description: 'Event for mouse movement' },
                { name: 'MouseUp', type: 'method', description: 'Event for mouse button release' },
                { name: 'SetPixel', type: 'method', description: 'Sets the color of a pixel' },
                { name: 'Show', type: 'method', description: 'Shows the graphics window' },
                { name: 'ShowMessage', type: 'method', description: 'Shows a message box' }
            ]
        },
        {
            name: 'Math',
            description: 'Provides mathematical functions and constants',
            members: [
                { name: 'Pi', type: 'property', description: 'The mathematical constant Pi (3.14159...)' },
                { name: 'Abs', type: 'method', description: 'Returns the absolute value of a number' },
                { name: 'Acos', type: 'method', description: 'Returns the arccosine of a number in radians' },
                { name: 'Asin', type: 'method', description: 'Returns the arcsine of a number in radians' },
                { name: 'Atan', type: 'method', description: 'Returns the arctangent of a number in radians' },
                { name: 'Ceiling', type: 'method', description: 'Returns the smallest integer greater than or equal to a number' },
                { name: 'Cos', type: 'method', description: 'Returns the cosine of an angle in radians' },
                { name: 'Floor', type: 'method', description: 'Returns the largest integer less than or equal to a number' },
                { name: 'GetDegrees', type: 'method', description: 'Converts an angle from radians to degrees' },
                { name: 'GetRadians', type: 'method', description: 'Converts an angle from degrees to radians' },
                { name: 'GetRandomNumber', type: 'method', description: 'Returns a random number up to the specified maximum' },
                { name: 'Log', type: 'method', description: 'Returns the natural logarithm of a number' },
                { name: 'Max', type: 'method', description: 'Returns the larger of two numbers' },
                { name: 'Min', type: 'method', description: 'Returns the smaller of two numbers' },
                { name: 'Power', type: 'method', description: 'Returns a number raised to a power' },
                { name: 'Remainder', type: 'method', description: 'Returns the remainder after division' },
                { name: 'Round', type: 'method', description: 'Rounds a number to the nearest integer' },
                { name: 'Sin', type: 'method', description: 'Returns the sine of an angle in radians' },
                { name: 'SquareRoot', type: 'method', description: 'Returns the square root of a number' },
                { name: 'Tan', type: 'method', description: 'Returns the tangent of an angle in radians' }
            ]
        },
        {
            name: 'Program',
            description: 'Provides program control methods and properties',
            members: [
                { name: 'Delay', type: 'method', description: 'Delays program execution for specified milliseconds' },
                { name: 'End', type: 'method', description: 'Ends program execution' },
                { name: 'Pause', type: 'method', description: 'Pauses program execution' },
                { name: 'Restart', type: 'method', description: 'Restarts the program' },
                { name: 'SetArguments', type: 'method', description: 'Sets command line arguments' },
                { name: 'Directory', type: 'property', description: 'Gets the directory of the program' },
                { name: 'Arguments', type: 'property', description: 'Gets the command line arguments' }
            ]
        },
        {
            name: 'Clock',
            description: 'Provides date and time information',
            members: [
                { name: 'Hour', type: 'property', description: 'Gets the current hour (0-23)' },
                { name: 'Minute', type: 'property', description: 'Gets the current minute (0-59)' },
                { name: 'Second', type: 'property', description: 'Gets the current second (0-59)' },
                { name: 'Date', type: 'property', description: 'Gets the current date as a string' },
                { name: 'Day', type: 'property', description: 'Gets the current day of month (1-31)' },
                { name: 'Month', type: 'property', description: 'Gets the current month (1-12)' },
                { name: 'Year', type: 'property', description: 'Gets the current year' },
                { name: 'WeekDay', type: 'property', description: 'Gets the current day of week (1-7, 1 is Sunday)' },
                { name: 'Time', type: 'property', description: 'Gets the current time as a string' }
            ]
        },
        {
            name: 'File',
            description: 'Provides methods for file operations',
            members: [
                { name: 'ReadContents', type: 'method', description: 'Reads all contents from a file' },
                { name: 'WriteContents', type: 'method', description: 'Writes content to a file' },
                { name: 'AppendContents', type: 'method', description: 'Appends content to a file' },
                { name: 'GetTemporaryFilePath', type: 'method', description: 'Gets a path for a temporary file' },
                { name: 'GetSettingsFilePath', type: 'method', description: 'Gets a path for a settings file' },
                { name: 'CopyFile', type: 'method', description: 'Copies a file' },
                { name: 'DeleteFile', type: 'method', description: 'Deletes a file' },
                { name: 'InsertLine', type: 'method', description: 'Inserts a line in a file' },
                { name: 'ReadLine', type: 'method', description: 'Reads a specific line from a file' },
                { name: 'WriteLine', type: 'method', description: 'Writes a line to a file' },
                { name: 'CreateDirectory', type: 'method', description: 'Creates a directory' },
                { name: 'DeleteDirectory', type: 'method', description: 'Deletes a directory' },
                { name: 'GetDirectories', type: 'method', description: 'Gets all subdirectories' },
                { name: 'GetFiles', type: 'method', description: 'Gets all files in a directory' }
            ]
        },
        {
            name: 'Sound',
            description: 'Provides methods for playing sounds and music',
            members: [
                { name: 'Play', type: 'method', description: 'Plays a sound file' },
                { name: 'PlayAndWait', type: 'method', description: 'Plays a sound file and waits for completion' },
                { name: 'PlayChime', type: 'method', description: 'Plays a chime sound' },
                { name: 'PlayChimes', type: 'method', description: 'Plays multiple chime sounds' },
                { name: 'PlayChimesAndWait', type: 'method', description: 'Plays multiple chime sounds and waits' },
                { name: 'PlayMusic', type: 'method', description: 'Plays music notes' },
                { name: 'PlayMusicAndWait', type: 'method', description: 'Plays music notes and waits' },
                { name: 'Stop', type: 'method', description: 'Stops playing sound' }
            ]
        },
        {
            name: 'Array',
            description: 'Provides methods for array operations',
            members: [
                { name: 'ContainsIndex', type: 'method', description: 'Checks if an array contains an index' },
                { name: 'ContainsValue', type: 'method', description: 'Checks if an array contains a value' },
                { name: 'GetAllIndices', type: 'method', description: 'Gets all indices in an array' },
                { name: 'GetItemCount', type: 'method', description: 'Gets the number of items in an array' },
                { name: 'GetValue', type: 'method', description: 'Gets a value from an array' },
                { name: 'IsArray', type: 'method', description: 'Checks if a variable is an array' },
                { name: 'RemoveValue', type: 'method', description: 'Removes a value from an array' },
                { name: 'SetValue', type: 'method', description: 'Sets a value in an array' }
            ]
        },
        {
            name: 'Desktop',
            description: 'Provides information about the desktop',
            members: [
                { name: 'Width', type: 'property', description: 'Gets the width of the desktop' },
                { name: 'Height', type: 'property', description: 'Gets the height of the desktop' }
            ]
        },
        {
            name: 'Turtle',
            description: 'Provides methods for turtle graphics',
            members: [
                { name: 'X', type: 'property', description: 'Gets the X coordinate of the turtle' },
                { name: 'Y', type: 'property', description: 'Gets the Y coordinate of the turtle' },
                { name: 'Angle', type: 'property', description: 'Gets or sets the angle of the turtle' },
                { name: 'Speed', type: 'property', description: 'Gets or sets the speed of the turtle' },
                { name: 'PenColor', type: 'property', description: 'Gets or sets the pen color' },
                { name: 'PenWidth', type: 'property', description: 'Gets or sets the pen width' },
                { name: 'Show', type: 'method', description: 'Shows the turtle' },
                { name: 'Hide', type: 'method', description: 'Hides the turtle' },
                { name: 'PenUp', type: 'method', description: 'Lifts the pen (stops drawing)' },
                { name: 'PenDown', type: 'method', description: 'Puts the pen down (starts drawing)' },
                { name: 'Move', type: 'method', description: 'Moves the turtle forward' },
                { name: 'MoveTo', type: 'method', description: 'Moves the turtle to coordinates' },
                { name: 'Turn', type: 'method', description: 'Turns the turtle by an angle' },
                { name: 'TurnLeft', type: 'method', description: 'Turns the turtle left' },
                { name: 'TurnRight', type: 'method', description: 'Turns the turtle right' },
                { name: 'TurnTowards', type: 'method', description: 'Turns towards coordinates' },
                { name: 'ShowTurtle', type: 'method', description: 'Shows the turtle (same as Show)' },
                { name: 'HideTurtle', type: 'method', description: 'Hides the turtle (same as Hide)' },
                { name: 'BrushColor', type: 'property', description: 'Gets or sets the brush color of the turtle' },
                { name: 'IsVisible', type: 'property', description: 'Gets whether the turtle is visible' },
                { name: 'PenDown', type: 'property', description: 'Gets or sets whether the pen is down' },
                { name: 'XCenter', type: 'property', description: 'Gets the X coordinate of the center' },
                { name: 'YCenter', type: 'property', description: 'Gets the Y coordinate of the center' },
                { name: 'GetColor', type: 'method', description: 'Gets the color at the turtle position' },
                { name: 'SetColor', type: 'method', description: 'Sets the color at the turtle position' }
            ]
        },
        {
            name: 'Timer',
            description: 'Provides timer functionality',
            members: [
                { name: 'Interval', type: 'property', description: 'Gets or sets the timer interval in milliseconds' },
                { name: 'IsEnabled', type: 'property', description: 'Gets whether the timer is enabled' },
                { name: 'Pause', type: 'method', description: 'Pauses the timer' },
                { name: 'Resume', type: 'method', description: 'Resumes the timer' },
                { name: 'Tick', type: 'method', description: 'Event that occurs when the timer interval elapses' }
            ]
        },
        {
            name: 'Text',
            description: 'Provides methods for text manipulation',
            members: [
                { name: 'Append', type: 'method', description: 'Appends text to another text' },
                { name: 'GetLength', type: 'method', description: 'Gets the length of text' },
                { name: 'GetSubText', type: 'method', description: 'Gets a portion of text' },
                { name: 'GetSubTextToEnd', type: 'method', description: 'Gets a portion of text to the end' },
                { name: 'ConvertToUpperCase', type: 'method', description: 'Converts text to uppercase' },
                { name: 'ConvertToLowerCase', type: 'method', description: 'Converts text to lowercase' },
                { name: 'IsSubText', type: 'method', description: 'Checks if text contains another text' },
                { name: 'GetCharacter', type: 'method', description: 'Gets a character at a specific position' },
                { name: 'GetCharacterCode', type: 'method', description: 'Gets the code of a character' },
                { name: 'GetIndexOf', type: 'method', description: 'Gets the position of text within other text' },
                { name: 'StartsWith', type: 'method', description: 'Checks if text starts with specified text' },
                { name: 'EndsWith', type: 'method', description: 'Checks if text ends with specified text' }
            ]
        },
        {
            name: 'Network',
            description: 'Provides methods for network operations',
            members: [
                { name: 'DownloadFile', type: 'method', description: 'Downloads a file from a URL' },
                { name: 'GetWebPageContents', type: 'method', description: 'Gets the contents of a web page' }
            ]
        },
        {
            name: 'Shapes',
            description: 'Provides methods for creating and manipulating shapes',
            members: [
                { name: 'AddRectangle', type: 'method', description: 'Adds a rectangle shape' },
                { name: 'AddEllipse', type: 'method', description: 'Adds an ellipse shape' },
                { name: 'AddTriangle', type: 'method', description: 'Adds a triangle shape' },
                { name: 'AddLine', type: 'method', description: 'Adds a line shape' },
                { name: 'AddImage', type: 'method', description: 'Adds an image shape' },
                { name: 'AddText', type: 'method', description: 'Adds text as a shape' },
                { name: 'SetText', type: 'method', description: 'Sets the text of a text shape' },
                { name: 'Remove', type: 'method', description: 'Removes a shape' },
                { name: 'Move', type: 'method', description: 'Moves a shape' },
                { name: 'Rotate', type: 'method', description: 'Rotates a shape' },
                { name: 'Zoom', type: 'method', description: 'Scales a shape' },
                { name: 'Animate', type: 'method', description: 'Animates a shape' },
                { name: 'GetLeft', type: 'method', description: 'Gets the left position of a shape' },
                { name: 'GetTop', type: 'method', description: 'Gets the top position of a shape' },
                { name: 'GetOpacity', type: 'method', description: 'Gets the opacity of a shape' },
                { name: 'SetOpacity', type: 'method', description: 'Sets the opacity of a shape' },
                { name: 'HideShape', type: 'method', description: 'Hides a shape' },
                { name: 'ShowShape', type: 'method', description: 'Shows a shape' },
                { name: 'LastFoundShape', type: 'property', description: 'Gets the last found shape' },
                { name: 'RotateAngle', type: 'property', description: 'Gets or sets the rotation angle' }
            ]
        },
        {
            name: 'Mouse',
            description: 'Provides mouse related information',
            members: [
                { name: 'MouseX', type: 'property', description: 'Gets the X position of the mouse' },
                { name: 'MouseY', type: 'property', description: 'Gets the Y position of the mouse' },
                { name: 'IsLeftButtonDown', type: 'property', description: 'Gets whether left mouse button is down' },
                { name: 'IsMiddleButtonDown', type: 'property', description: 'Gets whether middle mouse button is down' },
                { name: 'IsRightButtonDown', type: 'property', description: 'Gets whether right mouse button is down' },
                { name: 'ButtonDown', type: 'method', description: 'Event that occurs when a mouse button is pressed' }
            ]
        },
        {
            name: 'ImageList',
            description: 'Provides methods for working with images',
            members: [
                { name: 'LoadImage', type: 'method', description: 'Loads an image into memory' },
                { name: 'GetWidthOfImage', type: 'method', description: 'Gets the width of an image' },
                { name: 'GetHeightOfImage', type: 'method', description: 'Gets the height of an image' }
            ]
        },
        {
            name: 'Dictionary',
            description: 'Provides methods for key-value pair collections',
            members: [
                { name: 'AddValue', type: 'method', description: 'Adds a key-value pair to the dictionary' },
                { name: 'ContainsKey', type: 'method', description: 'Checks if dictionary contains a key' },
                { name: 'ContainsValue', type: 'method', description: 'Checks if dictionary contains a value' },
                { name: 'GetKeys', type: 'method', description: 'Gets all keys in the dictionary' },
                { name: 'GetValue', type: 'method', description: 'Gets a value by key' },
                { name: 'GetValues', type: 'method', description: 'Gets all values in the dictionary' },
                { name: 'RemoveKey', type: 'method', description: 'Removes a key-value pair by key' }
            ]
        },
        {
            name: 'Stack',
            description: 'Provides methods for stack data structure',
            members: [
                { name: 'PushValue', type: 'method', description: 'Pushes a value onto the stack' },
                { name: 'PopValue', type: 'method', description: 'Pops a value from the stack' },
                { name: 'GetCount', type: 'method', description: 'Gets the number of items in the stack' }
            ]
        },
        {
            name: 'Flickr',
            description: 'Provides methods for retrieving images from Flickr',
            members: [
                { name: 'GetPictureOfMoment', type: 'method', description: 'Gets the picture of the moment' },
                { name: 'GetRandomPicture', type: 'method', description: 'Gets a random picture' },
                { name: 'GetPictureOfMomentForTag', type: 'method', description: 'Gets a picture for a specific tag' }
            ]
        },
        {
            name: 'Controls',
            description: 'Provides methods for UI controls',
            members: [
                { name: 'AddButton', type: 'method', description: 'Adds a button control' },
                { name: 'AddTextBox', type: 'method', description: 'Adds a text box control' },
                { name: 'ButtonClicked', type: 'method', description: 'Event for button click' },
                { name: 'GetButtonCaption', type: 'method', description: 'Gets the caption of a button' },
                { name: 'GetTextBoxText', type: 'method', description: 'Gets the text in a text box' },
                { name: 'HideControl', type: 'method', description: 'Hides a control' },
                { name: 'Remove', type: 'method', description: 'Removes a control' },
                { name: 'SetButtonCaption', type: 'method', description: 'Sets the caption of a button' },
                { name: 'SetTextBoxText', type: 'method', description: 'Sets the text in a text box' },
                { name: 'ShowControl', type: 'method', description: 'Shows a control' },
                { name: 'TextTyped', type: 'method', description: 'Event for text typing' },
                { name: 'LastClickedButton', type: 'property', description: 'Gets the last clicked button' },
                { name: 'LastTypedTextBox', type: 'property', description: 'Gets the last typed text box' }
            ]
        }
    ];

    public provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[]> {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        
        // Only provide general completions when NOT typing after a dot
        // and NOT explicitly invoked from an object context
        if (!linePrefix.includes('.')) {
            // Create a new completion items array for each call
            const completionItems: vscode.CompletionItem[] = [];
            
            // Not after a dot, show keywords and object names
            const keywords = [
                'If', 'Then', 'Else', 'ElseIf', 'EndIf', 
                'For', 'To', 'Step', 'Next', 
                'While', 'EndWhile', 
                'Sub', 'EndSub', 
                'Goto', 'Label', 
                'And', 'Or', 'Not',
                'True', 'False',
                'Array', 'Return'
            ];
            
            keywords.forEach(keyword => {
                const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);
                completionItems.push(item);
            });

            // Built-in objects
            const builtInObjects = this.SMALL_BASIC_OBJECTS.map(obj => obj.name);
            
            builtInObjects.forEach(object => {
                const item = new vscode.CompletionItem(object, vscode.CompletionItemKind.Module);
                completionItems.push(item);
            });

            return completionItems;
        }
        
        // If we're typing after a dot, provide member completions
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
        
        return [];
    }

    private getMembersForObject(objectName: string): vscode.CompletionItem[] {
        const completionItems: vscode.CompletionItem[] = [];
        const lowerCaseObject = objectName.toLowerCase();
        
        // Find the object in our API definition
        const apiObject = this.SMALL_BASIC_OBJECTS.find(obj => obj.name.toLowerCase() === lowerCaseObject);
        
        if (apiObject) {
            // Get properties for this object
            const properties = apiObject.members
                .filter(member => member.type === 'property')
                .map(member => member.name);
                
            // Get methods for this object
            const methods = apiObject.members
                .filter(member => member.type === 'method')
                .map(member => member.name);
                
            return [
                ...this.createMemberItems(properties),
                ...this.createMethodItems(methods)
            ];
        }
        
        return completionItems;
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