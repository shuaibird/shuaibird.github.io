import type { CollectionKey } from "astro:content";

type TechSeriesConfig = {
  slug: string;
  title: string;
  subtitle?: string;
  kicker?: string;
  meta?: string;
  collection: CollectionKey;
};

export const techSeries = [
  {
    slug: "every-bit-of-ai",
    title: "Every Bit of AI",
    subtitle: "Small, steady notes on what the tools are becoming.",
    kicker: "Tech Series",
    meta: "small, steady notes",
    collection: "every-bit-of-ai",
  },
  {
    slug: "engineering",
    title: "Engineering",
    subtitle: "Build notes on systems, craft, and shipping.",
    kicker: "Tech Series",
    meta: "systems and craft",
    collection: "engineering",
  },
] as const satisfies readonly TechSeriesConfig[];

export type TechSeries = (typeof techSeries)[number];
export type TechSeriesCollection = TechSeries["collection"];
