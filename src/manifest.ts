import packageJson from "../package.json";
import { ManifestType } from "@src/manifest-type";

const manifest: ManifestType = {
  manifest_version: 3,
  name: packageJson.displayName,
  version: packageJson.version,
  description: packageJson.description,
  background: process.env.BROWSER === "FIREFOX" ?
    { scripts: ["src/pages/background/index.js"] } as any
    : { service_worker: "src/pages/background/index.js", type: "module" },
  action: {
    default_title: packageJson.displayName,
    default_icon: "icon-34.png",
  },
  icons: {
    "128": "icon-128.png",
  },
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "assets/img/memes/*.jpg",
        "assets/img/protocols/*.jpg",
        "assets/jpg/*.jpg",
        "assets/jpg/*.chunk.jpg",
        "assets/img/memes/*.png",
        "assets/img/protocols/*.png",
        "assets/png/*.png",
        "assets/png/*.chunk.png",
        "assets/img/memes/*.webp",
        "assets/img/protocols/*.webp",
        "assets/webp/*.webp",
        "assets/webp/*.chunk.webp",
        "icon-128.png",
        "icon-34.png",
      ],
      matches: ["<all_urls>"],
    },
  ],
  chrome_url_overrides : {
    "newtab": "src/pages/popup/index.html"
  },
  permissions: ["storage", "alarms", "search"],
  optional_permissions: ["topSites"],
};

export default manifest;
