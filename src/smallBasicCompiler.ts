import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { checkSyntax } from './syntaxChecker';
import { getConfig } from './configUtils';

// Get the file to compile from command line arguments
const fileToCompile = process.argv[2];

if (!fileToCompile) {
    console.error('No file specified for compilation');
    process.exit(1);
}

// Ensure we have an absolute path
const absoluteFilePath = path.resolve(fileToCompile);

// Get extension path from environment variable
const extensionPath = process.env.EXTENSION_PATH || path.resolve(__dirname, '..');

// Check if the source file exists
if (!fs.existsSync(absoluteFilePath)) {
    console.error(`Source file not found: ${absoluteFilePath}`);
    process.exit(1);
}

// First, check syntax
console.log(`Checking syntax: ${absoluteFilePath}`);
const syntaxErrors = checkSyntax(absoluteFilePath);

if (syntaxErrors.length > 0) {
    console.log('Syntax check found issues:');
    let hasErrors = false;
    
    syntaxErrors.forEach(error => {
        if (error.severity === 'error') {
            console.error(`Line ${error.line}: ${error.message}`);
            hasErrors = true;
        } else {
            console.warn(`Line ${error.line}: ${error.message}`);
        }
    });
    
    // Only exit if there are actual errors, not just warnings
    if (hasErrors) {
        console.error('Syntax errors found. Please fix them before compiling.');
        process.exit(1);
    } else {
        console.warn('Warnings found. Proceeding with compilation...');
    }
} else {
    console.log('Syntax check passed.');
}

// Get the directory of the source file - we'll compile from here
const sourceDir = path.dirname(absoluteFilePath);

// Load compiler configuration
const config = getConfig(extensionPath);

// Select the correct compiler path
let actualCompilerPath = config.compilerPath;
if (!fs.existsSync(actualCompilerPath)) {
    if (fs.existsSync(config.alternateCompilerPath)) {
        actualCompilerPath = config.alternateCompilerPath;
    } else {
        console.error(`Small Basic compiler not found at: ${config.compilerPath} or ${config.alternateCompilerPath}`);
        console.error('Please make sure Microsoft Small Basic is installed correctly.');
        process.exit(1);
    }
}

// Execute the compiler
try {
    console.log(`Compiling: ${absoluteFilePath} using compiler: ${actualCompilerPath}`);
    console.log(`Working directory: ${sourceDir}`);
    
    // Use different approach to capture stdout and stderr
    const compilation = cp.spawnSync(actualCompilerPath, [absoluteFilePath], {
        encoding: 'utf8',
        windowsHide: false, // Show compiler window for better user feedback
        cwd: sourceDir, // Set the working directory to the source file directory
        stdio: ['ignore', 'pipe', 'pipe'] // Capture stdout and stderr
    });

    // Print all compiler output
    if (compilation.stdout && compilation.stdout.length > 0) {
        console.log('Compiler output:');
        console.log(compilation.stdout);
    }

    if (compilation.stderr && compilation.stderr.length > 0) {
        console.error('Compiler errors:');
        console.error(compilation.stderr);
    }

    if (compilation.status !== 0) {
        console.error('Compilation failed with code:', compilation.status);
        if (compilation.error) {
            console.error('Error details:', compilation.error.message);
        }
        process.exit(compilation.status || 1);
    }

    // Verify the executable was created
    const expectedOutputPath = absoluteFilePath.replace(/\.sb$/i, '.exe');
    if (!fs.existsSync(expectedOutputPath)) {
        console.error(`Compilation appeared successful, but executable was not found at: ${expectedOutputPath}`);
        
        // Check other possible locations
        const fileBaseName = path.basename(absoluteFilePath, '.sb');
        
        // Check in source directory with just the base name
        const altPath1 = path.join(sourceDir, fileBaseName + '.exe');
        // Check in current working directory
        const altPath2 = path.join(process.cwd(), fileBaseName + '.exe');
        // Check in Small Basic directory
        const altPath3 = path.join(path.dirname(actualCompilerPath), fileBaseName + '.exe');
        
        const alternatePaths = [altPath1, altPath2, altPath3];
        let foundPath = '';
        
        for (const altPath of alternatePaths) {
            if (fs.existsSync(altPath)) {
                console.log(`Found executable at alternate location: ${altPath}`);
                foundPath = altPath;
                break;
            }
        }
        
        if (foundPath) {
            // Copy the executable to the expected location
            fs.copyFileSync(foundPath, expectedOutputPath);
            console.log(`Copied executable to: ${expectedOutputPath}`);
        } else {
            console.error(`Could not find compiled executable anywhere. This might indicate syntax errors in your Small Basic code.`);
            process.exit(1);
        }
    }

    console.log(`Compilation successful. Executable created at: ${expectedOutputPath}`);
} catch (error) {
    console.error('Error during compilation:', error);
    process.exit(1);
}
