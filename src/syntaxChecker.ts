import * as fs from 'fs';
import * as path from 'path';

export interface SyntaxError {
    line: number;
    column?: number;
    message: string;
    severity: 'error' | 'warning' | 'information';
    code?: string;
}

export function checkSyntax(filePath: string): SyntaxError[] {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const lines = fileContent.split('\n');
        const errors: SyntaxError[] = [];
        
        // Keep track of blocks and their balance
        const blockStack: {type: string, line: number}[] = [];
        
        // Track variables defined in the program
        const definedVariables = new Set<string>();
        const variableUsages: {[name: string]: number[]} = {};
        
        // Track defined subroutines
        const definedSubroutines = new Set<string>();
        const subroutineCalls: {[name: string]: number[]} = {};
        
        // Track defined labels for Goto statements
        const definedLabels = new Set<string>();
        const gotoStatements: {[label: string]: number[]} = {};
        
        // Track potential off-by-one errors in arrays
        const arrayAccesses: {[name: string]: {indices: number[], lines: number[]}} = {};

        // Check for large program warning
        if (lines.length > 1000) {
            errors.push({
                line: 1,
                message: `Large program detected (${lines.length} lines). Consider breaking it into smaller modules.`,
                severity: 'information',
                code: 'large-program'
            });
        }
        
        // Simple parser to detect common errors
        lines.forEach((line, index) => {
            // Remove comments
            const commentStartIdx = line.indexOf('\'');
            const codeLine = commentStartIdx >= 0 ? line.substring(0, commentStartIdx) : line;
            const lineNum = index + 1;
            const trimmedLine = codeLine.trim();
            
            // Skip empty lines
            if (trimmedLine === '') {
                return;
            }
            
            // Check for missing quotes
            const quoteCount = (codeLine.match(/"/g) || []).length;
            if (quoteCount % 2 !== 0) {
                errors.push({
                    line: lineNum,
                    message: 'Unbalanced quotes - missing opening or closing quote',
                    severity: 'error',
                    code: 'unbalanced-quotes'
                });
            }
            
            // Check for common mistakes with semicolons (not used in Small Basic)
            if (codeLine.includes(';')) {
                errors.push({
                    line: lineNum,
                    column: codeLine.indexOf(';') + 1,
                    message: 'Semicolons are not used in Small Basic',
                    severity: 'warning',
                    code: 'semicolon-usage'
                });
            }
            
            // Check for lowercase keywords (while Small Basic is case-insensitive, consistency is good)
            const lowerCaseKeywords = [
                { pattern: /\bif\b(?!\s*[A-Z])/, suggestion: 'If' },
                { pattern: /\bthen\b(?!\s*[A-Z])/, suggestion: 'Then' },
                { pattern: /\belse\b(?!\s*[A-Z])/, suggestion: 'Else' },
                { pattern: /\belseif\b(?!\s*[A-Z])/, suggestion: 'ElseIf' },
                { pattern: /\bendif\b(?!\s*[A-Z])/, suggestion: 'EndIf' },
                { pattern: /\bfor\b(?!\s*[A-Z])/, suggestion: 'For' },
                { pattern: /\bto\b(?!\s*[A-Z])/, suggestion: 'To' },
                { pattern: /\bstep\b(?!\s*[A-Z])/, suggestion: 'Step' },
                { pattern: /\bnext\b(?!\s*[A-Z])/, suggestion: 'Next' },
                { pattern: /\bwhile\b(?!\s*[A-Z])/, suggestion: 'While' },
                { pattern: /\bendwhile\b(?!\s*[A-Z])/, suggestion: 'EndWhile' },
                { pattern: /\bsub\b(?!\s*[A-Z])/, suggestion: 'Sub' },
                { pattern: /\bendsub\b(?!\s*[A-Z])/, suggestion: 'EndSub' },
                { pattern: /\bgoto\b(?!\s*[A-Z])/, suggestion: 'Goto' }
            ];
            
            lowerCaseKeywords.forEach(keyword => {
                if (keyword.pattern.test(codeLine)) {
                    errors.push({
                        line: lineNum,
                        message: `Consider using '${keyword.suggestion}' instead of lowercase for consistency`,
                        severity: 'information',
                        code: 'lowercase-keyword'
                    });
                }
            });
            
            // Check for malformed expressions
            if (/=[^=].*[^<>+\-*/^%&|]=/.test(codeLine)) {
                errors.push({
                    line: lineNum,
                    message: 'Potential malformed expression with multiple assignments',
                    severity: 'warning',
                    code: 'malformed-assignment'
                });
            }
            
            // Check for potential infinite loops
            if (/\bWhile\s+True\b/i.test(codeLine) && !fileContent.includes('EndWhile')) {
                errors.push({
                    line: lineNum,
                    message: 'Potential infinite loop: While True without a clear exit condition',
                    severity: 'warning',
                    code: 'infinite-loop'
                });
            }
            
            // Track variable assignments
            const assignmentMatches = codeLine.match(/\b([A-Za-z]\w*)\s*=/g) || [];
            for (const match of assignmentMatches) {
                const varName = match.replace('=', '').trim().toLowerCase();
                definedVariables.add(varName);
                
                if (!variableUsages[varName]) {
                    variableUsages[varName] = [];
                }
                variableUsages[varName].push(lineNum);
            }
            
            // Track variable usages
            const variableUsageMatches = codeLine.match(/\b([A-Za-z]\w*)\b/g) || [];
            for (const varName of variableUsageMatches) {
                const lowerVarName = varName.toLowerCase();
                
                // Skip keywords and known objects
                const keywords = ['if', 'then', 'else', 'elseif', 'endif', 'for', 'to', 'step', 'next', 'while', 'endwhile', 'sub', 'endsub', 'goto', 'true', 'false'];
                const objects = ['textwindow', 'graphicswindow', 'math', 'clock', 'file', 'network', 'program', 'shapes', 'stack', 'turtle', 'timer', 'imagelist', 'flickr', 'sound', 'mouse', 'text', 'controls', 'array', 'desktop', 'dictionary'];
                
                if (!keywords.includes(lowerVarName) && !objects.includes(lowerVarName)) {
                    if (!variableUsages[lowerVarName]) {
                        variableUsages[lowerVarName] = [];
                    }
                    variableUsages[lowerVarName].push(lineNum);
                }
            }
            
            // Check block balancing
            if (/\bIf\b.*\bThen\b/i.test(codeLine)) {
                blockStack.push({ type: 'If', line: lineNum });
            } else if (/\bElseIf\b/i.test(codeLine)) {
                if (blockStack.length === 0 || blockStack[blockStack.length - 1].type !== 'If') {
                    errors.push({
                        line: lineNum,
                        message: 'ElseIf without matching If',
                        severity: 'error',
                        code: 'unmatched-elseif'
                    });
                }
            } else if (/\bElse\b/i.test(codeLine) && !/\bElseIf\b/i.test(codeLine)) {
                if (blockStack.length === 0 || blockStack[blockStack.length - 1].type !== 'If') {
                    errors.push({
                        line: lineNum,
                        message: 'Else without matching If',
                        severity: 'error',
                        code: 'unmatched-else'
                    });
                }
            } else if (/\bEndIf\b/i.test(codeLine)) {
                if (blockStack.length === 0 || blockStack[blockStack.length - 1].type !== 'If') {
                    errors.push({
                        line: lineNum,
                        message: 'EndIf without matching If',
                        severity: 'error',
                        code: 'unmatched-endif'
                    });
                } else {
                    blockStack.pop();
                }
            } else if (/\bFor\b.*\bTo\b/i.test(codeLine)) {
                blockStack.push({ type: 'For', line: lineNum });
                
                // Check for loop variable being modified inside the loop later
                const forVarMatch = codeLine.match(/\bFor\s+(\w+)\s+=/i);
                if (forVarMatch && forVarMatch[1]) {
                    const loopVar = forVarMatch[1].toLowerCase();
                    
                    // Find the matching Next
                    const loopEndIndex = findMatchingNext(lines, index);
                    if (loopEndIndex > index) {
                        // Check if loop variable is modified inside
                        for (let i = index + 1; i < loopEndIndex; i++) {
                            const innerLine = lines[i];
                            if (new RegExp(`\\b${loopVar}\\s*=`, 'i').test(innerLine)) {
                                errors.push({
                                    line: i + 1,
                                    message: `Loop variable '${forVarMatch[1]}' should not be modified inside the loop`,
                                    severity: 'warning',
                                    code: 'loop-var-modified'
                                });
                            }
                        }
                    }
                }
            } else if (/\bNext\b/i.test(codeLine)) {
                if (blockStack.length === 0 || blockStack[blockStack.length - 1].type !== 'For') {
                    errors.push({
                        line: lineNum,
                        message: 'Next without matching For',
                        severity: 'error',
                        code: 'unmatched-next'
                    });
                } else {
                    blockStack.pop();
                }
            } else if (/\bWhile\b/i.test(codeLine)) {
                blockStack.push({ type: 'While', line: lineNum });
            } else if (/\bEndWhile\b/i.test(codeLine)) {
                if (blockStack.length === 0 || blockStack[blockStack.length - 1].type !== 'While') {
                    errors.push({
                        line: lineNum,
                        message: 'EndWhile without matching While',
                        severity: 'error',
                        code: 'unmatched-endwhile'
                    });
                } else {
                    blockStack.pop();
                }
            } else if (/\bSub\b/i.test(codeLine)) {
                const subMatch = codeLine.match(/\bSub\s+(\w+)/i);
                if (subMatch && subMatch[1]) {
                    const subName = subMatch[1].toLowerCase();
                    definedSubroutines.add(subName);
                    blockStack.push({ type: 'Sub:' + subName, line: lineNum });
                } else {
                    blockStack.push({ type: 'Sub', line: lineNum });
                }
            } else if (/\bEndSub\b/i.test(codeLine)) {
                if (blockStack.length === 0 || !blockStack[blockStack.length - 1].type.startsWith('Sub')) {
                    errors.push({
                        line: lineNum,
                        message: 'EndSub without matching Sub',
                        severity: 'error',
                        code: 'unmatched-endsub'
                    });
                } else {
                    blockStack.pop();
                }
            }
            
            // Track subroutine calls
            const subCallMatch = codeLine.match(/\b([A-Za-z]\w*)\s*\(\)/);
            if (subCallMatch && subCallMatch[1]) {
                const subName = subCallMatch[1].toLowerCase();
                // Exclude built-in method calls from being marked as subroutines
                const knownMethods = [
                    'clear', 'read', 'readline', 'write', 'writeline', 'readnumber', 'readkey',
                    'show', 'hide', 'getpictureofmoment', 'getrandompicture', 'popvalue', 'pushvalue',
                    'getitemcount', 'playmusic', 'playmusicandwait', 'playchime', 'playchimes', 
                    'playchimesandwait', 'play', 'playandwait', 'getwebpagecontents', 'downloadfile',
                    'playtocompletion', 'playbellring'
                ];
                
                // Check if calling a method on an object (not a standalone subroutine)
                const isMethodCall = line.substring(0, subCallMatch.index).trim().endsWith('.');
                
                if (!isMethodCall && !knownMethods.includes(subName.toLowerCase())) {
                    if (!subroutineCalls[subName]) {
                        subroutineCalls[subName] = [];
                    }
                    subroutineCalls[subName].push(lineNum);
                }
            }
            
            // Check for potential object member errors
            const dotCallMatch = codeLine.match(/\b([A-Za-z]\w*)\.([A-Za-z]\w*)/g);
            if (dotCallMatch) {
                dotCallMatch.forEach(call => {
                    const parts = call.split('.');
                    if (parts.length === 2) {
                        const obj = parts[0];
                        const member = parts[1];
                        
                        // Find the position of this object access in the line
                        const callIndex = codeLine.indexOf(call);
                        
                        // Skip URL literals in strings
                        const isInUrlString = isWithinUrlString(codeLine, callIndex);
                        if (isInUrlString) {
                            return; // Skip this error check for URLs
                        }
                        
                        // Check for common misspellings of objects
                        const validObjects = [
                            'textwindow', 'graphicswindow', 'math', 'clock', 'file', 
                            'network', 'program', 'shapes', 'stack', 'turtle', 'timer', 
                            'imagelist', 'flickr', 'sound', 'mouse', 'text', 'controls', 
                            'dictionary', 'desktop', 'array'
                        ];
                        
                        if (!validObjects.includes(obj.toLowerCase()) && !definedVariables.has(obj.toLowerCase())) {
                            errors.push({
                                line: lineNum,
                                column: callIndex,
                                message: `'${obj}' might be undefined or misspelled`,
                                severity: 'warning',
                                code: 'unknown-object'
                            });
                        } else {
                            // Check for valid members
                            const invalidMember = checkInvalidMember(obj.toLowerCase(), member);
                            if (invalidMember) {
                                errors.push({
                                    line: lineNum,
                                    column: callIndex + obj.length + 1, // Position after the dot
                                    message: invalidMember,
                                    severity: 'warning',
                                    code: 'invalid-member'
                                });
                            }
                        }
                    }
                });
            }
            
            // Check for common off-by-one errors in arrays and loops
            // Array indices in Small Basic start at 1, not 0
            const arrayAccessMatches = codeLine.match(/\b(\w+)\[(\d+)\]/g);
            if (arrayAccessMatches) {
                arrayAccessMatches.forEach(match => {
                    const parts = match.match(/\b(\w+)\[(\d+)\]/);
                    if (parts && parts.length >= 3) {
                        const arrayName = parts[1].toLowerCase();
                        const index = parseInt(parts[2], 10);
                        
                        if (!arrayAccesses[arrayName]) {
                            arrayAccesses[arrayName] = { indices: [], lines: [] };
                        }
                        
                        arrayAccesses[arrayName].indices.push(index);
                        arrayAccesses[arrayName].lines.push(lineNum);
                        
                        // Check for zero-based indexing which is a common mistake for people from other languages
                        if (index === 0) {
                            errors.push({
                                line: lineNum,
                                message: 'Small Basic arrays are typically 1-based. Index 0 might not work as expected.',
                                severity: 'warning',
                                code: 'zero-index-array'
                            });
                        }
                    }
                });
            }
            
            // Check for common loop initialization issues
            if (/\bFor\s+\w+\s*=\s*0\b/i.test(codeLine)) {
                errors.push({
                    line: lineNum,
                    message: 'Small Basic is typically 1-based. Starting a For loop at 0 might not be standard practice.',
                    severity: 'information',
                    code: 'zero-based-loop'
                });
            }
            
            // Track label definitions
            const labelMatch = codeLine.match(/\bLabel\s+(\w+)/i);
            if (labelMatch && labelMatch[1]) {
                const labelName = labelMatch[1].toLowerCase();
                
                if (definedLabels.has(labelName)) {
                    errors.push({
                        line: lineNum,
                        message: `Label '${labelMatch[1]}' is already defined elsewhere`,
                        severity: 'error',
                        code: 'duplicate-label'
                    });
                }
                
                definedLabels.add(labelName);
            }
            
            // Track goto statements
            const gotoMatch = codeLine.match(/\bGoto\s+(\w+)/i);
            if (gotoMatch && gotoMatch[1]) {
                const labelName = gotoMatch[1].toLowerCase();
                
                if (!gotoStatements[labelName]) {
                    gotoStatements[labelName] = [];
                }
                gotoStatements[labelName].push(lineNum);
            }
            
            // Check for consecutive identical lines (potential copy-paste error)
            if (index > 0 && trimmedLine && trimmedLine === lines[index-1].trim()) {
                errors.push({
                    line: lineNum,
                    message: 'Duplicate line detected. Possible copy-paste error.',
                    severity: 'information',
                    code: 'duplicate-line'
                });
            }
            
            // Check for missing parentheses in method calls
            const methodCallMatch = codeLine.match(/\b(\w+)\.(\w+)(?!\(|\s*=)/g);
            if (methodCallMatch) {
                methodCallMatch.forEach(match => {
                    const parts = match.split('.');
                    if (parts.length === 2) {
                        const obj = parts[0].toLowerCase();
                        const method = parts[1].toLowerCase();
                        
                        // Find the position of this method call in the line
                        const callIndex = codeLine.indexOf(match);
                        
                        // Check if this is a method (not a property) that should have parentheses
                        if (isMethod(obj, method)) {
                            errors.push({
                                line: lineNum,
                                column: callIndex + obj.length + 1, // Position right after the dot
                                message: `Method '${method}' should be called with parentheses: ${parts[0]}.${parts[1]}()`,
                                severity: 'warning',
                                code: 'missing-parentheses'
                            });
                        }
                    }
                });
            }
            
            // Check for capitalization inconsistency in variable names
            const varReferences = codeLine.match(/\b([A-Za-z]\w*)\b/g) || [];
            for (const varRef of varReferences) {
                if (!isKeywordOrBuiltin(varRef.toLowerCase())) {
                    const lowerRef = varRef.toLowerCase();
                    
                    // If we've seen this variable before, check if capitalization is consistent
                    if (variableUsages[lowerRef] && variableUsages[lowerRef].length > 0) {
                        const previousUsageLine = variableUsages[lowerRef][0] - 1; // Convert to 0-based
                        if (previousUsageLine >= 0 && previousUsageLine < lines.length) {
                            const previousLine = lines[previousUsageLine];
                            const previousUsageMatch = previousLine.match(new RegExp(`\\b(${lowerRef})\\b`, 'i'));
                            
                            if (previousUsageMatch && previousUsageMatch[1] !== varRef) {
                                errors.push({
                                    line: lineNum,
                                    message: `Inconsistent capitalization: '${varRef}' vs '${previousUsageMatch[1]}'. Variable names are case-insensitive in Small Basic.`,
                                    severity: 'information',
                                    code: 'inconsistent-capitalization'
                                });
                            }
                        }
                    }
                }
            }
        });
        
        // Check for unclosed blocks at the end of the file
        if (blockStack.length > 0) {
            blockStack.forEach(block => {
                let blockType = block.type;
                let blockLine = block.line;
                if (blockType.includes(':')) {
                    blockType = blockType.split(':')[0];
                }
                
                errors.push({
                    line: blockLine,
                    message: `Unclosed ${blockType} block started here`,
                    severity: 'error',
                    code: 'unclosed-block'
                });
            });
        }
        
        // Check for unused variables
        for (const varName in variableUsages) {
            if (variableUsages[varName].length === 1) {
                errors.push({
                    line: variableUsages[varName][0],
                    message: `Variable '${varName}' is only used once. It might be unused or misspelled.`,
                    severity: 'information',
                    code: 'unused-variable'
                });
            }
        }
        
        // Check for undefined subroutine calls
        for (const subName in subroutineCalls) {
            if (!definedSubroutines.has(subName.toLowerCase())) {
                subroutineCalls[subName].forEach(line => {
                    errors.push({
                        line: line,
                        message: `Call to undefined subroutine '${subName}'`,
                        severity: 'warning',
                        code: 'undefined-subroutine'
                    });
                });
            }
        }
        
        // Check for unused subroutines
        for (const subName of definedSubroutines) {
            if (!subroutineCalls[subName] || subroutineCalls[subName].length === 0) {
                errors.push({
                    line: findSubroutineDefinition(lines, subName),
                    message: `Subroutine '${subName}' is defined but never called`,
                    severity: 'information',
                    code: 'unused-subroutine'
                });
            }
        }
        
        // Check for referenced but undefined labels
        for (const labelName in gotoStatements) {
            if (!definedLabels.has(labelName)) {
                gotoStatements[labelName].forEach(line => {
                    errors.push({
                        line: line,
                        message: `Goto references undefined label '${labelName}'`,
                        severity: 'error',
                        code: 'undefined-label'
                    });
                });
            }
        }
        
        // Check for unused labels
        for (const labelName of definedLabels) {
            if (!gotoStatements[labelName] || gotoStatements[labelName].length === 0) {
                // Find where this label is defined
                let labelLine = 1;
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].match(new RegExp(`\\bLabel\\s+${labelName}\\b`, 'i'))) {
                        labelLine = i + 1;
                        break;
                    }
                }
                
                errors.push({
                    line: labelLine,
                    message: `Label '${labelName}' is defined but never used in a Goto statement`,
                    severity: 'information',
                    code: 'unused-label'
                });
            }
        }
        
        return errors;
    } catch (error) {
        return [{
            line: 1,
            message: `Failed to check syntax: ${error}`,
            severity: 'error',
            code: 'syntax-check-failure'
        }];
    }
}

