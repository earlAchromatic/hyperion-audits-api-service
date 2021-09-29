"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
function commander() {
    let command = "lighthouse-batch --no-report -s ";
    const buildCommandList = (sitesArray, outFolderPath) => __awaiter(this, void 0, void 0, function* () {
        sitesArray.forEach((e, i) => {
            console.log(`command add: ${e}`);
            command = command + e;
            if (i !== sitesArray.length - 1) {
                command = command + ",";
            }
        });
        command = command + " -o " + outFolderPath;
        console.log(command);
        // exec(command);
        try {
            yield execPromise(command);
        }
        catch (err) {
            console.error(err);
        }
    });
    return {
        command,
        buildCommandList,
    };
}
exports.default = commander;
function execPromise(cmd) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}
//# sourceMappingURL=batch.js.map