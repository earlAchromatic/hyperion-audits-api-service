import express from "express";
const app = express();

const port = 3000;

import { extract, filterArray } from "./crawl";
import commander from "./batch";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hellow world");
});

app.post("/build-list", async (req, res) => {
  const site = req.body.site;
  const subsite = site.split("https://")[1];
  const outputPath = `./report/${subsite}`;
  // build out list by crawling site
  const list: string[] = await extract(site, "a");
  await commander().buildCommandList(list, outputPath);
  const result = require(`../report/${subsite}/summary.json`);
  res.json(result);
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`listing on port ${port}`);
});
