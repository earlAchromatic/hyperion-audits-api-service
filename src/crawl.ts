import puppeteer, { Page } from "puppeteer";

async function extract(site: string, tag: string): Promise<string[]> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const hrefs: string[] = [];

  await cyclePages(hrefs, site, "a", page, site, filterList);

  // adds site as first entry
  hrefs.unshift(site);

  await browser.close();
  return hrefs;
}

async function cyclePages(
  outputArray: string[],
  link: string,
  tag: string,
  page: Page,
  site: string,
  filterArr: any
) {
  console.log(link);
  await page.goto(link);
  let aList = await getAllAnchors(page, tag);
  aList = filterArray(aList, filterArr);
  for (const a of aList) {
    if (outputArray.includes(a)) {
      continue;
    } else {
      if (!a.includes(site)) {
        // Needs to have www. or no www. or flags internal as ext.
        continue;
      } else {
        outputArray.push(a);
        await cyclePages(outputArray, a, tag, page, site, filterArr);
      }
    }
  }
  return;
}

async function getAllAnchors(page: Page, tag: string): Promise<string[]> {
  return await page.$$eval(tag, (nodes: Element[]) =>
    nodes.map((n: Element) => {
      if (n instanceof HTMLAnchorElement) {
        return n.href;
      } else return "";
    })
  );
}

function filterArray(array: string[], filters: any): string[] {
  const filterKeys = Object.keys(filters);
  return array.filter((item: any, i) => {
    return filterKeys.every((key) => {
      if (typeof filters[key] !== "function") return true;
      return filters[key](item);
    });
  });
}

// some example filters, can be added and removed via interface + API call
const filterList = {
  spaces: (e: any) => e !== "",
  hash: (e: any) => !e?.includes("#"),
  https: (e: any) => e.includes("https" || "www"),
  epub: (e: any) => !e.includes("epub"),
  pdf: (e: any) => !e.includes("pdf"),
  zip: (e: any) => !e.includes("zip"),
  // validTLD: (e: any) => e.includes(".com" || ".dev"),
};

export { extract, filterArray };
