import { WebSearchClient, SearchResultItem } from './WebSearchClient.js';

export class MockSearchClient implements WebSearchClient {
  private customResults: SearchResultItem[] | null = null;

  constructor(customResults?: SearchResultItem[]) {
    if (customResults) {
      this.customResults = customResults;
    }
  }

  setResults(results: SearchResultItem[]) {
    this.customResults = results;
  }

  async search(query: string, maxResults = 5): Promise<SearchResultItem[]> {
    if (this.customResults) {
      return this.customResults.slice(0, maxResults);
    }

    // Default deterministic fixtures based on query keywords
    const lower = query.toLowerCase();
    if (lower.includes('constitution') || lower.includes('india')) {
      return [
        {
          title: 'Constitution of India - Official Legislative Portal',
          url: 'https://legislative.gov.in/constitution-of-india',
          snippet: 'The Constitution of India came into effect on 26 January 1950, which is celebrated as Republic Day.',
          publishedDate: '2023-01-26',
          score: 0.95,
        },
        {
          title: 'Adoption and Commencement of Indian Constitution - Archives',
          url: 'https://en.wikipedia.org/wiki/Constitution_of_India',
          snippet: 'Adopted on 26 November 1949 and came into effect on 26 January 1950.',
          publishedDate: '2024-01-01',
          score: 0.92,
        },
        {
          title: 'Historical Background of Republic Day',
          url: 'https://www.britannica.com/topic/Constitution-of-India',
          snippet: 'The Indian Constitution replaced the Government of India Act 1935 on January 26, 1950.',
          publishedDate: '2023-08-15',
          score: 0.88,
        },
      ].slice(0, maxResults);
    }

    return [
      {
        title: `Search findings for: ${query}`,
        url: `https://example.org/search?q=${encodeURIComponent(query)}`,
        snippet: `Public factual records and documentation regarding ${query}.`,
        publishedDate: '2024-01-01',
        score: 0.85,
      },
    ].slice(0, maxResults);
  }
}

