import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Get the file to compile from command line arguments
const fileToCompile = process.argv[2];

if (!fileToCompile) {
    console.error('No file specified for compilation and run');
    process.exit(1);
}

// If extension path wasn't provided, try to determine it from the script location
let extensionPath = process.env.EXTENSION_PATH;
if (!extensionPath) {
    // This assumes the script is in out/ directory
    extensionPath = path.resolve(__dirname, '..');
    console.log(`Using detected extension path: ${extensionPath}`);
}

// Construct paths to compiler and runner scripts
const compilerPath = path.join(extensionPath, 'out', 'smallBasicCompiler.js');
const runnerPath = path.join(extensionPath, 'out', 'smallBasicRunner.js');

// Check if the scripts exist
if (!fs.existsSync(compilerPath)) {
    console.error(`Compiler script not found at: ${compilerPath}`);
    process.exit(1);
}

if (!fs.existsSync(runnerPath)) {
    console.error(`Runner script not found at: ${runnerPath}`);
    process.exit(1);
}

// Check if the source file exists
if (!fs.existsSync(fileToCompile)) {
    console.error(`Source file not found: ${fileToCompile}`);
    process.exit(1);
}

async function compileAndRun() {
    try {
        // Use absolute path for the file to compile
        const absoluteFilePath = path.resolve(fileToCompile);
        
        console.log(`Compiling: ${absoluteFilePath}`);
        const compilation = cp.spawnSync('node', [compilerPath, absoluteFilePath], {
            encoding: 'utf8',
            stdio: 'inherit',
            env: { ...process.env, EXTENSION_PATH: extensionPath }
        });

        if (compilation.status !== 0) {
            console.error('Compilation failed');
            process.exit(compilation.status || 1);
        }

        console.log('Compilation successful');

        const exeFile = absoluteFilePath.replace(/\.sb$/i, '.exe'); // Use case-insensitive replacement
        console.log(`Running: ${exeFile}`);
        
        const execution = cp.spawn('node', [runnerPath, exeFile], {
            stdio: 'inherit',
            env: { ...process.env, EXTENSION_PATH: extensionPath }
        });

        execution.on('close', (code) => {
            if (code !== 0) {
                console.error(`Execution failed with code: ${code}`);
                process.exit(code || 1);
            }
            console.log('Execution successful');
        });

    } catch (error) {
        console.error('Error during compile and run:', error);
        process.exit(1);
    }
}

compileAndRun();
