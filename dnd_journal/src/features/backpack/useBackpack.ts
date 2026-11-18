import { useCallback } from "react";
import type { JournalItem } from "../../types";
import { saveRecord } from "../../lib/records";
import { useJournalState } from "../../lib/journalStore";


export function useBackpack() {
  const [items, setItems] = useJournalState<JournalItem[]>(
    "backpack",
    [],
  );
  const saveItem = useCallback((item: JournalItem) => {
    setItems((current) => saveRecord(current, item));
  }, []);
  const changeQuantity = useCallback((id: string, delta: number) => {
    setItems((current) => current.map((item) => item.id === id
      ? { ...item, quantity: Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, item.quantity + delta)) }
      : item));
  }, []);
  return { items, saveItem, changeQuantity };
}
