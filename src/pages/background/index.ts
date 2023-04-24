console.log("background loaded");

import Browser from "webextension-polyfill";

import cute from "@assets/img/memes/cute-128.png";
import maxPain from "@assets/img/memes/max-pain-128.png";
import que from "@assets/img/memes/que-128.png";
import upOnly from "@assets/img/memes/up-only-128.png";

import { Protocol, protocolsDb, allowedDomainsDb, blockedDomainsDb, fuzzyDomainsDb, Token, tokensDb, nftDb, NFT } from "../libs/db";
import {
  PROTOCOLS_API,
  METAMASK_LIST_CONFIG_API,
  DEFILLAMA_DIRECTORY_API,
  PROTOCOL_TVL_THRESHOLD,
} from "../libs/constants";

startupTasks();

export async function updateNftDb() {
  const raw = await fetch(`https://nft.llama.fi/collections`).then((res) => res.json());
  const tokens = raw.map((x:any)=>({
    collectionId: x.collectionId,
    name: x.name,
    mcap: (x.floorPrice * x.totalSupply) || 0,
    image: x.image,
  })) as NFT[];
  await nftDb.nfts.clear();
  const result = await nftDb.nfts.bulkPut(tokens);
}

export async function updateTokensDb() {
  const raw = await fetch(`https://api.coingecko.com/api/v3/coins/list?include_platform=true`).then((res) => res.json());
  const tokens = raw as Token[];
  if (tokens.length === 0) {
    console.log("updateTokensDb", "no protocols found");
    return;
  }
  // empty db before updating
  await tokensDb.tokens.clear();
  const result = await tokensDb.tokens.bulkPut(tokens);
  console.log("updateTokensDb", result);
}

export async function updateProtocolsDb() {
  const raw = await fetch(PROTOCOLS_API).then((res) => res.json());
  const protocols = (raw["protocols"]?.map((x: any) => ({
    name: x.name,
    url: x.url,
    logo: x.logo,
    category: x.category,
    tvl: x.tvl,
  })) ?? []) as Protocol[];
  if (protocols.length === 0) {
    console.log("updateProtocolsDb", "no protocols found");
    return;
  }
  // empty db before updating
  await protocolsDb.protocols.clear();
  const result = await protocolsDb.protocols.bulkPut(protocols);
  console.log("updateProtocolsDb", result);
}

export async function updateDomainDbs() {
  console.log("updateDomainDbs", "start");
  const rawProtocols = await fetch(PROTOCOLS_API).then((res) => res.json());
  const protocols = (
    (rawProtocols["protocols"]?.map((x: any) => ({
      name: x.name,
      url: x.url,
      logo: x.logo,
      category: x.category,
      tvl: x.tvl || 0,
    })) ?? []) as Protocol[]
  ).filter((x) => x.tvl >= PROTOCOL_TVL_THRESHOLD);
  const protocolDomains = protocols
    .map((x) => {
      try {
        return new URL(x.url).hostname.replace("www.", "");
      } catch (error) {
        console.log("updateDomainDbs", "error", error);
        return null;
      }
    })
    .filter((x) => x !== null)
    .map((x) => ({ domain: x }));
  const metamaskLists = (await fetch(METAMASK_LIST_CONFIG_API).then((res) => res.json())) as {
    fuzzylist: string[];
    whitelist: string[];
    blacklist: string[];
  };
  const metamaskFuzzyDomains = metamaskLists.fuzzylist.map((x) => ({ domain: x }));
  const metamaskAllowedDomains = metamaskLists.whitelist.map((x) => ({ domain: x }));
  const metamaskBlockedDomains = metamaskLists.blacklist.map((x) => ({ domain: x }));
  const rawDefillamaDirectory = (await fetch(DEFILLAMA_DIRECTORY_API).then((res) => res.json())) as {
    version: number;
    whitelist: string[];
    blacklist?: string[];
    fuzzylist?: string[];
  };
  const defillamaDomains = rawDefillamaDirectory.whitelist.map((x) => ({ domain: x }));
  const defillamaBlockedDomains = rawDefillamaDirectory.blacklist?.map((x) => ({ domain: x })) ?? [];
  const defillamaFuzzyDomains = rawDefillamaDirectory.fuzzylist?.map((x) => ({ domain: x })) ?? [];
  const allowedDomains = [metamaskAllowedDomains, protocolDomains, defillamaDomains].flat();
  if (allowedDomains.length === 0) {
    console.log("allowedDomainsDb", "no allowed domains fetched, skipping update");
  } else {
    allowedDomainsDb.domains.clear();
    allowedDomainsDb.domains.bulkPut(allowedDomains);
    console.log("allowedDomainsDb", await allowedDomainsDb.domains.count());
  }

  const blockedDomains = [metamaskBlockedDomains, defillamaBlockedDomains].flat();
  if (blockedDomains.length === 0) {
    console.log("blockedDomainsDb", "no blocked domains fetched, skipping update");
  } else {
    blockedDomainsDb.domains.clear();
    blockedDomainsDb.domains.bulkPut(blockedDomains);
    console.log("blockedDomainsDb", await blockedDomainsDb.domains.count());
  }

  const fuzzyDomains = [metamaskFuzzyDomains, protocolDomains, defillamaDomains, defillamaFuzzyDomains].flat();
  if (fuzzyDomains.length === 0) {
    console.log("fuzzyDomainsDb", "no fuzzy domains fetched, skipping update");
  } else {
    fuzzyDomainsDb.domains.clear();
    fuzzyDomainsDb.domains.bulkPut(fuzzyDomains);
    console.log("fuzzyDomainsDb", await fuzzyDomainsDb.domains.count());
  }

  console.log("updateDomainDbs", "done");
}

function setupUpdateProtocolsDb() {
  console.log("setupUpdateProtocolsDb");
  Browser.alarms.get("updateProtocolsDb").then((a) => {
    if (!a) {
      console.log("setupUpdateProtocolsDb", "create");
      updateProtocolsDb();
      updateTokensDb();
      updateNftDb();
      Browser.alarms.create("updateProtocolsDb", { periodInMinutes: 1 }); // update once every 2 hours
    }
  });
}

function setupUpdateDomainDbs() {
  console.log("setupUpdateDomainDbs");
  Browser.alarms.get("updateDomainDbs").then((a) => {
    if (!a) {
      console.log("setupUpdateDomainDbs", "create");
      updateDomainDbs();
      Browser.alarms.create("updateDomainDbs", { periodInMinutes: 1 }); // update once every 2 hours
    }
  });
}

function startupTasks() {
  console.log("startupTasks", "start");
  setupUpdateProtocolsDb();
  setupUpdateDomainDbs();
  Browser.action.setIcon({ path: cute });
  console.log("startupTasks", "done");
}

Browser.runtime.onInstalled.addListener(() => {
  startupTasks();
});

Browser.runtime.onStartup.addListener(() => {
  startupTasks();
});

Browser.alarms.onAlarm.addListener(async (a) => {
  switch (a.name) {
    case "updateProtocolsDb":
      await updateProtocolsDb();
      await updateTokensDb();
      await updateNftDb();
      break;
    case "updateDomainDbs":
      await updateDomainDbs();
      break;
  }
});
