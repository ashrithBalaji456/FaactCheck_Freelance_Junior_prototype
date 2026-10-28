export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string | null;
  score?: number | null;
}

export interface WebSearchClient {
  search(query: string, maxResults?: number): Promise<SearchResultItem[]>;
}

