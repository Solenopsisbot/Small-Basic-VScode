# Small Basic VSCode Extension

This extension adds Small Basic language support to Visual Studio Code, making it easier to write, compile, and run Small Basic programs.

## Features

- Syntax highlighting for Small Basic (.sb) files
- IntelliSense with autocompletion for built-in objects and methods
- One-click compile and run functionality
- Code snippets for common Small Basic constructs
- Context menu and keyboard shortcuts for common operations

## Requirements

- Microsoft Small Basic must be installed on your system
- Typical installation path: `C:\Program Files (x86)\Microsoft\Small Basic\`

## Getting Started

1. Install the extension
2. Open or create a Small Basic (.sb) file
3. Start typing to get IntelliSense suggestions
4. Press F5 to compile and run your program

## Using the Extension

This extension works globally - you don't need to copy launch.json to every folder:

- Press F5 on any .sb file to compile and run it
- Right-click on a .sb file and select "Small Basic: Compile and Run"
- Use the play button in the editor title bar
- Access commands from the Command Palette (F1)

## Keyboard Shortcuts

- `F5`: Compile and run Small Basic program
- `Ctrl+Shift+B`: Compile Small Basic program (without running)
- `Ctrl+F5`: Run compiled Small Basic program

## Using Snippets

Type one of these prefixes and press Tab:
- `print`: Insert TextWindow.WriteLine() code
- `read`: Insert TextWindow.Read() code
- `gwbasic`: Insert basic GraphicsWindow setup
- `for`: Insert For loop structure
- `while`: Insert While loop structure
- `sub`: Insert Subroutine structure
- `if`: Insert If-Then-Else structure

## Acknowledgements

This extension was created with assistance from AI tools.
