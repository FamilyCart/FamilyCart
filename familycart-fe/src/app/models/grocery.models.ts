export interface GroceryList {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  family_membership: number;
  created_by: number;
}

export interface GroceryListResults {
  message?: string;
  payload?: GroceryList[];
  status?: number;
}

export interface GroceryListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: GroceryListResults;
}

