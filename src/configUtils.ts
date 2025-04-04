import * as fs from 'fs';
import * as path from 'path';

export interface SmallBasicConfig {
    compilerPath: string;
    alternateCompilerPath: string;
    showCompilerOutput: boolean;
    copyExecutableToSourceDirectory: boolean;
    syntaxCheckLevel: 'minimal' | 'standard' | 'strict';
    autoFormatOnSave: boolean;
}

const defaultConfig: SmallBasicConfig = {
    compilerPath: 'C:\\Program Files (x86)\\Microsoft\\Small Basic\\SmallBasicCompiler.exe',
    alternateCompilerPath: 'C:\\Program Files\\Microsoft\\Small Basic\\SmallBasicCompiler.exe',
    showCompilerOutput: true,
    copyExecutableToSourceDirectory: true,
    syntaxCheckLevel: 'standard',
    autoFormatOnSave: false
};

export function getConfig(extensionPath: string): SmallBasicConfig {
    try {
        const configPath = path.join(extensionPath, 'config.json');
        if (!fs.existsSync(configPath)) {
            // Create default config if it doesn't exist
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4));
            return defaultConfig;
        }

        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent) as Partial<SmallBasicConfig>;
        
        // Merge with defaults to ensure all properties exist
        return {
            ...defaultConfig,
            ...config
        };
    } catch (error) {
        console.error('Error loading config:', error);
        return defaultConfig;
    }
}

export function updateConfig(extensionPath: string, config: Partial<SmallBasicConfig>): boolean {
    try {
        const configPath = path.join(extensionPath, 'config.json');
        const currentConfig = getConfig(extensionPath);
        
        // Merge with current config
        const updatedConfig = {
            ...currentConfig,
            ...config
        };
        
        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 4));
        return true;
    } catch (error) {
        console.error('Error updating config:', error);
        return false;
    }
}
