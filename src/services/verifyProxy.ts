import axios, { type AxiosRequestConfig } from 'axios';
import * as fs from 'fs';

/**
 * Function to verify if a proxy is working
 * @param proxy - The proxy to test (host and port)
 * @returns true if the proxy works, false otherwise
 */
async function verifyProxy(proxy: { host: string; port: number }): Promise<boolean> {
    try {
        const testUrl = 'https://httpbin.org/ip';  // Test URL to check proxy
        const axiosConfig: AxiosRequestConfig = {
            proxy: {
                host: proxy.host,
                port: proxy.port,
            },
            timeout: 5000,  // Timeout for the request
        };

        const response = await axios.get(testUrl, axiosConfig);
        console.log(`Proxy working: ${proxy.host}:${proxy.port} - Your IP: ${response.data.origin}`);
        return true;
    } catch (error) {
        console.warn(`Proxy failed: ${proxy.host}:${proxy.port}`);
        return false;
    }
}

/**
 * Function to get a random working proxy from the list
 * @returns A random working proxy if available, otherwise null
 */
async function getRandomWorkingProxy(): Promise<{ host: string; port: number } | null> {
    const proxies = JSON.parse(fs.readFileSync('./proxies.json', 'utf8')) as string[];
    for (let i = 0; i < proxies.length; i++) {
        const proxy = proxies[i];
        const [host, port] = proxy.split(':');
        const proxyObj = { host, port: parseInt(port, 10) };

        const isWorking = await verifyProxy(proxyObj);
        if (isWorking) {
            return proxyObj;
        }
    }

    console.error('No working proxies found.');
    return null;
}

// Export functions for use in other parts of your project
export { verifyProxy, getRandomWorkingProxy };

// Example usage (can be commented out if not needed)
(async () => {
    const workingProxy = await getRandomWorkingProxy();
    if (workingProxy) {
        console.log(`Found working proxy: ${workingProxy.host}:${workingProxy.port}`);
    }
})();
