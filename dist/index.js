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
const child_process_1 = require("child_process");
const globalProcessArray = [];
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("hellow world");
});
app.post("/crawl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const site = req.body.site;
    const subsite = site.split("https://")[1];
    const outputPath = `./report/${subsite}`;
    const processID = Math.round(Math.random() * 1000);
    res.set("Location", `/crawl/${processID}`);
    res.status(202).send(subsite);
    // build out list by crawling site
    const child = (0, child_process_1.fork)(__dirname + "/runCrawl", [site, "a"]);
    const process = {
        cpID: processID,
        type: "crawl",
        process: child,
        status: "Running",
    };
    globalProcessArray.push(process);
    console.log(globalProcessArray);
    // const list: string[] = await extract(site, "a");
    // await commander(processID).buildCommandList(list, outputPath);
    // const result = require(`../report/${subsite}/summary.json`);
    // console.log(result);
    // res.json(result);
    child.on("message", (data) => {
        process.result = data;
    });
}));
app.get("/crawl/:id", (req, res) => {
    const id = req.params.id;
    globalProcessArray.forEach((p) => {
        if (id === p.cpID.toString()) {
            if (p.process.exitCode === null) {
                p.status = "Running";
                res.send(p);
            }
            else {
                p.status = "Succeeded";
                res.set("Location", `/crawl/${id}/result`);
                res.send(p);
            }
        }
    });
});
app.post("/batch/", (req, res) => {
    const processID = Math.round(Math.random() * 1000);
    const crawlList = JSON.stringify(req.body.batchInput);
    console.log(crawlList);
    const resultLocation = `./batch/${processID}/result`;
    res.set("Location", `/batch/${processID}`);
    res.status(202).send();
    const child = (0, child_process_1.fork)(__dirname + "/runBatch", [crawlList, resultLocation]);
    const process = {
        cpID: processID,
        type: "batch",
        process: child,
        status: "Running",
    };
    globalProcessArray.push(process);
});
app.get("/batch/:id/", (req, res) => {
    const id = req.params.id;
    globalProcessArray.forEach((p) => {
        if (id === p.cpID.toString()) {
            if (p.process.exitCode === null) {
                p.status = "Running";
                res.send(p);
            }
            else {
                p.status = "Succeeded";
                res.set("Location", `/batch/${id}/result`);
                res.send(p);
            }
        }
    });
});
app.get("/batch/:id/result", (req, res) => {
    const id = req.params.id;
    const result = require(`../batch/${id}/result/summary.json`);
    res.send(result);
});
const server = app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`listing on port ${port}`);
});
//# sourceMappingURL=index.js.map