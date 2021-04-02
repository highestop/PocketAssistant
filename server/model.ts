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
  item_id: string; // A unique identifier matching the saved item
  given_url: string; // The actual url that was saved with the item
  given_title: string; // The title that was saved along with the item
  resolved_url: string; // The final url of the item
  resolved_title: string; // The title that Pocket found for the item when it was parsed
  excerpt: string; // The first few lines of the item (articles only)
  favorite: 0 | 1; // 1 If the item is favorited
  status: 0 | 1 | 2; // 1 if the item is archived - 2 if the item should be deleted
}
