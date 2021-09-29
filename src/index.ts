import express from "express";
const app = express();

const port = 3000;

import { extract, filterArray } from "./crawl";

// some example filters, can be added and removed via interface + API call
const filters = {
  spaces: (e: any) => e !== "",
  hash: (e: any) => !e?.includes("#"),
  https: (e: any) => e.includes("https" || "www"),
  // validTLD: (e: any) => e.includes(".com" || ".dev"),
};

app.use(express.json());

app.get("/", (req, res) => {
  res.send("hellow world");
});

app.post("/build-list", async (req, res) => {
  const site = req.body.site;
  // build out list by crawling site
  let list: string[] = await extract(site, "a");
  list = filterArray(list, filters);
  res.json(list);
});

app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`listing on port ${port}`);
});
