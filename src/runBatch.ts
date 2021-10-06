import commander from "./batch";

const urlList = JSON.parse(process.argv[2]).map((u: any) => {
  return u.url;
});

commander().buildCommandList(urlList, process.argv[3]);
