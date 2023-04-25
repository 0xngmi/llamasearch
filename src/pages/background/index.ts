console.log("background loaded");

import Browser from "webextension-polyfill";

import { Protocol, protocolsDb, Token, tokensDb, nftDb, NFT } from "../libs/db";
import {
  PROTOCOLS_API,
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

function startupTasks() {
  setupUpdateProtocolsDb();
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
  }
});