function findMatchingNext(lines: string[], forIndex: number): number {
    let depth = 1;
    for (let i = forIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (/\bFor\b/i.test(line)) {
            depth++;
        } else if (/\bNext\b/i.test(line)) {
            depth--;
            if (depth === 0) {
                return i;
            }
        }
    }
    return lines.length - 1;
}

function findSubroutineDefinition(lines: string[], subName: string): number {
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(new RegExp(`\\bSub\\s+${subName}\\b`, 'i'));
        if (match) {
            return i + 1;
        }
    }
    return 1;
}

function checkInvalidMember(objName: string, memberName: string): string | null {
    // Get members from centralized definition
    const members = getObjectMembers();
    
    if (objName.toLowerCase() in members) {
        const validMembers = members[objName.toLowerCase()];
        if (!validMembers.includes(memberName.toLowerCase())) {
            // Find closest match
            const closestMatch = findClosestMatch(memberName.toLowerCase(), validMembers);
            if (closestMatch) {
                return `'${memberName}' is not a valid member of '${objName}'. Did you mean '${closestMatch}'?`;
            } else {
                return `'${memberName}' is not a valid member of '${objName}'`;
            }
        }
    }
    
    return null;
}

// Central repository of Small Basic objects and their members
function getObjectMembers(): { [key: string]: string[] } {
    return {
        'textwindow': ['backgroundcolor', 'foregroundcolor', 'cursorleft', 'cursortop', 'title', 'left', 'top', 
                     'writeline', 'write', 'read', 'readnumber', 'readkey', 'clear', 'pause', 'pauseifvisible', 
                     'pausewithmessage', 'pausewithoutmessage', 'hide', 'show'],
        
        'graphicswindow': ['backgroundcolor', 'brushcolor', 'canresize', 'fontbold', 'fontitalic', 'fontname', 
                        'fontsize', 'height', 'lastkey', 'left', 'mousex', 'mousey', 'pencolor', 'penwidth', 
                        'title', 'top', 'width', 'clear', 'drawboundtext', 'drawellipse', 'drawimage', 
                        'drawline', 'drawrectangle', 'drawresizedimage', 'drawtext', 'drawtriangle', 
                        'fillellipse', 'fillrectangle', 'filltriangle', 'getcolorfromrgb', 'getpixel', 
                        'getrandomcolor', 'hide', 'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 
                        'setpixel', 'show', 'showmessage'],
        
        'math': ['abs', 'acos', 'asin', 'atan', 'ceiling', 'cos', 'floor', 'getdegrees', 'getradians', 'log', 
               'max', 'min', 'power', 'round', 'sin', 'squareroot', 'tan', 'getrandomnumber', 'remainder', 'pi'],
        
        'file': ['readcontents', 'writecontents', 'appendcontents', 'gettemporaryfilepath', 'getsettingsfilepath',
               'copyfile', 'deletefile', 'insertline', 'readline', 'writeline', 'createdirectory', 'deletedirectory', 
               'getdirectories', 'getfiles'],
        
        'turtle': ['x', 'y', 'angle', 'speed', 'brushcolor', 'isvisible', 'pencolor', 'pendown', 'penwidth', 
                 'xcenter', 'ycenter', 'move', 'turn', 'turnleft', 'turnright', 'penup', 'show', 'hide', 
                 'showturtle', 'hideturtle', 'getcolor', 'setcolor', 'moveto', 'turntowards'],
        
        'clock': ['hour', 'minute', 'second', 'date', 'day', 'month', 'year', 'weekday', 'time'],
        
        'sound': ['play', 'playandwait', 'playchime', 'playchimes', 'playchimesandwait', 'playmusic', 
                'playmusicandwait', 'stop', 'playtocompletion', 'playbellring'],
        
        'program': ['delay', 'end', 'pause', 'directory', 'arguments', 'setarguments', 'restart', 'version'],
        
        'timer': ['interval', 'isenabled', 'tick', 'pause', 'resume'],
        
        'stack': ['pushvalue', 'popvalue', 'getcount'],
        
        'text': ['getlength', 'getsubtext', 'converttouppercase', 'converttolowercase', 'issubtext', 'append', 
               'getcharacter', 'getcharactercode', 'getindexof', 'startswith', 'endswith', 'getsubtexttoend'],
        
        'imagelist': ['loadimage', 'getwidthofimage', 'getheightofimage'],
        
        'shapes': ['addrectangle', 'addellipse', 'addtriangle', 'addline', 'addimage', 'addtext', 'settext', 
                 'remove', 'move', 'rotate', 'zoom', 'animate', 'getleft', 'gettop', 'getopacity', 'setopacity', 
                 'hideshape', 'showshape', 'lastfoundshape', 'rotateangle'],
        
        'network': ['downloadfile', 'getwebpagecontents'],
        
        'mouse': ['mousex', 'mousey', 'isleftbuttondown', 'ismiddlebuttondown', 'isrightbuttondown', 'buttondown'],
        
        'flickr': ['getpictureofmoment', 'getrandompicture', 'getpictureofmomentfortag', 'getpicturelist'],
        
        'controls': ['addbutton', 'addtextbox', 'buttonclicked', 'getbuttoncaption', 'gettextboxtext', 
                   'hidecontrol', 'remove', 'setbuttoncaption', 'settextboxtext', 'showcontrol', 'texttyped', 
                   'lastclickedbutton', 'lasttypedtextbox'],
        
        'dictionary': ['addvalue', 'containskey', 'containsvalue', 'getkeys', 'getvalue', 'getvalues', 'removekey'],
        
        'desktop': ['height', 'width'],
        
        'array': ['containsindex', 'containsvalue', 'getallindices', 'getitemcount', 'getvalue', 'isarray', 
                'removevalue', 'setvalue']
    };
}

