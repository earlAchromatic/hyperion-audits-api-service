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
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const uuid_1 = require("uuid");
const app = (0, express_1.default)();
const port = 3000;
const child_process_1 = require("child_process");
const Users = [];
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.get("/", (req, res) => {
    res.send("hellow world");
});
app.get("/init", (req, res) => {
    var _a;
    if (!req.cookies.userId) {
        const newUserId = (0, uuid_1.v4)();
        res.cookie("userId", newUserId);
        res.send("cookie should be set now");
        Users.push({ userId: newUserId, jobs: [] });
    }
    else {
        const UI = req.cookies.userId;
        const jobArray = (_a = Users.find((f) => {
            if (f.userId) {
                return f.userId === UI;
            }
        })) === null || _a === void 0 ? void 0 : _a.jobs;
        res.send(jobArray);
    }
});
function init(req, res) {
    if (!req.cookies.userId) {
        const newUserId = (0, uuid_1.v4)();
        res.cookie("userId", newUserId);
        Users.push({ userId: newUserId, jobs: [] });
        console.log("had to quick set a new cookie because there wasnt one");
        return newUserId;
    }
    else
        return req.cookies.userId;
}
function searchUsers(userId, job) {
    Users.forEach((u) => {
        if (u.userId === userId) {
            console.log("adding job " + job + "to " + u.userId);
            u.jobs.push(job);
        }
    });
}
app.post("/crawl", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const site = req.body.site;
    const subsite = site.split("https://")[1];
    const UI = init(req, res);
    const processID = (0, uuid_1.v4)();
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
    searchUsers(UI, process);
    console.log(Users);
    child.on("message", (data) => {
        process.result = data;
    });
}));
app.get("/crawl/:id", (req, res) => {
    var _a;
    const id = req.params.id;
    const UI = init(req, res);
    console.log(Users);
    (_a = Users.find((f) => {
        if (f.userId) {
            return f.userId === UI;
        }
    })) === null || _a === void 0 ? void 0 : _a.jobs.forEach((p) => {
        console.log("jobs is: " + p);
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
    const processID = (0, uuid_1.v4)();
    const UI = init(req, res);
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
    searchUsers(UI, process);
});
app.get("/batch/:id/", (req, res) => {
    var _a;
    const id = req.params.id;
    const UI = init(req, res);
    (_a = Users.find((f) => {
        if (f.userId) {
            return f.userId === UI;
        }
    })) === null || _a === void 0 ? void 0 : _a.jobs.forEach((p) => {
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
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`listing on port ${port}`);
});
//# sourceMappingURL=index.js.map