import type { FormEvent } from "react";
import type { JournalItem, ShopItem } from "../types";
import { denominations } from "../features/wallet/currency";
import type { CoinCode } from "../features/wallet/currency";
import { readName } from "../lib/forms";
import { Modal } from "./Modal";

type Props = ({ mode: "backpack"; item?: JournalItem; onSave: (item: JournalItem) => void }
  | { mode: "shop"; item?: ShopItem; onSave: (item: ShopItem) => void }) & { onClose: () => void };

export function ItemDialog(props: Props) {
  const { item, onClose } = props;
  const isShop = props.mode === "shop";
  const title = isShop ? (item ? "Edit shop item" : "New shop item") : (item ? "Edit item" : "Add item");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = readName(form, data);
    if (!name) return;
    const weight = String(data.get("unitWeight") ?? "");
    const entry: JournalItem = {
      id: item?.id ?? crypto.randomUUID(), name,
      category: String(data.get("category") ?? "").trim(),
      quantity: Number(data.get("quantity")),
      unitWeight: weight === "" ? undefined : Number(weight),
      weightUnit: String(data.get("weightUnit") ?? "").trim(),
      notes: String(data.get("notes") ?? ""),
    };
    if (props.mode === "shop") {
      props.onSave({ ...entry, price: Number(data.get("price")), currency: String(data.get("currency")) as CoinCode });
    } else props.onSave(entry);
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="dialog-fields">
          <label>Item name<input name="name" defaultValue={item?.name ?? ""} required autoFocus maxLength={120} onInput={(event) => event.currentTarget.setCustomValidity("")} /></label>
          <label>Category<input name="category" defaultValue={item?.category ?? ""} maxLength={80} /></label>
          <div className="form-columns">
            <label>{isShop ? "Stock" : "Quantity"}<input name="quantity" type="number" min="0" max={Number.MAX_SAFE_INTEGER} step="1" defaultValue={item?.quantity ?? 1} required /></label>
            <label>Unit weight<input name="unitWeight" type="number" min="0" step="any" defaultValue={item?.unitWeight ?? ""} /></label>
            <label>Weight unit<input name="weightUnit" defaultValue={item?.weightUnit ?? ""} maxLength={20} /></label>
          </div>
          {props.mode === "shop" && <div className="form-columns two-columns">
            <label>Price per item<input name="price" type="number" min="0" max={Number.MAX_SAFE_INTEGER} step="1" defaultValue={props.item?.price ?? 0} required /></label>
            <label>Currency<select name="currency" defaultValue={props.item?.currency ?? "GP"}>{denominations.map(({ code, label }) => <option key={code} value={code}>{label} ({code})</option>)}</select></label>
          </div>}
          <label>Notes<textarea name="notes" defaultValue={item?.notes ?? ""} rows={4} /></label>
        </div>
        <footer className="dialog-footer">
          <button className="text-button" type="button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit">{item ? "Save changes" : isShop ? "Create shop item" : "Add item"}</button>
        </footer>
      </form>
    </Modal>
  );
}