// Central repository of Small Basic methods (vs properties)
function getObjectMethods(): { [key: string]: string[] } {
    return {
        'textwindow': ['writeline', 'write', 'read', 'readnumber', 'readkey', 'clear', 'pause', 'pauseifvisible', 
                      'pausewithmessage', 'pausewithoutmessage', 'hide', 'show'],
        
        'graphicswindow': ['show', 'hide', 'clear', 'drawboundtext', 'drawellipse', 'drawimage', 'drawline', 
                         'drawrectangle', 'drawresizedimage', 'drawtext', 'drawtriangle', 'fillellipse', 
                         'fillrectangle', 'filltriangle', 'getcolorfromrgb', 'getpixel', 'getrandomcolor', 
                         'keydown', 'keyup', 'mousedown', 'mousemove', 'mouseup', 'setpixel', 'showmessage'],
        
        'math': ['abs', 'acos', 'asin', 'atan', 'ceiling', 'cos', 'floor', 'getdegrees', 'getradians', 'log', 
               'max', 'min', 'power', 'round', 'sin', 'squareroot', 'tan', 'getrandomnumber', 'remainder'],
        
        'file': ['readcontents', 'writecontents', 'appendcontents', 'gettemporaryfilepath', 'getsettingsfilepath', 
               'copyfile', 'deletefile', 'insertline', 'readline', 'writeline', 'createdirectory', 'deletedirectory',
               'getdirectories', 'getfiles'],
        
        'program': ['delay', 'end', 'pause', 'restart', 'setarguments'],
        
        'sound': ['play', 'playandwait', 'playchime', 'playchimes', 'playchimesandwait', 'playmusic', 
                'playmusicandwait', 'stop'],
        
        'network': ['downloadfile', 'getwebpagecontents'],
        
        'turtle': ['move', 'turn', 'turnleft', 'turnright', 'penup', 'pendown', 'show', 'hide', 'showturtle', 
                 'hideturtle', 'getcolor', 'setcolor', 'moveto', 'turntowards'],
        
        'shapes': ['addrectangle', 'addellipse', 'addtriangle', 'addline', 'addimage', 'addtext', 'settext', 
                 'remove', 'move', 'rotate', 'zoom', 'animate', 'getleft', 'gettop', 'getopacity', 'setopacity', 
                 'hideshape', 'showshape'],
        
        'stack': ['pushvalue', 'popvalue', 'getcount'],
        
        'text': ['getlength', 'getsubtext', 'converttouppercase', 'converttolowercase', 'issubtext', 'append', 
               'getcharacter', 'getcharactercode', 'getindexof', 'startswith', 'endswith', 'getsubtexttoend'],
        
        'timer': ['tick', 'pause', 'resume'],
        
        'imagelist': ['loadimage', 'getwidthofimage', 'getheightofimage'],
        
        'flickr': ['getpictureofmoment', 'getrandompicture', 'getpictureofmomentfortag'],
        
        'controls': ['addbutton', 'addtextbox', 'buttonclicked', 'getbuttoncaption', 'gettextboxtext', 
                   'hidecontrol', 'remove', 'setbuttoncaption', 'settextboxtext', 'showcontrol', 'texttyped'],
        
        'dictionary': ['addvalue', 'containskey', 'containsvalue', 'getkeys', 'getvalue', 'getvalues', 'removekey'],
        
        'array': ['containsindex', 'containsvalue', 'getallindices', 'getitemcount', 'getvalue', 'isarray', 
                'removevalue', 'setvalue']
    };
}

