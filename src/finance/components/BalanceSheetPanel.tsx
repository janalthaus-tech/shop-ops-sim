import type { BalanceSheet } from '../model/types';
import { formatUsd } from '../model/format';

interface Props {
  bs: BalanceSheet;
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className={`stmt-row${strong ? ' strong' : ''}${muted ? ' muted' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function BalanceSheetPanel({ bs }: Props) {
  return (
    <div className="stmt-panel">
      <section className="card print-block">
        <h2>Balance sheet (month-end sketch)</h2>
        <h3 className="subhead">Assets</h3>
        <Row label="Cash (closing)" value={formatUsd(bs.cash)} />
        <Row label="Accounts receivable" value={formatUsd(bs.ar)} />
        <Row label="Parts inventory" value={formatUsd(bs.inventory)} />
        <Row label="Equipment (net)" value={formatUsd(bs.equipmentNet)} />
        {bs.goodwill > 0 && <Row label="Goodwill / intangibles" value={formatUsd(bs.goodwill)} />}
        <Row label="Total assets" value={formatUsd(bs.totalAssets)} strong />
        <hr />
        <h3 className="subhead">Liabilities</h3>
        <Row label="Accounts payable" value={formatUsd(bs.ap)} />
        <Row label="Debt (after principal paid)" value={formatUsd(bs.debt)} />
        <Row label="Total liabilities" value={formatUsd(bs.totalLiabilities)} strong />
        <hr />
        <Row label="Equity (opening + NI − distributions)" value={formatUsd(bs.equity)} strong />
        <Row label="Check: assets − liabilities − equity" value={formatUsd(bs.imbalance)} muted />
        {Math.abs(bs.imbalance) > 1 && (
          <p className="bs-imbalance-badge" role="alert">
            ⚠ Balance sheet out of balance by {formatUsd(bs.imbalance)} — check inputs.
          </p>
        )}
        <p className="card-note">
          Closing cash = opening cash + NI + D&amp;A − ΔAR + ΔAP − principal {formatUsd(bs.principalRepaid)} − distributions{' '}
          {formatUsd(bs.distributions)}. Opening equity {formatUsd(bs.openingEquity)} (opening AR/AP assumed 0).
          Opening equity = opening assets (cash + inventory + equipment + goodwill) − opening debt; it is a plug, so “Owner cash invested” (informational) will not equal BS equity. D&amp;A is netted against Equipment (net) in this sketch, including any goodwill amortization.
        </p>
      </section>
    </div>
  );
}
