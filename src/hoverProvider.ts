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

export class SmallBasicHoverProvider implements vscode.HoverProvider {
    // Complete local API definitions
    private SMALL_BASIC_API: SmallBasicObject[] = [
        {
            name: 'TextWindow',
            description: 'Provides methods for console input and output',
            members: [
                { 
                    name: 'WriteLine', 
                    type: 'method', 
                    description: 'Writes text to the console followed by a new line', 
                    parameters: ['text: string'],
                    example: 'TextWindow.WriteLine("Hello, World!")'
                },
                { 
                    name: 'Write', 
                    type: 'method', 
                    description: 'Writes text to the console without a new line', 
                    parameters: ['text: string'],
                    example: 'TextWindow.Write("Enter your name: ")'
                },
                {
                    name: 'Read',
                    type: 'method',
                    description: 'Reads a line of text from user input',
                    returnType: 'string',
                    example: 'name = TextWindow.Read()'
                },
                {
                    name: 'ReadNumber',
                    type: 'method',
                    description: 'Reads a number from user input',
                    returnType: 'number',
                    example: 'age = TextWindow.ReadNumber()'
                },
                {
                    name: 'ReadKey',
                    type: 'method',
                    description: 'Reads a single key press from user input',
                    returnType: 'string',
                    example: 'key = TextWindow.ReadKey()'
                },
                {
                    name: 'Clear',
                    type: 'method',
                    description: 'Clears the text window',
                    example: 'TextWindow.Clear()'
                },
                {
                    name: 'Pause',
                    type: 'method',
                    description: 'Pauses execution until user presses a key',
                    example: 'TextWindow.Pause()'
                },
                {
                    name: 'PauseIfVisible',
                    type: 'method',
                    description: 'Pauses execution if the text window is visible',
                    example: 'TextWindow.PauseIfVisible()'
                },
                {
                    name: 'PauseWithMessage',
                    type: 'method',
                    description: 'Pauses execution with a custom message',
                    parameters: ['message: string'],
                    example: 'TextWindow.PauseWithMessage("Press any key to continue...")'
                },
                {
                    name: 'PauseWithoutMessage',
                    type: 'method',
                    description: 'Pauses execution without showing a message',
                    example: 'TextWindow.PauseWithoutMessage()'
                },
                {
                    name: 'Hide',
                    type: 'method',
                    description: 'Hides the text window',
                    example: 'TextWindow.Hide()'
                },
                {
                    name: 'Show',
                    type: 'method',
                    description: 'Shows the text window',
                    example: 'TextWindow.Show()'
                },
                {
                    name: 'BackgroundColor',
                    type: 'property',
                    description: 'Gets or sets the background color of the text window',
                    example: 'TextWindow.BackgroundColor = "Black"'
                },
                {
                    name: 'ForegroundColor',
                    type: 'property',
                    description: 'Gets or sets the text color of the text window',
                    example: 'TextWindow.ForegroundColor = "White"'
                },
                {
                    name: 'CursorLeft',
                    type: 'property',
                    description: 'Gets or sets the horizontal cursor position',
                    example: 'TextWindow.CursorLeft = 10'
                },
                {
                    name: 'CursorTop',
                    type: 'property',
                    description: 'Gets or sets the vertical cursor position',
                    example: 'TextWindow.CursorTop = 5'
                },
                {
                    name: 'Left',
                    type: 'property',
                    description: 'Gets or sets the left position of the text window',
                    example: 'TextWindow.Left = 100'
                },
                {
                    name: 'Top',
                    type: 'property',
                    description: 'Gets or sets the top position of the text window',
                    example: 'TextWindow.Top = 100'
                },
                {
                    name: 'Title',
                    type: 'property',
                    description: 'Gets or sets the title of the text window',
                    example: 'TextWindow.Title = "My Program"'
                }
            ]
        },
        {
            name: 'GraphicsWindow',
            description: 'Provides methods and properties for creating graphics and animations',
            members: [
                {
                    name: 'BackgroundColor',
                    type: 'property',
                    description: 'Gets or sets the background color of the graphics window',
                    example: 'GraphicsWindow.BackgroundColor = "White"'
                },
                {
                    name: 'BrushColor',
                    type: 'property',
                    description: 'Gets or sets the brush color used for filling shapes',
                    example: 'GraphicsWindow.BrushColor = "Red"'
                },
                {
                    name: 'CanResize',
                    type: 'property',
                    description: 'Gets or sets whether the window can be resized',
                    example: 'GraphicsWindow.CanResize = "True"'
                },
                {
                    name: 'FontBold',
                    type: 'property',
                    description: 'Gets or sets whether the font is bold',
                    example: 'GraphicsWindow.FontBold = "True"'
                },
                {
                    name: 'FontItalic',
                    type: 'property',
                    description: 'Gets or sets whether the font is italic',
                    example: 'GraphicsWindow.FontItalic = "False"'
                },
                {
                    name: 'FontName',
                    type: 'property',
                    description: 'Gets or sets the name of the font',
                    example: 'GraphicsWindow.FontName = "Arial"'
                },
                {
                    name: 'FontSize',
                    type: 'property',
                    description: 'Gets or sets the size of the font',
                    example: 'GraphicsWindow.FontSize = 12'
                },
                {
                    name: 'Height',
                    type: 'property',
                    description: 'Gets or sets the height of the graphics window',
                    example: 'GraphicsWindow.Height = 480'
                },
                {
                    name: 'LastKey',
                    type: 'property',
                    description: 'Gets the last key pressed in the graphics window',
                    example: 'lastKey = GraphicsWindow.LastKey'
                },
                {
                    name: 'Left',
                    type: 'property',
                    description: 'Gets or sets the left position of the window',
                    example: 'GraphicsWindow.Left = 100'
                },
                {
                    name: 'MouseX',
                    type: 'property',
                    description: 'Gets the X position of the mouse',
                    example: 'x = GraphicsWindow.MouseX'
                },
                {
                    name: 'MouseY',
                    type: 'property',
                    description: 'Gets the Y position of the mouse',
                    example: 'y = GraphicsWindow.MouseY'
                },
                {
                    name: 'PenColor',
                    type: 'property',
                    description: 'Gets or sets the pen color for drawing outlines',
                    example: 'GraphicsWindow.PenColor = "Blue"'
                },
                {
                    name: 'PenWidth',
                    type: 'property',
                    description: 'Gets or sets the width of the pen',
                    example: 'GraphicsWindow.PenWidth = 2'
                },
                {
                    name: 'Title',
                    type: 'property',
                    description: 'Gets or sets the title of the window',
                    example: 'GraphicsWindow.Title = "My Graphics Program"'
                },
                {
                    name: 'Top',
                    type: 'property',
                    description: 'Gets or sets the top position of the window',
                    example: 'GraphicsWindow.Top = 100'
                },
                {
                    name: 'Width',
                    type: 'property',
                    description: 'Gets or sets the width of the graphics window',
                    example: 'GraphicsWindow.Width = 640'
                },
                {
                    name: 'Clear',
                    type: 'method',
                    description: 'Clears the graphics window',
                    example: 'GraphicsWindow.Clear()'
                },
                {
                    name: 'DrawBoundText',
                    type: 'method',
                    description: 'Draws text within a specified area',
                    parameters: ['x: number', 'y: number', 'width: number', 'text: string'],
                    example: 'GraphicsWindow.DrawBoundText(10, 10, 100, "This text will wrap within 100 pixels")'
                },
                {
                    name: 'DrawEllipse',
                    type: 'method',
                    description: 'Draws an ellipse outline',
                    parameters: ['x: number', 'y: number', 'width: number', 'height: number'],
                    example: 'GraphicsWindow.DrawEllipse(10, 10, 100, 50)'
                },
                {
                    name: 'DrawImage',
                    type: 'method',
                    description: 'Draws an image at the specified position',
                    parameters: ['imagePath: string', 'x: number', 'y: number'],
                    example: 'GraphicsWindow.DrawImage("C:\\image.png", 10, 10)'
                },
                {
                    name: 'DrawLine',
                    type: 'method',
                    description: 'Draws a line between two points',
                    parameters: ['x1: number', 'y1: number', 'x2: number', 'y2: number'],
                    example: 'GraphicsWindow.DrawLine(10, 10, 100, 100)'
                },
                {
                    name: 'DrawRectangle',
                    type: 'method',
                    description: 'Draws a rectangle outline',
                    parameters: ['x: number', 'y: number', 'width: number', 'height: number'],
                    example: 'GraphicsWindow.DrawRectangle(10, 10, 100, 50)'
                },
                {
                    name: 'DrawResizedImage',
                    type: 'method',
                    description: 'Draws a resized image',
                    parameters: ['imagePath: string', 'x: number', 'y: number', 'width: number', 'height: number'],
                    example: 'GraphicsWindow.DrawResizedImage("C:\\image.png", 10, 10, 200, 100)'
                },
                {
                    name: 'DrawText',
                    type: 'method',
                    description: 'Draws text at the specified position',
                    parameters: ['x: number', 'y: number', 'text: string'],
                    example: 'GraphicsWindow.DrawText(10, 10, "Hello World")'
                },
                {
                    name: 'DrawTriangle',
                    type: 'method',
                    description: 'Draws a triangle outline',
                    parameters: ['x1: number', 'y1: number', 'x2: number', 'y2: number', 'x3: number', 'y3: number'],
                    example: 'GraphicsWindow.DrawTriangle(10, 10, 100, 10, 50, 100)'
                },
                {
                    name: 'FillEllipse',
                    type: 'method',
                    description: 'Draws a filled ellipse',
                    parameters: ['x: number', 'y: number', 'width: number', 'height: number'],
                    example: 'GraphicsWindow.FillEllipse(10, 10, 100, 50)'
                },
                {
                    name: 'FillRectangle',
                    type: 'method',
                    description: 'Draws a filled rectangle',
                    parameters: ['x: number', 'y: number', 'width: number', 'height: number'],
                    example: 'GraphicsWindow.FillRectangle(10, 10, 100, 50)'
                },
                {
                    name: 'FillTriangle',
                    type: 'method',
                    description: 'Draws a filled triangle',
                    parameters: ['x1: number', 'y1: number', 'x2: number', 'y2: number', 'x3: number', 'y3: number'],
                    example: 'GraphicsWindow.FillTriangle(10, 10, 100, 10, 50, 100)'
                },
                {
                    name: 'GetColorFromRGB',
                    type: 'method',
                    description: 'Creates a color from RGB values',
                    parameters: ['red: number', 'green: number', 'blue: number'],
                    returnType: 'string',
                    example: 'color = GraphicsWindow.GetColorFromRGB(255, 0, 0)'
                },
                {
                    name: 'GetPixel',
                    type: 'method',
                    description: 'Gets the color of a pixel at the specified position',
                    parameters: ['x: number', 'y: number'],
                    returnType: 'string',
                    example: 'color = GraphicsWindow.GetPixel(10, 10)'
                },
                {
                    name: 'GetRandomColor',
                    type: 'method',
                    description: 'Gets a random color',
                    returnType: 'string',
                    example: 'color = GraphicsWindow.GetRandomColor()'
                },
                {
                    name: 'Hide',
                    type: 'method',
                    description: 'Hides the graphics window',
                    example: 'GraphicsWindow.Hide()'
                },
                {
                    name: 'KeyDown',
                    type: 'method',
                    description: 'Event that occurs when a key is pressed',
                    example: 'GraphicsWindow.KeyDown = OnKeyDown'
                },
                {
                    name: 'KeyUp',
                    type: 'method',
                    description: 'Event that occurs when a key is released',
                    example: 'GraphicsWindow.KeyUp = OnKeyUp'
                },
                {
                    name: 'MouseDown',
                    type: 'method',
                    description: 'Event that occurs when a mouse button is pressed',
                    example: 'GraphicsWindow.MouseDown = OnMouseDown'
                },
                {
                    name: 'MouseMove',
                    type: 'method',
                    description: 'Event that occurs when the mouse is moved',
                    example: 'GraphicsWindow.MouseMove = OnMouseMove'
                },
                {
                    name: 'MouseUp',
                    type: 'method',
                    description: 'Event that occurs when a mouse button is released',
                    example: 'GraphicsWindow.MouseUp = OnMouseUp'
                },
                {
                    name: 'SetPixel',
                    type: 'method',
                    description: 'Sets the color of a pixel at the specified position',
                    parameters: ['x: number', 'y: number', 'color: string'],
                    example: 'GraphicsWindow.SetPixel(10, 10, "Red")'
                },
                {
                    name: 'Show',
                    type: 'method',
                    description: 'Shows the graphics window',
                    example: 'GraphicsWindow.Show()'
                },
                {
                    name: 'ShowMessage',
                    type: 'method',
                    description: 'Shows a message box',
                    parameters: ['text: string', 'title: string'],
                    example: 'GraphicsWindow.ShowMessage("Hello", "Message")'
                }
            ]
        },
        {
            name: 'Math',
            description: 'Provides mathematical functions and constants',
            members: [
                {
                    name: 'Pi',
                    type: 'property',
                    description: 'The mathematical constant Pi (3.14159...)',
                    example: 'circumference = 2 * Math.Pi * radius'
                },
                {
                    name: 'Abs',
                    type: 'method',
                    description: 'Returns the absolute value of a number',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'absoluteValue = Math.Abs(-5)'
                },
                {
                    name: 'Acos',
                    type: 'method',
                    description: 'Returns the arccosine of a number in radians',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'angle = Math.Acos(0.5)'
                },
                {
                    name: 'Asin',
                    type: 'method',
                    description: 'Returns the arcsine of a number in radians',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'angle = Math.Asin(0.5)'
                },
                {
                    name: 'Atan',
                    type: 'method',
                    description: 'Returns the arctangent of a number in radians',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'angle = Math.Atan(1)'
                },
                {
                    name: 'Ceiling',
                    type: 'method',
                    description: 'Returns the smallest integer greater than or equal to a number',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'ceiling = Math.Ceiling(4.3)'
                },
                {
                    name: 'Cos',
                    type: 'method',
                    description: 'Returns the cosine of an angle in radians',
                    parameters: ['angle: number'],
                    returnType: 'number',
                    example: 'cosine = Math.Cos(Math.Pi)'
                },
                {
                    name: 'Floor',
                    type: 'method',
                    description: 'Returns the largest integer less than or equal to a number',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'floor = Math.Floor(4.7)'
                },
                {
                    name: 'GetDegrees',
                    type: 'method',
                    description: 'Converts an angle from radians to degrees',
                    parameters: ['radians: number'],
                    returnType: 'number',
                    example: 'degrees = Math.GetDegrees(Math.Pi)'
                },
                {
                    name: 'GetRadians',
                    type: 'method',
                    description: 'Converts an angle from degrees to radians',
                    parameters: ['degrees: number'],
                    returnType: 'number',
                    example: 'radians = Math.GetRadians(180)'
                },
                {
                    name: 'GetRandomNumber',
                    type: 'method',
                    description: 'Returns a random number up to the specified maximum',
                    parameters: ['max: number'],
                    returnType: 'number',
                    example: 'randomNumber = Math.GetRandomNumber(100)'
                },
                {
                    name: 'Log',
                    type: 'method',
                    description: 'Returns the natural logarithm of a number',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'log = Math.Log(10)'
                },
                {
                    name: 'Max',
                    type: 'method',
                    description: 'Returns the larger of two numbers',
                    parameters: ['number1: number', 'number2: number'],
                    returnType: 'number',
                    example: 'maximum = Math.Max(5, 10)'
                },
                {
                    name: 'Min',
                    type: 'method',
                    description: 'Returns the smaller of two numbers',
                    parameters: ['number1: number', 'number2: number'],
                    returnType: 'number',
                    example: 'minimum = Math.Min(5, 10)'
                },
                {
                    name: 'Power',
                    type: 'method',
                    description: 'Returns a number raised to a power',
                    parameters: ['number: number', 'power: number'],
                    returnType: 'number',
                    example: 'result = Math.Power(2, 3)'
                },
                {
                    name: 'Remainder',
                    type: 'method',
                    description: 'Returns the remainder after division',
                    parameters: ['dividend: number', 'divisor: number'],
                    returnType: 'number',
                    example: 'remainder = Math.Remainder(10, 3)'
                },
                {
                    name: 'Round',
                    type: 'method',
                    description: 'Rounds a number to the nearest integer',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'rounded = Math.Round(4.5)'
                },
                {
                    name: 'Sin',
                    type: 'method',
                    description: 'Returns the sine of an angle in radians',
                    parameters: ['angle: number'],
                    returnType: 'number',
                    example: 'sine = Math.Sin(Math.Pi/2)'
                },
                {
                    name: 'SquareRoot',
                    type: 'method',
                    description: 'Returns the square root of a number',
                    parameters: ['number: number'],
                    returnType: 'number',
                    example: 'sqrt = Math.SquareRoot(16)'
                },
                {
                    name: 'Tan',
                    type: 'method',
                    description: 'Returns the tangent of an angle in radians',
                    parameters: ['angle: number'],
                    returnType: 'number',
                    example: 'tangent = Math.Tan(Math.Pi/4)'
                }
            ]
        },
        {
            name: 'Program',
            description: 'Provides program control methods and properties',
            members: [
                {
                    name: 'Delay',
                    type: 'method',
                    description: 'Delays program execution for the specified milliseconds',
                    parameters: ['milliseconds: number'],
                    example: 'Program.Delay(1000)'
                },
                {
                    name: 'End',
                    type: 'method',
                    description: 'Ends the program',
                    example: 'Program.End()'
                },
                {
                    name: 'Pause',
                    type: 'method',
                    description: 'Pauses the program execution',
                    example: 'Program.Pause()'
                },
                {
                    name: 'Restart',
                    type: 'method',
                    description: 'Restarts the program from the beginning',
                    example: 'Program.Restart()'
                },
                {
                    name: 'SetArguments',
                    type: 'method',
                    description: 'Sets the command line arguments for the program',
                    parameters: ['arguments: string'],
                    example: 'Program.SetArguments("arg1 arg2")'
                },
                {
                    name: 'Directory',
                    type: 'property',
                    description: 'Gets the directory of the program',
                    example: 'dir = Program.Directory'
                },
                {
                    name: 'Arguments',
                    type: 'property',
                    description: 'Gets the command line arguments of the program',
                    example: 'args = Program.Arguments'
                }
            ]
        },
        {
            name: 'Clock',
            description: 'Provides date and time information',
            members: [
                {
                    name: 'Hour',
                    type: 'property',
                    description: 'Gets the current hour (0-23)',
                    example: 'currentHour = Clock.Hour'
                },
                {
                    name: 'Minute',
                    type: 'property',
                    description: 'Gets the current minute (0-59)',
                    example: 'currentMinute = Clock.Minute'
                },
                {
                    name: 'Second',
                    type: 'property',
                    description: 'Gets the current second (0-59)',
                    example: 'currentSecond = Clock.Second'
                },
                {
                    name: 'Date',
                    type: 'property',
                    description: 'Gets the current date',
                    example: 'today = Clock.Date'
                },
                {
                    name: 'Day',
                    type: 'property',
                    description: 'Gets the current day of month (1-31)',
                    example: 'currentDay = Clock.Day'
                },
                {
                    name: 'Month',
                    type: 'property',
                    description: 'Gets the current month (1-12)',
                    example: 'currentMonth = Clock.Month'
                },
                {
                    name: 'Year',
                    type: 'property',
                    description: 'Gets the current year',
                    example: 'currentYear = Clock.Year'
                },
                {
                    name: 'WeekDay',
                    type: 'property',
                    description: 'Gets the current day of week (1-7, where 1 is Sunday)',
                    example: 'currentWeekDay = Clock.WeekDay'
                },
                {
                    name: 'Time',
                    type: 'property',
                    description: 'Gets the current time as a string',
                    example: 'currentTime = Clock.Time'
                }
            ]
        },
        {
            name: 'Desktop',
            description: 'Provides information about the desktop',
            members: [
                {
                    name: 'Width',
                    type: 'property',
                    description: 'Gets the width of the desktop in pixels',
                    example: 'width = Desktop.Width'
                },
                {
                    name: 'Height',
                    type: 'property',
                    description: 'Gets the height of the desktop in pixels',
                    example: 'height = Desktop.Height'
                }
            ]
        },
        {
            name: 'File',
            description: 'Provides methods for file operations',
            members: [
                {
                    name: 'ReadContents',
                    type: 'method',
                    description: 'Reads all contents from a file',
                    parameters: ['filePath: string'],
                    returnType: 'string',
                    example: 'content = File.ReadContents("C:\\data.txt")'
                },
                {
                    name: 'WriteContents',
                    type: 'method',
                    description: 'Writes content to a file, overwriting existing content',
                    parameters: ['filePath: string', 'content: string'],
                    example: 'File.WriteContents("C:\\data.txt", "Hello World")'
                },
                {
                    name: 'AppendContents',
                    type: 'method',
                    description: 'Appends content to the end of a file',
                    parameters: ['filePath: string', 'content: string'],
                    example: 'File.AppendContents("C:\\data.txt", "More text")'
                },
                {
                    name: 'GetTemporaryFilePath',
                    type: 'method',
                    description: 'Gets a path for a temporary file',
                    returnType: 'string',
                    example: 'tempFile = File.GetTemporaryFilePath()'
                },
                {
                    name: 'GetSettingsFilePath',
                    type: 'method',
                    description: 'Gets the path for a settings file',
                    returnType: 'string',
                    example: 'settingsFile = File.GetSettingsFilePath()'
                },
                {
                    name: 'CopyFile',
                    type: 'method',
                    description: 'Copies a file from one location to another',
                    parameters: ['sourceFile: string', 'destinationFile: string'],
                    example: 'File.CopyFile("C:\\source.txt", "C:\\destination.txt")'
                },
                {
                    name: 'DeleteFile',
                    type: 'method',
                    description: 'Deletes a file',
                    parameters: ['filePath: string'],
                    example: 'File.DeleteFile("C:\\unwanted.txt")'
                },
                {
                    name: 'InsertLine',
                    type: 'method',
                    description: 'Inserts a line at the specified position in a file',
                    parameters: ['filePath: string', 'lineNumber: number', 'text: string'],
                    example: 'File.InsertLine("C:\\data.txt", 3, "New line of text")'
                },
                {
                    name: 'ReadLine',
                    type: 'method',
                    description: 'Reads a specific line from a file',
                    parameters: ['filePath: string', 'lineNumber: number'],
                    returnType: 'string',
                    example: 'line = File.ReadLine("C:\\data.txt", 2)'
                },
                {
                    name: 'WriteLine',
                    type: 'method',
                    description: 'Writes a line at the specified position in a file',
                    parameters: ['filePath: string', 'lineNumber: number', 'text: string'],
                    example: 'File.WriteLine("C:\\data.txt", 2, "Updated line")'
                },
                {
                    name: 'CreateDirectory',
                    type: 'method',
                    description: 'Creates a new directory',
                    parameters: ['path: string'],
                    example: 'File.CreateDirectory("C:\\NewFolder")'
                },
                {
                    name: 'DeleteDirectory',
                    type: 'method',
                    description: 'Deletes a directory',
                    parameters: ['path: string'],
                    example: 'File.DeleteDirectory("C:\\OldFolder")'
                },
                {
                    name: 'GetDirectories',
                    type: 'method',
                    description: 'Gets all subdirectories in a directory',
                    parameters: ['path: string'],
                    returnType: 'array',
                    example: 'directories = File.GetDirectories("C:\\")'
                },
                {
                    name: 'GetFiles',
                    type: 'method',
                    description: 'Gets all files in a directory',
                    parameters: ['path: string'],
                    returnType: 'array',
                    example: 'files = File.GetFiles("C:\\")'
                }
            ]
        },
        {
            name: 'Array',
            description: 'Provides methods for array manipulation',
            members: [
                {
                    name: 'ContainsIndex',
                    type: 'method',
                    description: 'Checks if an array contains a specific index',
                    parameters: ['array: array', 'index: string'],
                    returnType: 'boolean',
                    example: 'hasIndex = Array.ContainsIndex(arr, "key")'
                },
                {
                    name: 'ContainsValue',
                    type: 'method',
                    description: 'Checks if an array contains a specific value',
                    parameters: ['array: array', 'value: string'],
                    returnType: 'boolean',
                    example: 'hasValue = Array.ContainsValue(arr, "value")'
                },
                {
                    name: 'GetAllIndices',
                    type: 'method',
                    description: 'Gets all indices in an array',
                    parameters: ['array: array'],
                    returnType: 'array',
                    example: 'indices = Array.GetAllIndices(arr)'
                },
                {
                    name: 'GetItemCount',
                    type: 'method',
                    description: 'Gets the number of items in an array',
                    parameters: ['array: array'],
                    returnType: 'number',
                    example: 'count = Array.GetItemCount(arr)'
                },
                {
                    name: 'GetValue',
                    type: 'method',
                    description: 'Gets a value from an array at the specified index',
                    parameters: ['array: array', 'index: string'],
                    returnType: 'string',
                    example: 'value = Array.GetValue(arr, "key")'
                },
                {
                    name: 'IsArray',
                    type: 'method',
                    description: 'Checks if a variable is an array',
                    parameters: ['array: array'],
                    returnType: 'boolean',
                    example: 'isArr = Array.IsArray(var)'
                },
                {
                    name: 'RemoveValue',
                    type: 'method',
                    description: 'Removes a value from an array at the specified index',
                    parameters: ['array: array', 'index: string'],
                    example: 'Array.RemoveValue(arr, "key")'
                },
                {
                    name: 'SetValue',
                    type: 'method',
                    description: 'Sets a value in an array at the specified index',
                    parameters: ['array: array', 'index: string', 'value: string'],
                    example: 'Array.SetValue(arr, "key", "value")'
                }
            ]
        },
        {
            name: 'Sound',
            description: 'Provides methods for playing sounds and music',
            members: [
                {
                    name: 'Play',
                    type: 'method',
                    description: 'Plays a sound file',
                    parameters: ['file: string'],
                    example: 'Sound.Play("C:\\sound.wav")'
                },
                {
                    name: 'PlayAndWait',
                    type: 'method',
                    description: 'Plays a sound file and waits for it to complete',
                    parameters: ['file: string'],
                    example: 'Sound.PlayAndWait("C:\\sound.wav")'
                },
                {
                    name: 'PlayChime',
                    type: 'method',
                    description: 'Plays a chime sound',
                    example: 'Sound.PlayChime()'
                },
                {
                    name: 'PlayChimes',
                    type: 'method',
                    description: 'Plays multiple chime sounds',
                    parameters: ['number: number'],
                    example: 'Sound.PlayChimes(3)'
                },
                {
                    name: 'PlayChimesAndWait',
                    type: 'method',
                    description: 'Plays multiple chime sounds and waits for completion',
                    parameters: ['number: number'],
                    example: 'Sound.PlayChimesAndWait(3)'
                },
                {
                    name: 'PlayMusic',
                    type: 'method',
                    description: 'Plays a music file',
                    parameters: ['notes: string'],
                    example: 'Sound.PlayMusic("O5 C E G")'
                },
                {
                    name: 'PlayMusicAndWait',
                    type: 'method',
                    description: 'Plays a music file and waits for completion',
                    parameters: ['notes: string'],
                    example: 'Sound.PlayMusicAndWait("O5 C E G")'
                },
                {
                    name: 'Stop',
                    type: 'method',
                    description: 'Stops any currently playing sound',
                    example: 'Sound.Stop()'
                }
            ]
        },
        {
            name: 'Turtle',
            description: 'Provides methods for turtle graphics',
            members: [
                {
                    name: 'X',
                    type: 'property',
                    description: 'Gets the X coordinate of the turtle',
                    example: 'xPos = Turtle.X'
                },
                {
                    name: 'Y',
                    type: 'property',
                    description: 'Gets the Y coordinate of the turtle',
                    example: 'yPos = Turtle.Y'
                },
                {
                    name: 'Angle',
                    type: 'property',
                    description: 'Gets or sets the angle of the turtle in degrees',
                    example: 'Turtle.Angle = 90'
                },
                {
                    name: 'Speed',
                    type: 'property',
                    description: 'Gets or sets the speed of the turtle (1-10)',
                    example: 'Turtle.Speed = 8'
                },
                {
                    name: 'BrushColor',
                    type: 'property',
                    description: 'Gets or sets the brush color of the turtle',
                    example: 'Turtle.BrushColor = "Red"'
                },
                {
                    name: 'IsVisible',
                    type: 'property',
                    description: 'Gets whether the turtle is visible',
                    example: 'visible = Turtle.IsVisible'
                },
                {
                    name: 'PenColor',
                    type: 'property',
                    description: 'Gets or sets the pen color of the turtle',
                    example: 'Turtle.PenColor = "Blue"'
                },
                {
                    name: 'PenDown',
                    type: 'property',
                    description: 'Gets or sets whether the pen is down (drawing)',
                    example: 'isPenDown = Turtle.PenDown'
                },
                {
                    name: 'PenWidth',
                    type: 'property',
                    description: 'Gets or sets the width of the pen',
                    example: 'Turtle.PenWidth = 2'
                },
                {
                    name: 'XCenter',
                    type: 'property',
                    description: 'Gets the X coordinate of the center of the turtle area',
                    example: 'xCenter = Turtle.XCenter'
                },
                {
                    name: 'YCenter',
                    type: 'property',
                    description: 'Gets the Y coordinate of the center of the turtle area',
                    example: 'yCenter = Turtle.YCenter'
                },
                {
                    name: 'Move',
                    type: 'method',
                    description: 'Moves the turtle forward by the specified distance',
                    parameters: ['distance: number'],
                    example: 'Turtle.Move(100)'
                },
                {
                    name: 'Turn',
                    type: 'method',
                    description: 'Turns the turtle by the specified angle in degrees',
                    parameters: ['angle: number'],
                    example: 'Turtle.Turn(90)'
                },
                {
                    name: 'TurnLeft',
                    type: 'method',
                    description: 'Turns the turtle left by the specified angle in degrees',
                    parameters: ['angle: number'],
                    example: 'Turtle.TurnLeft(90)'
                },
                {
                    name: 'TurnRight',
                    type: 'method',
                    description: 'Turns the turtle right by the specified angle in degrees',
                    parameters: ['angle: number'],
                    example: 'Turtle.TurnRight(90)'
                },
                {
                    name: 'PenUp',
                    type: 'method',
                    description: 'Lifts the pen up (stops drawing)',
                    example: 'Turtle.PenUp()'
                },
                {
                    name: 'PenDown',
                    type: 'method',
                    description: 'Puts the pen down (starts drawing)',
                    example: 'Turtle.PenDown()'
                },
                {
                    name: 'Show',
                    type: 'method',
                    description: 'Shows the turtle',
                    example: 'Turtle.Show()'
                },
                {
                    name: 'Hide',
                    type: 'method',
                    description: 'Hides the turtle',
                    example: 'Turtle.Hide()'
                },
                {
                    name: 'ShowTurtle',
                    type: 'method',
                    description: 'Shows the turtle (same as Show)',
                    example: 'Turtle.ShowTurtle()'
                },
                {
                    name: 'HideTurtle',
                    type: 'method',
                    description: 'Hides the turtle (same as Hide)',
                    example: 'Turtle.HideTurtle()'
                },
                {
                    name: 'GetColor',
                    type: 'method',
                    description: 'Gets the color of the pixel at the turtle position',
                    returnType: 'string',
                    example: 'color = Turtle.GetColor()'
                },
                {
                    name: 'SetColor',
                    type: 'method',
                    description: 'Sets the color at the turtle position',
                    parameters: ['color: string'],
                    example: 'Turtle.SetColor("Red")'
                },
                {
                    name: 'MoveTo',
                    type: 'method',
                    description: 'Moves the turtle to the specified coordinates',
                    parameters: ['x: number', 'y: number'],
                    example: 'Turtle.MoveTo(100, 100)'
                },
                {
                    name: 'TurnTowards',
                    type: 'method',
                    description: 'Turns the turtle towards the specified coordinates',
                    parameters: ['x: number', 'y: number'],
                    example: 'Turtle.TurnTowards(100, 100)'
                }
            ]
        },
        {
            name: 'Flickr',
            description: 'Provides methods for retrieving images from Flickr',
            members: [
                {
                    name: 'GetPictureList',
                    type: 'method',
                    description: 'Gets a list of pictures for a search term',
                    parameters: ['searchTerm: string'],
                    returnType: 'array',
                    example: 'imageList = Flickr.GetPictureList("flowers")'
                }
            ]
        }
    ];

