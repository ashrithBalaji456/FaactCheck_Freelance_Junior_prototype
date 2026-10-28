import { WebSearchClient, SearchResultItem } from './WebSearchClient.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export class TavilySearchClient implements WebSearchClient {
  private apiKey: string | undefined;
  private endpoint = 'https://api.tavily.com/search';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || env.TAVILY_API_KEY;
  }

  async search(query: string, maxResults = 5): Promise<SearchResultItem[]> {
    if (!this.apiKey || this.apiKey === 'replace_with_your_key') {
      throw new Error(
        'TAVILY_API_KEY is not configured. Set a valid API key in server/.env or pass a search client.'
      );
    }

    const retries = 2;
    let delay = 1000;

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), env.SEARCH_TIMEOUT_MS);

      try {
        logger.debug({ query, attempt }, 'Executing Tavily search');

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: this.apiKey,
            query,
            search_depth: 'basic',
            max_results: maxResults,
            include_answer: false,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
          const errorBody = await response.text();
          if ((response.status === 429 || response.status >= 500) && attempt < retries) {
            logger.warn({ status: response.status, attempt }, 'Transient search error, retrying...');
            await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 500));
            delay *= 2;
            continue;
          }
          throw new Error(`Tavily API responded with status ${response.status}: ${errorBody}`);
        }

        const data = (await response.json()) as any;
        const results = (data.results || []).map((item: any) => ({
          title: item.title || 'Untitled Source',
          url: item.url,
          snippet: item.content || item.snippet || '',
          publishedDate: item.published_date || null,
          score: typeof item.score === 'number' ? item.score : null,
        }));

        logger.info({ query, resultCount: results.length }, 'Tavily search completed successfully');
        return results;
      } catch (err: any) {
        clearTimeout(timeout);
        if (attempt >= retries || err.name === 'AbortError') {
          logger.error({ err, query }, 'Tavily search request failed');
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 500));
        delay *= 2;
      }
    }

    return [];
  }
}
