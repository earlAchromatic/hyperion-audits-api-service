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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3000;
const crawl_1 = require("./crawl");
const batch_1 = __importDefault(require("./batch"));
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("hellow world");
});
app.post("/build-list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const site = req.body.site;
    const subsite = site.split("https://")[1];
    const outputPath = `./report/${subsite}`;
    // build out list by crawling site
    const list = yield (0, crawl_1.extract)(site, "a");
    yield (0, batch_1.default)().buildCommandList(list, outputPath);
    const result = require(`../report/${subsite}/summary.json`);
    res.json(result);
}));
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`listing on port ${port}`);
});
//# sourceMappingURL=index.js.map