    public provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
            return null;
        }

        const word = document.getText(range);
        
        // Check if it's a keyword
        const keywordInfo = this.getKeywordInfo(word);
        if (keywordInfo) {
            return new vscode.Hover(keywordInfo);
        }
        
        // Check if it's an object
        const objectInfo = this.getObjectInfo(word);
        if (objectInfo) {
            return new vscode.Hover(objectInfo);
        }
        
        // Check if it's a member of an object (like TextWindow.WriteLine)
        const line = document.lineAt(position.line).text;
        const dotMatch = line.substring(0, position.character).match(/(\w+)\.\w*$/);
        if (dotMatch) {
            const objectName = dotMatch[1];
            const memberInfo = this.getMemberInfo(objectName, word);
            if (memberInfo) {
                return new vscode.Hover(memberInfo);
            }
        }
        
        return null;
    }
    
    private getKeywordInfo(keyword: string): vscode.MarkdownString | null {
        const keywords: { [key: string]: string } = {
            'If': '**If** condition **Then**\n  statements\n[**ElseIf** condition **Then**\n  statements]\n[**Else**\n  statements]\n**EndIf**\n\nExecutes statements conditionally.',
            'For': '**For** variable = start **To** end [**Step** stepValue]\n  statements\n**Next**\n\nExecutes statements in a loop with a counter.',
            'While': '**While** condition\n  statements\n**EndWhile**\n\nExecutes statements in a loop while a condition is true.',
            'Sub': '**Sub** name\n  statements\n**EndSub**\n\nDefines a subroutine that can be called with name().',
            'Goto': '**Goto** labelName\n\nJumps to the specified label in the program.',
            'Label': '**Label** labelName\n\nDefines a label that can be jumped to with Goto.'
        };
        
        const key = Object.keys(keywords).find(k => k.toLowerCase() === keyword.toLowerCase());
        if (key) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`## ${key}\n\n`);
            md.appendMarkdown(`${keywords[key]}`);
            return md;
        }
        
        return null;
    }
    
    private getObjectInfo(object: string): vscode.MarkdownString | null {
        const apiObject = this.SMALL_BASIC_API.find(obj => obj.name.toLowerCase() === object.toLowerCase());
        
        if (apiObject) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`# ${apiObject.name} Object\n\n`);
            md.appendMarkdown(`${apiObject.description}`);
            return md;
        }
        
        return null;
    }
    
    private getMemberInfo(objectName: string, memberName: string): vscode.MarkdownString | null {
        const apiObject = this.SMALL_BASIC_API.find(obj => obj.name.toLowerCase() === objectName.toLowerCase());
        
        if (apiObject) {
            const memberInfo = apiObject.members.find(m => m.name.toLowerCase() === memberName.toLowerCase());
            
            if (memberInfo) {
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`## ${objectName}.${memberInfo.name}\n\n`);
                
                // Format based on type (method or property)
                if (memberInfo.type === 'method') {
                    const paramList = memberInfo.parameters ? memberInfo.parameters.join(', ') : '';
                    md.appendMarkdown(`**${objectName}.${memberInfo.name}(${paramList})**\n\n`);
                } else {
                    md.appendMarkdown(`**${objectName}.${memberInfo.name}**\n\n`);
                }
                
                md.appendMarkdown(`${memberInfo.description}\n\n`);
                
                // Add an example if provided
                if (memberInfo.example) {
                    md.appendMarkdown(`**Example:**\n\n\`\`\`smallbasic\n${memberInfo.example}\n\`\`\``);
                }
                
                return md;
            }
        }
        
        return null;
    }
}
