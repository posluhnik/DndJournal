import { useCallback, useState } from "react";
import type { ShopItem } from "../../types";
import { saveRecord } from "../../lib/records";

export function useShop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const saveItem = useCallback((item: ShopItem) => {
    setItems((current) => saveRecord(current, item));
  }, []);
  return { items, saveItem };
}
