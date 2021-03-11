export interface PocketRetrieveQuery {
  readonly state?: 'unread' | 'archive' | 'all';
  readonly fav?: 0 | 1;
  readonly tag?: string;
  readonly search?: string;
  readonly domain?: string;
  readonly count?: number;
  readonly since?: number;
}

export interface PocketAccessQuery {
  readonly consumer_key?: string;
  readonly access_token?: string;
}

export interface PocketRetrieveItem {
  resolved_url: string; // The final url of the item
  resolved_title: string; // The title that Pocket found for the item when it was parsed
  excerpt: string; // The first few lines of the item (articles only)
  favorite: 0 | 1; // 1 If the item is favorited
  status: 0 | 1 | 2; // 1 if the item is archived - 2 if the item should be deleted
}
