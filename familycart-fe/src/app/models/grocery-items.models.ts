export interface GroceryItem {
  id?: number;
  name: string;
  quantity: number;
  quantity_type: 'Gram' | 'Liter' | 'Count';
  note: string;
  purchased: boolean;
}

export interface GroceryItemResponse {
  message?: string;
  payload?: GroceryItem;
  status?: number;
}

export interface GroceryItemsResults {
  message?: string;
  payload?: GroceryItem[];
  status?: number;
}

export interface GroceryItemsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GroceryItemsResults;
}

export interface CreateGroceryListRequest {
  name: string;
  description: string;
  family_membership: number;
}

export interface CreateGroceryListResponse {
  message?: string;
  payload?: {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
    family_membership: number;
    created_by: number;
  };
  status?: number;
}

