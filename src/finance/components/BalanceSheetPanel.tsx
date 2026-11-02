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
        <Row label="Cash (opening)" value={formatUsd(bs.cash)} />
        <Row label="Accounts receivable" value={formatUsd(bs.ar)} />
        <Row label="Parts inventory" value={formatUsd(bs.inventory)} />
        <Row label="Equipment (net)" value={formatUsd(bs.equipmentNet)} />
        <Row label="Total assets" value={formatUsd(bs.totalAssets)} strong />
        <hr />
        <h3 className="subhead">Liabilities</h3>
        <Row label="Accounts payable" value={formatUsd(bs.ap)} />
        <Row label="Debt" value={formatUsd(bs.debt)} />
        <Row label="Total liabilities" value={formatUsd(bs.totalLiabilities)} strong />
        <hr />
        <Row label="Equity (plug: Assets − Liabilities)" value={formatUsd(bs.equity)} strong />
        <p className="card-note">
          Implied cash after this month&apos;s NI: <strong>{formatUsd(bs.impliedCashAfterMonth)}</strong>
          {' '}(opening cash + net income). Opening cash stays editable on the Inputs tab; equity is the balancing plug.
        </p>
      </section>
    </div>
  );
}
