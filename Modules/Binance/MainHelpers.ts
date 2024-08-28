import path from "path";
import fs from 'fs'

export class MainHelpers {
    Config = this.getConfig();

    getConfig() {
        const rootDir = path.resolve(__dirname, "../../");

        // Construct the path to 'logs.txt' in the root directory
        const logFilePath = path.join(rootDir, 'JDatabase\\Config.json');
        const myConfig = JSON.parse(fs.readFileSync(logFilePath, 'utf-8'));
        return myConfig
    }


    compareArrays(originalArray: any[], newArray: any[]): any[] {
        const differences = [] as any[];
        for(let i = 0 ; i < newArray.length ; i++){
            if(newArray[i].title !== originalArray[i].title){
                differences.push({originalItem : originalArray[i] , newItem : newArray[i]})
            }
        }
        return differences;
      }
}