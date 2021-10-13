import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { v4 } from "uuid";

const app = express();

const port = 3000;

import { ChildProcess, fork } from "child_process";

interface Jobs {
  cpID: string;
  type: string;
  status: string;
  process: ChildProcess;
  result?: string[];
}

interface User {
  userId: string;
  jobs: Jobs[];
}

const Users: User[] = [];

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hellow world");
});

app.get("/init", (req, res) => {
  if (!req.cookies.userId) {
    const newUserId = v4();
    res.cookie("userId", newUserId);
    res.send("cookie should be set now");
    Users.push({ userId: newUserId, jobs: [] });
  } else {
    const UI = req.cookies.userId;
    const jobArray = Users.find((f) => {
      if (f.userId) {
        return f.userId === UI;
      }
    })?.jobs;
    res.send(jobArray);
  }
});

function init(req: Request, res: Response): string {
  if (!req.cookies.userId) {
    const newUserId = v4();
    res.cookie("userId", newUserId);
    Users.push({ userId: newUserId, jobs: [] });
    console.log("had to quick set a new cookie because there wasnt one");
    return newUserId;
  } else return req.cookies.userId;
}

function searchUsers(userId: string, job: Jobs): void {
  Users.forEach((u) => {
    if (u.userId === userId) {
      console.log("adding job " + job + "to " + u.userId);
      u.jobs.push(job);
    }
  });
}

app.post("/crawl", async (req, res) => {
  const site = req.body.site;
  const subsite = site.split("https://")[1];

  const UI = init(req, res);

  const processID = v4();
  res.set("Location", `/crawl/${processID}`);
  res.status(202).send(subsite);
  // build out list by crawling site

  const child = fork(__dirname + "/runCrawl", [site, "a"]);
  const process: Jobs = {
    cpID: processID,
    type: "crawl",
    process: child,
    status: "Running",
  };

  searchUsers(UI, process);
  console.log(Users);

  child.on("message", (data: string[]) => {
    process.result = data;
  });
});

app.get("/crawl/:id", (req, res) => {
  const id = req.params.id;
  const UI = init(req, res);
  console.log(Users);
  Users.find((f) => {
    if (f.userId) {
      return f.userId === UI;
    }
  })?.jobs.forEach((p) => {
    console.log("jobs is: " + p);
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
  const processID = v4();
  const UI = init(req, res);
  const crawlList: string = JSON.stringify(req.body.batchInput);
  console.log(crawlList);
  const resultLocation = `./batch/${processID}/result`;
  res.set("Location", `/batch/${processID}`);
  res.status(202).send();

  const child = fork(__dirname + "/runBatch", [crawlList, resultLocation]);
  const process: Jobs = {
    cpID: processID,
    type: "batch",
    process: child,
    status: "Running",
  };

  searchUsers(UI, process);
});

app.get("/batch/:id/", (req, res) => {
  const id = req.params.id;
  const UI = init(req, res);
  Users.find((f) => {
    if (f.userId) {
      return f.userId === UI;
    }
  })?.jobs.forEach((p) => {
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

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`listing on port ${port}`);
});
