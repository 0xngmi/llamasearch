import { calculateSearchOptions } from ".";
import searchDb from "./data/search.json"

const ss = (text:string)=>calculateSearchOptions(text, searchDb)
const nft = (name:string)=>`Check price of ${name} on defillama`
const gc = (name:string) => `Check ${name} on coingecko`

describe.each([
    ["$BT", "$BTC on coingecko"],
    ["bored ape", nft("Bored Ape Yacht Club")],
    ["bitcoin", gc("Bitcoin")],
    ["binance", "Open Binance Exchange"],
    ["Curve", "Open Curve Finance"]
])('search(%s)', (searchString, expected) => {
    test(`returns "${expected}"`, () => {
      expect(ss(searchString)[0].text).toBe(expected);
    });
})