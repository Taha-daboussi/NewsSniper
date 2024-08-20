const os = require('os')
import { exec } from 'child_process';
import fs from 'fs';
const RemoteSettings = {} as any;

interface GoClientInitializer {
    executePermissions(tempDir: string): Promise<boolean>;
    initMyGoClient(): Promise<boolean>;
    isMacOS(): boolean;
}

export class initGoClinet implements GoClientInitializer {
    private readonly separationType: string;

    constructor() {
        this.separationType = process.platform === "darwin" ? "/" : "\\";
    }

    /**
     * Execute permissions for the specified directory.
     * @param tempDir - The temporary directory path.
     * @returns A promise that resolves to a boolean indicating the success of the execution.
     */
    executePermissions(tempDir: string): Promise<boolean> {
        return new Promise((resolve) => {
            const command = `chmod +x ${tempDir}${this.separationType}TLS-Client${this.separationType}goClient`;
            exec(command, (err, stderr, stdout) => {
                if (err) {
                    console.error(err);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    /**
     * Initialize the Go client.
     * @returns A promise that resolves to a boolean indicating the success of the initialization.
     */
    async initMyGoClient(shouldCheckForDownload = true ): Promise<boolean> {
        if(shouldCheckForDownload){
            // await this.handleGoClientDownload();
        }
        return new Promise(async (resolve) => {
            const tempDir = os.tmpdir();

            if (this.isMacOS()) {
                await this.executePermissions(tempDir);
            }

            const appName = this.isMacOS() ? 'goClient' : 'goClient.exe';
            const tlsClientFolderPath = `${tempDir}${this.separationType}TLS-Client`;
            const command = this.isMacOS() ? `./goClient` : `cd ${tlsClientFolderPath} && ${appName}`;

            if (this.isMacOS()) {
                const launchAppCommand = `cd ${tlsClientFolderPath} && ./goClient`;
                const launchAppPath = RemoteSettings.appPath + this.separationType + 'launchApp.sh';
                fs.writeFileSync(launchAppPath, launchAppCommand);
                exec(`chmod +x ${launchAppPath}`);
                exec(launchAppCommand);
            }

            console.log(command);
            const newProcess = exec(command, (err, stderr, stdout) => {
                console.log(err);
                console.log(stderr);
                console.log(stdout);
                resolve(true);
            });
        });
    }
    /**
     * @description Download the TLS client.
     */
    // async handleGoClientDownload(){
    //     const tlsDownloader = new TlsClientDownloader();
    //     await tlsDownloader.downloadTLSclient();
    // }
    /**
     * Check if the current platform is macOS.
     * @returns A boolean indicating if the current platform is macOS.
     */
    isMacOS(): boolean {
        return this.separationType === '/';
    }
}