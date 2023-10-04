import Dexie, { Table } from "dexie";

export interface Protocol {
  name: string;
  url: string;
  logo: string;
  category: string;
  tvl?: number;
}

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

export interface NFT {
  collectionId: string;
  name: string;
  mcap: number;
  image: string;
}

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
