"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const batch_1 = __importDefault(require("./batch"));
const urlList = JSON.parse(process.argv[2]).map((u) => {
    return u.url;
});
(0, batch_1.default)().buildCommandList(urlList, process.argv[3]);
//# sourceMappingURL=runBatch.js.map