import { Icon } from "../../Icons";
import { denominations } from "./currency";
import type { useWallet } from "./useWallet";

export function WalletPanel({
	wallet,
}: {
	wallet: ReturnType<typeof useWallet>;
}) {
	return (
		<section className="wallet-panel panel" aria-labelledby="wallet-title">
			<div className="section-heading">
				<h2 id="wallet-title">Coin pouch</h2>
				<span className="wallet-status" role="status">
					{wallet.applied
						? "Changes applied"
						: wallet.dirty
							? "Pending changes"
							: ""}
				</span>
			</div>
			<div className="wallet-content">
				<div className="coin-grid">
					{denominations.map(({ code, label }) => (
						<div className="coin-cell" key={code}>
							<div className="coin-denomination">
								<span className="coin-outline">{code}</span>
								<span>{label}</span>
							</div>
							<output className="coin-balance" aria-label={`${label} balance`}>
								{wallet.balances[code]}
							</output>
							<div className="coin-controls">
								<button
									type="button"
									aria-label={`Decrease ${label.toLowerCase()} amount`}
									disabled={Number(wallet.drafts[code]) <= 0}
									onClick={() => wallet.adjust(code, -1)}
								>
									<Icon name="minus" size={11} />
								</button>
								<input
									type="number"
									min="0"
									step="1"
									max={Number.MAX_SAFE_INTEGER}
									value={wallet.drafts[code]}
									aria-label={`${label} amount`}
									onChange={(event) =>
										wallet.setDraft(code, event.currentTarget.value)
									}
								/>
								<button
									type="button"
									aria-label={`Increase ${label.toLowerCase()} amount`}
									onClick={() => wallet.adjust(code, 1)}
								>
									<Icon name="plus" size={11} />
								</button>
							</div>
						</div>
					))}
				</div>
				<button
					className="wallet-apply primary-button"
					type="button"
					disabled={!wallet.dirty}
					onClick={wallet.apply}
				>
					Apply changes
				</button>
			</div>
			{wallet.error && (
				<p className="wallet-error" role="alert">
					{wallet.error}
				</p>
			)}
		</section>
	);
}
