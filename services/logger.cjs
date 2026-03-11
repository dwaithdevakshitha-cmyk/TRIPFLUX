const fs = require('fs');
const path = require('path');

const logsDir = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), { flags: 'a' });

function getTimestamp() {
    return new Date().toISOString();
}

const logger = {
    info: (message) => {
        const log = `[${getTimestamp()}] INFO: ${message}\n`;
        process.stdout.write(log);
        accessLogStream.write(log);
    },
    error: (message, err) => {
        const errorStack = err ? `\n${err.stack}` : '';
        const log = `[${getTimestamp()}] ERROR: ${message}${errorStack}\n`;
        process.stderr.write(log);
        errorLogStream.write(log);
    },
    // Middleware for Express
    requestLogger: (req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            const log = `[${getTimestamp()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms\n`;
            accessLogStream.write(log);
        });
        next();
    }
};

module.exports = logger;
