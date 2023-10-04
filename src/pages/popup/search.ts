import { calculateSearchOptions } from "../search"

const storedDB = chrome.storage.local.get(["nfts", "tokens", "protocols", "other"])

export async function getSearchOptions(text:string){
   return calculateSearchOptions(text, await storedDB as any)
}