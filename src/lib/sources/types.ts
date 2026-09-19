import type { Category, EarlySignal, ScoreKey, SourceName } from "../types";





export interface RawSignalInput {
  source: SourceName;
  sourceUrl: string;
  title: string;
  description?: string;
  author?: string;
  publishedAt: Date;
  category?: Category;
  engagement?: number;
  engagementVelocity?: number;
  keywords?: string[];
  confidenceScore?: number;
  rawData?: Record<string, unknown>;
}

export interface TrendSource {
  name: SourceName;
  
  fetchItems(): Promise<RawSignalInput[]>;
  
  normalizeItem(item: RawSignalInput): RawSignalInput;
}