function findClosestMatch(input: string, possibilities: string[]): string | null {
    if (possibilities.length === 0) return null;
    
    let bestMatch = possibilities[0];
    let bestScore = levenshteinDistance(input, bestMatch);
    
    for (let i = 1; i < possibilities.length; i++) {
        const score = levenshteinDistance(input, possibilities[i]);
        if (score < bestScore) {
            bestScore = score;
            bestMatch = possibilities[i];
        }
    }
    
    // Only suggest if it's reasonably close
    return bestScore <= 3 ? bestMatch : null;
}

function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    // Initialize the matrix
    for (let i = 0; i <= a.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }
    
    // Fill the matrix
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i-1] === b[j-1]) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i-1][j-1] + 1, // substitution
                    matrix[i][j-1] + 1,   // insertion
                    matrix[i-1][j] + 1    // deletion
                );
            }
        }
    }
    
    return matrix[a.length][b.length];
}

// Check if a member is a method that requires parentheses
function isMethod(objectName: string, memberName: string): boolean {
    const methods = getObjectMethods();
    
    if (objectName.toLowerCase() in methods) {
        return methods[objectName.toLowerCase()].includes(memberName.toLowerCase());
    }
    
    return false;
}

// Helper function to check if a word is a Small Basic keyword or built-in object
function isKeywordOrBuiltin(word: string): boolean {
    const keywords = [
        'if', 'then', 'else', 'elseif', 'endif', 'for', 'to', 'step', 'next', 'while', 'endwhile', 
        'sub', 'endsub', 'goto', 'label', 'true', 'false', 'and', 'or', 'not'
    ];
    
    const builtins = [
        'textwindow', 'graphicswindow', 'math', 'clock', 'file', 'network', 'program', 'shapes', 
        'stack', 'turtle', 'timer', 'imagelist', 'flickr', 'sound', 'mouse', 'text', 'controls', 
        'dictionary', 'desktop', 'array'
    ];
    
    return keywords.includes(word.toLowerCase()) || builtins.includes(word.toLowerCase());
}

function isWithinUrlString(line: string, position: number): boolean {
    // Look for quotes before and after this position
    let inString = false;
    let stringStart = -1;
    
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            if (inString) {
                // End of string
                const stringContent = line.substring(stringStart, i);
                // Check if our position is within this string and the string contains a URL
                if (position > stringStart && position < i && 
                    (stringContent.includes("http://") || 
                     stringContent.includes("https://") || 
                     stringContent.includes("www.") ||
                     /\.\w{2,}/.test(stringContent))) { // matches domain extensions
                    return true;
                }
                inString = false;
            } else {
                // Start of string
                stringStart = i;
                inString = true;
            }
        }
    }
    return false;
}
