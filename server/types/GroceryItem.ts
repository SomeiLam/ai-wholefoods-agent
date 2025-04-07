export interface GroceryItem {
  name: string;
  quantity: number;
  preferences: {
    brand?: string;
    organic?: boolean;
    country?: string;
    lowestPrice?: boolean;
  };
}
