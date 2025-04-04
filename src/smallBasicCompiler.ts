import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Get the file to compile from command line arguments
const fileToCompile = process.argv[2];

if (!fileToCompile) {
    console.error('No file specified for compilation');
    process.exit(1);
}

// Ensure we have an absolute path
const absoluteFilePath = path.resolve(fileToCompile);

// Check if the source file exists
if (!fs.existsSync(absoluteFilePath)) {
    console.error(`Source file not found: ${absoluteFilePath}`);
    process.exit(1);
}

// Path to Small Basic compiler
const compilerPath = 'C:\\Program Files (x86)\\Microsoft\\Small Basic\\SmallBasicCompiler.exe';
const alternateCompilerPath = 'C:\\Program Files\\Microsoft\\Small Basic\\SmallBasicCompiler.exe';

// Select the correct compiler path
let actualCompilerPath = compilerPath;
if (!fs.existsSync(compilerPath)) {
    if (fs.existsSync(alternateCompilerPath)) {
        actualCompilerPath = alternateCompilerPath;
    } else {
        console.error(`Small Basic compiler not found at: ${compilerPath} or ${alternateCompilerPath}`);
        console.error('Please make sure Microsoft Small Basic is installed correctly.');
        process.exit(1);
    }
}

// Execute the compiler
try {
    console.log(`Compiling: ${absoluteFilePath} using compiler: ${actualCompilerPath}`);
    const compilation = cp.spawnSync(actualCompilerPath, [absoluteFilePath], {
        encoding: 'utf8',
        stdio: 'inherit',
        windowsHide: false // Show compiler window for better user feedback
    });

    if (compilation.status !== 0) {
        console.error('Compilation failed with code:', compilation.status);
        if (compilation.error) {
            console.error('Error details:', compilation.error.message);
        }
        process.exit(compilation.status || 1);
    }

    console.log('Compilation successful');
} catch (error) {
    console.error('Error during compilation:', error);
    process.exit(1);
}
