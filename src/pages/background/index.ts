console.log("background loaded");

import Browser from "webextension-polyfill";

export async function updateDb() {
  const raw = await fetch(`https://defillama-datasets.llama.fi/tokenlist/search.json`).then((res) => res.json());
  await chrome.storage.local.set(raw)
}

function setupUpdateProtocolsDb() {
  console.log("setupUpdateProtocolsDb");
  Browser.alarms.get("updateProtocolsDb").then((a) => {
    if (!a) {
      console.log("setupUpdateProtocolsDb", "create");
      updateDb()
      Browser.alarms.create("updateProtocolsDb", { periodInMinutes: 12*60 }); // update once every 12 hours
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
      await updateDb()
      break;
  }
});
