console.log("background loaded");

export async function updateDb() {
  const raw = await fetch(`https://defillama-datasets.llama.fi/tokenlist/search.json`).then((res) => res.json());
  await chrome.storage.local.set(raw)
}

function setupUpdateProtocolsDb() {
  console.log("setupUpdateProtocolsDb");
  chrome.alarms.get("updateProtocolsDb").then((a) => {
    if (!a) {
      console.log("setupUpdateProtocolsDb", "create");
      updateDb()
      chrome.alarms.create("updateProtocolsDb", { periodInMinutes: 12*60 }); // update once every 12 hours
    }
  });
}

function startupTasks() {
  setupUpdateProtocolsDb();
}

chrome.runtime.onInstalled.addListener(() => {
  startupTasks();
});

chrome.runtime.onStartup.addListener(() => {
  startupTasks();
});

chrome.alarms.onAlarm.addListener(async (a) => {
  switch (a.name) {
    case "updateProtocolsDb":
      await updateDb()
      break;
  }
});
