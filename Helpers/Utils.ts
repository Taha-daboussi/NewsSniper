import fs from 'fs';
export class Utils {
    static log(message: string, type: 'success' | 'error' | 'info' | 'pending' = 'info'): void {
        const timestamp = new Date().toISOString();
        let logMessage = `[${type.toUpperCase()}] [${timestamp}] ${message}`;
        fs.appendFileSync(process.cwd() + "\\JDatabase\\logs.txt", logMessage + "\n")

        if (type.toLowerCase() === 'success') {
            logMessage = `\x1b[32m${logMessage}\x1b[0m`; // Green color
        } else if (type.toLowerCase() === 'error') {
            logMessage = `\x1b[31m${logMessage}\x1b[0m`; // Red color
        } else if (type.toLowerCase() === "info") {
            logMessage = `\x1b[34m${logMessage}\x1b[0m`; // Blue color
        } else if (type.toLowerCase() === "pending") {
            logMessage = `\x1b[33m${logMessage}\x1b[0m`; // Yellow color
        }
        console.log(logMessage);
    }

    static sleep(ms: number = 3000): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    static parseUserAgent(userAgent: string) {
        const ua = userAgent.toLowerCase();
        const secChUa = [];
        let secChUaMobile = '?0';
        let secChUaPlatform = 'Unknown';

        // Extract browser information
        if (ua.includes('chrome')) {
            const version = ua.match(/chrome\/([\d.]+)/)?.[1].split('.')[0] || 'unknown';
            secChUa.push(`"Google Chrome";v="${version}"`, `"Chromium";v="${version}"`, '"Not.A/Brand";v="24"');
        } else if (ua.includes('firefox')) {
            const version = ua.match(/firefox\/([\d.]+)/)?.[1].split('.')[0] || 'unknown';
            secChUa.push(`"Mozilla Firefox";v="${version}"`, `"Gecko";v="${version}"`, '"Not.A/Brand";v="24"');
        } else if (ua.includes('safari')) {
            const version = ua.match(/version\/([\d.]+)/)?.[1].split('.')[0] || 'unknown';
            secChUa.push(`"Safari";v="${version}"`, `"AppleWebKit";v="${version}"`, '"Not.A/Brand";v="24"');
        } else {
            secChUa.push('"Not.A/Brand";v="99"', '"Unknown";v="99"');
        }

        // Check for mobile
        if (ua.includes('mobile')) {
            secChUaMobile = '?1';
        }

        // Extract platform information
        if (ua.includes('windows')) {
            secChUaPlatform = '"Windows"';
        } else if (ua.includes('macintosh') || ua.includes('mac os')) {
            secChUaPlatform = '"macOS"';
        } else if (ua.includes('linux')) {
            secChUaPlatform = '"Linux"';
        } else if (ua.includes('android')) {
            secChUaPlatform = '"Android"';
        } else if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
            secChUaPlatform = '"iOS"';
        }

        return {
            'sec-ch-ua': secChUa.join(', '),
            'sec-ch-ua-mobile': secChUaMobile,
            'sec-ch-ua-platform': secChUaPlatform
        };
    }

    static shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }


}