import type { CoinCode } from "./features/wallet/currency";

export type JournalItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitWeight?: number;
  weightUnit: string;
  notes: string;
};

export type ShopItem = JournalItem & {
  price: number;
  currency: CoinCode;
};

export type Recipe = {
  id: string;
  name: string;
  materials: string;
  output: string;
  outputQuantity: number;
  notes: string;
};

export type InventoryTab = "backpack" | "recipes" | "shop";
