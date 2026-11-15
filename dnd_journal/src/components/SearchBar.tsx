import { Icon } from "../Icons";

export function SearchBar({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return (
    <label className="search-field">
      <Icon name="search" size={17} />
      <input aria-label={label} placeholder={`${label}...`} value={value} onChange={(event) => onChange(event.currentTarget.value)} />
    </label>
  );
}
