import express from "express";
const app = express();

const port = 3000;

import { extract, filterArray } from "./crawl";
import commander from "./batch";
import { ChildProcess, fork } from "child_process";

const globalProcessArray: Process[] = [];
interface Process {
  cpID: number;
  type: string;
  status: string;
  process: ChildProcess;
  result?: string[];
}

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hellow world");
});

app.post("/crawl", async (req, res) => {
  const site = req.body.site;
  const subsite = site.split("https://")[1];
  const outputPath = `./report/${subsite}`;

  const processID = Math.round(Math.random() * 1000);
  res.set("Location", `/crawl/${processID}`);
  res.status(202).send(subsite);
  // build out list by crawling site

  const child = fork(__dirname + "/runCrawl", [site, "a"]);
  const process: Process = {
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
  child.on("message", (data: string[]) => {
    process.result = data;
  });
});

app.get("/crawl/:id", (req, res) => {
  const id = req.params.id;
  globalProcessArray.forEach((p) => {
    if (id === p.cpID.toString()) {
      if (p.process.exitCode === null) {
        p.status = "Running";
        res.send(p);
      } else {
        p.status = "Succeeded";
        res.set("Location", `/crawl/${id}/result`);
        res.send(p);
      }
    }
  });
});

app.post("/batch/", (req, res) => {
  const processID = Math.round(Math.random() * 1000);
  const crawlList: string = JSON.stringify(req.body.batchInput);
  console.log(crawlList);
  const resultLocation = `./batch/${processID}/result`;
  res.set("Location", `/batch/${processID}`);
  res.status(202).send();

  const child = fork(__dirname + "/runBatch", [crawlList, resultLocation]);
  const process: Process = {
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
      } else {
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
