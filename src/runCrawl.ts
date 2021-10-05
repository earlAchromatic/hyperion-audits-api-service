import { extract } from "./crawl";

(async () => {
  const output = await extract(process.argv[2], process.argv[3]);
  const tableTransform = output.map((e) => {
    return { url: e };
  });
  (process as any).send({
    tableTransform,
  });
})();

process.on("uncaughtException", (err) => {
  console.log(err);
});
