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
      
        // Compare objects in the original array with the corresponding objects in the new array
        originalArray.forEach((originalItem, index) => {
          const newItem = newArray.find((item) => item.id === originalItem.id);
      
          if (newItem) {
            const diff = {} as any;
      
            // Check each property in the original item
            Object.keys(originalItem).forEach((key) => {
              if (originalItem[key] !== newItem[key]) {
                diff[key] = {
                  original: originalItem[key],
                  new: newItem[key],
                };
              }
            });
      
            // If there are differences, add the entire object with differences to the result
            if (Object.keys(diff).length > 0) {
              differences.push({
                id: originalItem.id,
                originalItem, // include the original item
                newItem, // include the new item
                differences: diff,
              });
            }
          } else {
            // If the item is missing in the new array
            differences.push({
              id: originalItem.id,
              originalItem, // include the original item
              message: "Item not found in the new array.",
            });
          }
        });
      
        // Check for any items in the new array that are not in the original array
        newArray.forEach((newItem) => {
          const originalItem = originalArray.find((item) => item.id === newItem.id);
          if (!originalItem) {
            differences.push({
              id: newItem.id,
              newItem, // include the new item
              message: "Item not found in the original array.",
            });
          }
        });
      
        return differences;
      }
}