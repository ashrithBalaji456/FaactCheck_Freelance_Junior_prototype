import { WebSearchClient } from '../search/WebSearchClient.js';
import { IEvidence } from '../models/Evidence.js';
import { storage } from '../storage/InMemoryStorage.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface RetrievedEvidenceSet {
  items: IEvidence[];
  formattedText: string;
}

export class EvidenceRetriever {
  constructor(private searchClient: WebSearchClient) {}

  async retrieveAndPersist(
    verificationId: string,
    queries: string[]
  ): Promise<RetrievedEvidenceSet> {
    logger.info({ verificationId, queryCount: queries.length }, 'Starting Agent 2: Evidence Retriever');

    const seenUrls = new Set<string>();
    const evidenceToInsert: Array<Omit<IEvidence, 'id' | '_id' | 'createdAt' | 'updatedAt'>> = [];

    const boundedQueries = queries.slice(0, env.MAX_SEARCH_QUERIES);

    for (const query of boundedQueries) {
      try {
        const results = await this.searchClient.search(query, 4);

        for (const item of results) {
          const normalizedUrl = item.url.trim().replace(/\/$/, '');
          if (!seenUrls.has(normalizedUrl) && evidenceToInsert.length < env.MAX_SEARCH_RESULTS) {
            seenUrls.add(normalizedUrl);

            let domain = 'unknown';
            try {
              domain = new URL(item.url).hostname.replace(/^www\./, '');
            } catch {
              domain = 'unknown';
            }

            evidenceToInsert.push({
              verificationId,
              title: item.title,
              url: item.url,
              sourceDomain: domain,
              snippet: item.snippet,
              publishedAt: item.publishedDate ? new Date(item.publishedDate) : null,
              retrievedAt: new Date(),
              stance: 'UNKNOWN',
              sourceType: 'SECONDARY',
              contentAccessLevel: 'SEARCH_SNIPPET',
            });
          }
        }
      } catch (err: any) {
        logger.warn({ query, error: err.message }, 'Search query failed in EvidenceRetriever');
      }
    }

    if (evidenceToInsert.length === 0) {
      throw new Error(
        'Unable to retrieve any relevant evidence from web search for the given claim queries.'
      );
    }

    // Persist to In-Memory Storage
    const persistedDocs = storage.createManyEvidence(evidenceToInsert);

    const formattedText = persistedDocs
      .map(
        (doc) =>
          `[Evidence ID: ${doc.id}]\nTitle: ${doc.title}\nDomain: ${doc.sourceDomain}\nPublished: ${
            doc.publishedAt ? doc.publishedAt.toISOString().split('T')[0] : 'Unknown'
          }\nSnippet: ${doc.snippet}\n`
      )
      .join('\n');

    logger.info(
      { verificationId, totalEvidenceRetrieved: persistedDocs.length },
      'Agent 2 completed evidence retrieval and persistence'
    );

    return {
      items: persistedDocs,
      formattedText,
    };
  }
}
