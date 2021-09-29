const childprocess = require("child_process");

const sites = ["www.hyperionweb.dev", "www.hyperionweb.dev/blog"];

let command = "lighthouse-batch -s ";

function buildCommandList(sitesArray, command) {
  sitesArray.forEach((e) => {
    command = command + e + ", ";
  });
  return command;
}

const newCommand = buildCommandList(sites, command);

childprocess.exec(newCommand);
