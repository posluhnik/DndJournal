import { useCallback } from "react";
import { useJournalState } from "../../lib/journalStore";
import { saveRecord } from "../../lib/records";
import type { ShopItem } from "../../types";

export function useShop() {
	const [items, setItems] = useJournalState<ShopItem[]>("shop", []);
	const saveItem = useCallback((item: ShopItem) => {
		setItems((current) => saveRecord(current, item));
	}, []);
	return { items, saveItem };
}
