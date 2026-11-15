export function readName(form: HTMLFormElement, data: FormData): string | null {
  const name = String(data.get("name") ?? "").trim();
  const input = form.elements.namedItem("name") as HTMLInputElement;
  input.setCustomValidity(name ? "" : "Enter a name.");
  return form.reportValidity() ? name : null;
}
