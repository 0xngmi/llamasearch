import Dexie, { Table } from "dexie";

export interface Protocol {
  name: string;
  url: string;
  logo: string;
  category: string;
  tvl?: number;
}

export class ProtocolsDb extends Dexie {
  protocols!: Table<Protocol>;

  constructor() {
    super("ProtocolsDb");
    this.version(1).stores({
      protocols: "name, category",
    });
  }
}

export const protocolsDb = new ProtocolsDb();

export interface Domain {
  domain: string;
}

export class AllowedDomainsDb extends Dexie {
  domains!: Table<Domain>;

  constructor() {
    super("AllowedDomainsDb");
    this.version(1).stores({
      domains: "domain",
    });
  }
}

export const allowedDomainsDb = new AllowedDomainsDb();

export interface Token {
  id: string;
  name: string;
  platforms: {
    [chain: string]: string
  }
  symbol: string;
}

export class TokensDb extends Dexie {
  tokens!: Table<Token>;

  constructor() {
    super("TokensDb");
    this.version(1).stores({
      tokens: "id",
    });
  }
}

export const tokensDb = new TokensDb();

export interface NFT {
  collectionId: string;
  name: string;
  mcap: number;
  image: string;
}

export class NFTDb extends Dexie {
  nfts!: Table<NFT>;

  constructor() {
    super("NFTDb");
    this.version(1).stores({
      nfts: "collectionId",
    });
  }
}

export const nftDb = new NFTDb();

export class FuzzyDomainsDb extends Dexie {
  domains!: Table<Domain>;

  constructor() {
    super("FuzzyDomainsDb");
    this.version(1).stores({
      domains: "domain",
    });
  }
}

export const fuzzyDomainsDb = new FuzzyDomainsDb();

export class BlockedDomainsDb extends Dexie {
  domains!: Table<Domain>;

  constructor() {
    super("BlockedDomainsDb");
    this.version(1).stores({
      domains: "domain",
    });
  }
}

export const blockedDomainsDb = new BlockedDomainsDb();
