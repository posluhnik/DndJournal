import { useState } from "react";
import { useJournalState } from "../../lib/journalStore";
import {
	denominations,
	emptyWallet,
	parseWalletDraft,
	walletToDraft,
} from "./currency";
import type { CoinCode, Wallet, WalletDraft } from "./currency";

export function useWallet() {
	const [balances, setBalances] = useJournalState<Wallet>(
		"wallet",
		emptyWallet,
	);
	const [drafts, setDrafts] = useState<WalletDraft>(() =>
		walletToDraft(balances),
	);
	const [error, setError] = useState("");
	const [applied, setApplied] = useState(false);
	const dirty = denominations.some(
		({ code }) => drafts[code] !== String(balances[code]),
	);

	function setDraft(code: CoinCode, value: string) {
		setDrafts((current) => ({ ...current, [code]: value }));
		setError("");
		setApplied(false);
	}

	function adjust(code: CoinCode, delta: number) {
		const current = Number(drafts[code]);
		const value = Number.isSafeInteger(current) ? current : balances[code];
		setDraft(
			code,
			String(Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, value + delta))),
		);
	}

	function apply() {
		const parsed = parseWalletDraft(drafts);
		if (!parsed.ok) {
			setError(parsed.error);
			setApplied(false);
			return;
		}
		setBalances(parsed.wallet);
		setDrafts(walletToDraft(parsed.wallet));
		setError("");
		setApplied(true);
	}

	return { balances, drafts, error, applied, dirty, setDraft, adjust, apply };
}
