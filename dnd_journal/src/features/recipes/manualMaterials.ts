import type { JournalItem, RecipeIngredient } from "../../types";

export type MaterialLine = {
	text: string;
	status: "linked" | "unknown" | "ambiguous" | "invalid";
	message: string;
};

export type ManualMaterials = {
	ingredients: RecipeIngredient[];
	unresolved: string[];
	lines: MaterialLine[];
};

function normalizeName(value: string): string {
	return value
		.normalize("NFC")
		.trim()
		.replace(/\s+/gu, " ")
		.toLocaleLowerCase();
}

export function parseManualMaterials(
	text: string,
	backpack: readonly JournalItem[],
): ManualMaterials {
	const names = new Map<string, JournalItem[]>();
	for (const item of backpack) {
		const key = normalizeName(item.name);
		names.set(key, [...(names.get(key) ?? []), item]);
	}
	const linked = new Map<string, RecipeIngredient>();
	const lines: MaterialLine[] = [];
	const unresolved: string[] = [];

	function unlinked(
		line: string,
		status: "unknown" | "ambiguous" | "invalid",
		message: string,
	) {
		unresolved.push(line);
		lines.push({ text: line, status, message });
	}

	for (const raw of text.split(/\r?\n/u)) {
		const line = raw.trim();
		if (!line) continue;
		const match = /^(\d+)\s*[x×]\s+(.+)$/iu.exec(line);
		if (!match) {
			unlinked(line, "invalid", "Use: quantity x item name");
			continue;
		}
		const quantity = Number(match[1]);
		if (!Number.isSafeInteger(quantity) || quantity < 1) {
			unlinked(line, "invalid", "Use a positive whole quantity");
			continue;
		}
		const candidates = names.get(normalizeName(match[2])) ?? [];
		if (!candidates.length) {
			unlinked(line, "unknown", "Not found in backpack — stays unlinked");
			continue;
		}
		if (candidates.length !== 1) {
			unlinked(
				line,
				"ambiguous",
				"Duplicate backpack name — use New recipe's picker to choose the item",
			);
			continue;
		}
		const source = candidates[0];
		const previous = linked.get(source.id);
		const total = (previous?.quantity ?? 0) + quantity;
		if (!Number.isSafeInteger(total)) {
			unlinked(line, "invalid", "Combined quantity is too large");
			continue;
		}
		linked.set(source.id, {
			itemId: source.id,
			name: source.name,
			category: source.category,
			quantity: total,
		});
		lines.push({
			text: line,
			status: "linked",
			message: `Linked to ${source.name}${source.category ? ` · ${source.category}` : ""}`,
		});
	}

	return { ingredients: [...linked.values()], unresolved, lines };
}
