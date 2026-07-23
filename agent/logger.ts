// agent/logger.ts
import fs from 'fs';
import path from 'path';

export const logTrace = (message: string, data: any) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        message,
        data
    };
    fs.appendFileSync(
        path.join(__dirname, '../logs/trace.jsonl'), 
        JSON.stringify(logEntry) + '\n'
    );
};