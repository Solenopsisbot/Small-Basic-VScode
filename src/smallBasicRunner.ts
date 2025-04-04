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
    // Try to locate the file in the Small Basic directory as a fallback
    const fileBaseName = path.basename(absolutePath);
    const smallBasicDir = 'C:\\Program Files (x86)\\Microsoft\\Small Basic';
    const altSmallBasicDir = 'C:\\Program Files\\Microsoft\\Small Basic';
    
    let alternateExePath = path.join(smallBasicDir, fileBaseName);
    if (!fs.existsSync(alternateExePath)) {
        alternateExePath = path.join(altSmallBasicDir, fileBaseName);
    }
    
    if (fs.existsSync(alternateExePath)) {
        console.log(`Found executable at alternate location: ${alternateExePath}`);
        // Use this alternate path instead
        runExecutable(alternateExePath);
    } else {
        console.error(`Could not find executable anywhere. Cannot run the program.`);
        process.exit(1);
    }
} else {
    // Run the executable from the provided path
    runExecutable(absolutePath);
}

function runExecutable(exePath: string) {
    try {
        console.log(`Running: ${exePath}`);
        
        // Use Windows shell command to directly open the file
        // This mimics exactly what happens when double-clicking in File Explorer
        const execution = cp.spawn('cmd.exe', ['/c', 'start', '/b', '', exePath], {
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
}