import type { SpreadCardV1 } from './spread-details.v1';

export interface SpreadHistoryItemV1 {
  spreadId: string;
  question: string;
  cards: SpreadCardV1[];
  prediction: string;
  createdAt: string;
}

/** history-service-api's `GET /users/:userId/spread-history` response. */
export interface SpreadHistoryPageV1 {
  items: SpreadHistoryItemV1[];
  nextCursor: string | null;
}
