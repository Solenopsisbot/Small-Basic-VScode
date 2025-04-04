import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Get the file to run from command line arguments
const fileToRun = process.argv[2];

if (!fileToRun) {
    console.error('No executable file specified to run');
    process.exit(1);
}

// Ensure we have an absolute path
const absolutePath = path.resolve(fileToRun);

// Check if the file exists
if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
}

// Execute the compiled program
try {
    console.log(`Running: ${absolutePath}`);
    
    // Use Windows shell command to directly open the file
    // This mimics exactly what happens when double-clicking in File Explorer
    const execution = cp.spawn('cmd.exe', ['/c', 'start', '/b', '', absolutePath], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
    });

    // Detach the process so it continues running independently
    execution.unref();
    
    console.log('Program launched successfully');
} catch (error) {
    console.error('Error during execution:', error);
    process.exit(1);
}