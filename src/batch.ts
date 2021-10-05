import { exec } from "child_process";

export default function commander(): Command {
  let command = "lighthouse-batch --no-report -s ";

  const buildCommandList = async (
    sitesArray: string[],
    outFolderPath: string
  ): Promise<void> => {
    sitesArray.forEach((e, i) => {
      console.log(`command add: ${e}`);
      command = command + e;
      if (i !== sitesArray.length - 1) {
        command = command + ",";
      }
    });
    command = command + " -o " + outFolderPath;
    console.log(command);
    try {
      await execPromise(command);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    command,
    buildCommandList,
  };
}

interface Command {
  command: string;
  buildCommandList: (sitesArray: string[], outFolderPath: string) => void;
}

function execPromise(cmd: any) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}
