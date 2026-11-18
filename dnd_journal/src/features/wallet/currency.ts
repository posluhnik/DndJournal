export type CoinCode = "PP" | "GP" | "EP" | "SP" | "CP";
export type Wallet = Record<CoinCode, number>;
export type WalletDraft = Record<CoinCode, string>;

export const denominations: { code: CoinCode; label: string }[] = [
	{ code: "PP", label: "Platinum" },
	{ code: "GP", label: "Gold" },
	{ code: "EP", label: "Electrum" },
	{ code: "SP", label: "Silver" },
	{ code: "CP", label: "Copper" },
];

export function emptyWallet(): Wallet {
	return { PP: 0, GP: 0, EP: 0, SP: 0, CP: 0 };
}

export function walletToDraft(wallet: Wallet): WalletDraft {
	return Object.fromEntries(
		denominations.map(({ code }) => [code, String(wallet[code])]),
	) as WalletDraft;
}

export function parseWalletDraft(
	draft: WalletDraft,
): { ok: true; wallet: Wallet } | { ok: false; error: string } {
	const wallet = emptyWallet();
	for (const { code, label } of denominations) {
		const raw = draft[code].trim();
		const value = Number(raw);
		if (!/^\d+$/.test(raw) || !Number.isSafeInteger(value) || value < 0) {
			return {
				ok: false,
				error: `${label} must be a non-negative whole number.`,
			};
		}
		wallet[code] = value;
	}
	return { ok: true, wallet };
}
