import express from 'express';
import episodesRouter from './routes/episodes';
import os from 'os';

const app = express();
const port = process.env.PORT || 5173;

app.use('/', episodesRouter);

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

    console.log(`[INFO] Server running on port ${port}`);
    console.log(`Local: http://localhost:${port}`);
    if (lanIP) {
        console.log(`LAN: http://${lanIP}:${port}`);
    }
});
