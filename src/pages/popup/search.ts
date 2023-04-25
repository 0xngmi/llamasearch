import { nftDb, protocolsDb, tokensDb } from "../libs/db";
import levenshtein from "fast-levenshtein";

const nfts = nftDb.nfts.toArray();
const protocols = protocolsDb.protocols.toArray();
const tokens = tokensDb.tokens.toArray();

export async function getSearchOptions(text:string){
    const normalizedText = text.toLowerCase()
    const googleSearchOption = {
        text: "Search google",
        url: `https://www.google.com/search?q=${text}`
    }
    if(/0x[0-f]{64}/.test(text)){
        return [
            {
                text: "Open tx in etherscan",
                url: `https://blockscan.com/tx/${text}`
            },
            googleSearchOption
        ]
    }
    if(/0x[0-9A-Fa-f]{40}/.test(text)){
        return [
            {
                text: "Open address in blockscan",
                url: `https://blockscan.com/address/${text}`
            },
            {
                text: "Open address in debank",
                url: `https://debank.com/profile/${text}`
            },
            googleSearchOption
        ]
    }
    if(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(text)){
        return [
            {
                text: "Open bitcoin address in explorer",
                url: `https://www.blockchain.com/explorer/addresses/btc/${text}`
            },
            googleSearchOption
        ]
    }
    let list = []
    if(text.length > 3){
        const nftsMatched = (await nfts).filter(p=>p.name.toLowerCase().includes(normalizedText))
        if(nftsMatched.length>0){ // Match nft
            const first = nftsMatched.sort((a,b)=>b.mcap-a.mcap)[0]
            list = list.concat([
                {
                    text: `Check price of ${first.name} on defillama`,
                    url: `https://defillama.com/nfts/collection/${first.collectionId}`
                },
                {
                    text: `Open ${first.name} on Opensea Pro`,
                    url: `https://pro.opensea.io/collection/${first.collectionId}`
                }
            ])
        }
        const protocolsMatched = (await protocols).filter(p=>p.name.toLowerCase().includes(normalizedText))
        if(protocolsMatched.length>0){ // Match protocol
            list = list.concat(protocolsMatched.sort((a,b)=>b.tvl-a.tvl).map(p=>({
                text: `Open ${p.name}`,
                url: p.url
            })))
        }
    }
    if(text.length > 2){
        const matched = (await tokens).filter(p=>p.name.toLowerCase().includes(normalizedText) || p.symbol.includes(normalizedText))
        if(matched.length>0){ // Match protocol
            list = list.concat(matched.slice(0,3).map(p=>({
                text: `Check ${p.name} on coingecko`,
                url: `https://www.coingecko.com/en/coins/${p.id}`
            })))
        }
    }
    return list.concat([
        googleSearchOption
    ])
    // Swap X for Y
    // Borrow X
}