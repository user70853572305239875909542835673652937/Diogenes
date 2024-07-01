import express from 'express';
import infoRouter from './routes/info';
import mappingsRouter from './routes/mappings';
import sourcessRouter from './routes/sources';
import os from 'os';
import winston from 'winston';

// Create a Winston logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
    ]
});

const app = express();
const port = process.env.PORT || 8080;

app.use('/info', infoRouter);
app.use('/mappings', mappingsRouter);
app.use('/sources', sourcessRouter);

app.listen(port, () => {
    const localIP = '127.0.0.1';
    const interfaces = os.networkInterfaces();
    let lanIP = '';

    for (const name of Object.keys(interfaces)) {
        const networkInterface = interfaces[name];
        if (networkInterface) {
            for (const net of networkInterface) {
                if (net.family === 'IPv4' && !net.internal) {
                    lanIP = net.address;
                    break;
                }
            }
        }
        if (lanIP) break;
    }

    logger.info(`Server running on port ${port}`);
    logger.info(`Local: http://localhost:${port}`);
    if (lanIP) {
        logger.info(`LAN: http://${lanIP}:${port}`);
    }
});
