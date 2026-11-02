import type { CalcResult, ShopInputs } from '../model/types';
import { formatNum, formatPct, formatUsd } from '../model/format';

interface Props {
  inputs: ShopInputs;
  result: CalcResult;
}

export function PrintSummary({ inputs, result }: Props) {
  const { pnl, balanceSheet, kpis } = result;
  return (
    <section className="card print-summary print-only">
      <h2>Print summary — Auto Repair Shop Financial Simulator</h2>
      <p className="disclaimer">Illustrative numbers only — not financial, tax, or investment advice.</p>
      <div className="print-grid">
        <div>
          <h3>Shop snapshot</h3>
          <ul>
            <li>{inputs.bayCount} bays · {inputs.techCount} techs · {inputs.advisorCount} advisors</li>
            <li>{formatNum(pnl.rosPerMonth, 0)} ROs/mo @ {formatUsd(inputs.aro)} ARO</li>
            <li>Sales {formatUsd(pnl.monthlySales)} · GP {formatPct(pnl.grossProfitPct)} · Net {formatPct(pnl.netMarginPct)}</li>
          </ul>
        </div>
        <div>
          <h3>Key results</h3>
          <ul>
            <li>Gross profit {formatUsd(pnl.grossProfit)}</li>
            <li>Net income {formatUsd(pnl.netIncome)}</li>
            <li>Cash runway {formatNum(kpis.cashRunwayMonths, 1)} months</li>
            <li>Break-even ≈ {formatUsd(kpis.breakEvenSales)} ({formatNum(kpis.breakEvenRoCount, 0)} ROs)</li>
            <li>Equity plug {formatUsd(balanceSheet.equity)}</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
