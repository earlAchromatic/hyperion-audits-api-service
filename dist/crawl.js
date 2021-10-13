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
exports.filterArray = exports.extract = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
function extract(site, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        const hrefs = [];
        yield cyclePages(hrefs, site, "a", page, site, filterList);
        // adds site as first entry
        hrefs.unshift(site);
        yield browser.close();
        return hrefs;
    });
}
exports.extract = extract;
function cyclePages(outputArray, link, tag, page, site, filterArr) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(link);
        yield page.goto(link);
        let aList = yield getAllAnchors(page, tag);
        aList = filterArray(aList, filterArr);
        for (const a of aList) {
            if (outputArray.includes(a)) {
                continue;
            }
            else {
                if (!a.includes(site)) {
                    // Needs to have www. or no www. or flags internal as ext.
                    // bug where url is for example facebook.com/.../site/... and is therefor included
                    // change to regex
                    continue;
                }
                else {
                    outputArray.push(a);
                    yield cyclePages(outputArray, a, tag, page, site, filterArr);
                }
            }
        }
        return;
    });
}
function getAllAnchors(page, tag) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield page.$$eval(tag, (nodes) => nodes.map((n) => {
            if (n instanceof HTMLAnchorElement) {
                return n.href;
            }
            else
                return "";
        }));
    });
}
function filterArray(array, filters) {
    const filterKeys = Object.keys(filters);
    return array.filter((item, i) => {
        return filterKeys.every((key) => {
            if (typeof filters[key] !== "function")
                return true;
            return filters[key](item);
        });
    });
}
exports.filterArray = filterArray;
// some example filters, can be added and removed via interface + API call
const filterList = {
    spaces: (e) => e !== "",
    hash: (e) => !(e === null || e === void 0 ? void 0 : e.includes("#")),
    https: (e) => e.includes("https" || "www"),
    epub: (e) => !e.includes("epub"),
    pdf: (e) => !e.includes("pdf"),
    zip: (e) => !e.includes("zip"),
    // validTLD: (e: any) => e.includes(".com" || ".dev"),
};
//# sourceMappingURL=crawl.js.map