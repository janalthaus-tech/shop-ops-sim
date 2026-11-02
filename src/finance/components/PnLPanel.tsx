import type { PnL } from '../model/types';
import { formatNum, formatPct, formatUsd } from '../model/format';

interface Props {
  pnl: PnL;
}

function pctOf(amount: number, base: number): number {
  return base > 0 ? (amount / base) * 100 : 0;
}

function moneyWithSales(amount: number, salesPct: number): string {
  return `${formatUsd(amount)} · ${formatPct(salesPct)} sales`;
}

function moneyWithSalesAndCogs(
  amount: number,
  salesPct: number,
  cogsPct: number,
): string {
  return `${formatUsd(amount)} · ${formatPct(salesPct)} sales · ${formatPct(cogsPct)} COGS`;
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={`stmt-row${strong ? ' strong' : ''}${muted ? ' muted' : ''}`}>
      <span>{label}</span>
      <span className="stmt-value">{value}</span>
    </div>
  );
}

export function PnLPanel({ pnl }: Props) {
  const sales = pnl.monthlySales;
  const cogs = pnl.totalCogs;

  return (
    <div className="stmt-panel">
      <section className="card print-block">
        <h2>Monthly P&amp;L</h2>
        <p className="card-note">
          Values show $ · % of sales (and % of COGS on cost lines). Illustrative training-inspired
          metrics — not advice / not a verbatim third-party glossary.
        </p>
        <Row label="ROs / month" value={formatNum(pnl.rosPerMonth, 0)} muted />
        <Row label="Total sales" value={formatUsd(pnl.monthlySales)} strong />
        <Row
          label=" Labor sales"
          value={moneyWithSales(pnl.laborSales, pnl.laborSalesPctOfSales)}
          muted
        />
        <Row
          label=" Parts sales"
          value={moneyWithSales(pnl.partsSales, pnl.partsSalesPctOfSales)}
          muted
        />
        <hr />
        <Row label="Flag hours (labor ÷ rate)" value={formatNum(pnl.flagHours, 0)} muted />
        <Row
          label="Tech payroll (labor COGS)"
          value={moneyWithSalesAndCogs(
            pnl.techPayroll,
            pnl.laborCostPctOfSales,
            pnl.laborPctOfCogs,
          )}
        />
        <Row
          label="Parts COGS"
          value={moneyWithSalesAndCogs(
            pnl.partsCogs,
            pctOf(pnl.partsCogs, sales),
            pctOf(pnl.partsCogs, cogs),
          )}
        />
        <Row
          label="Sublet (parts bucket)"
          value={moneyWithSalesAndCogs(
            pnl.sublet,
            pctOf(pnl.sublet, sales),
            pnl.subletPctOfCogs,
          )}
          muted
        />
        <Row
          label="Shop supplies (parts bucket)"
          value={moneyWithSalesAndCogs(
            pnl.shopSupplies,
            pctOf(pnl.shopSupplies, sales),
            pnl.suppliesPctOfCogs,
          )}
          muted
        />
        <Row
          label="Parts-bucket COGS (parts+sublet+supplies)"
          value={moneyWithSalesAndCogs(
            pnl.partsBucketCogs,
            pnl.partsCostPctOfSales,
            pnl.partsPctOfCogs,
          )}
        />
        <Row
          label="Total COGS"
          value={moneyWithSales(pnl.totalCogs, pctOf(pnl.totalCogs, sales))}
          strong
        />
        <hr />
        <Row
          label="Gross profit"
          value={`${formatUsd(pnl.grossProfit)} · ${formatPct(pnl.grossProfitPct)} sales`}
          strong
        />
        <Row
          label=" Labor GP"
          value={`${formatUsd(pnl.laborGrossProfit)} · ${formatPct(
            pnl.laborSales > 0 ? (pnl.laborGrossProfit / pnl.laborSales) * 100 : 0,
          )} of labor sales`}
          muted
        />
        <Row
          label=" Parts GP"
          value={`${formatUsd(pnl.partsGrossProfit)} · ${formatPct(
            pnl.partsSales > 0 ? (pnl.partsGrossProfit / pnl.partsSales) * 100 : 0,
          )} of parts sales`}
          muted
        />
        <hr />
        <Row
          label="Advisor payroll"
          value={moneyWithSales(pnl.advisorPayroll, pctOf(pnl.advisorPayroll, sales))}
          muted
        />
        <Row
          label="Manager payroll"
          value={moneyWithSales(pnl.managerPayroll, pctOf(pnl.managerPayroll, sales))}
          muted
        />
        <Row
          label="Payroll taxes"
          value={moneyWithSales(pnl.payrollTaxes, pctOf(pnl.payrollTaxes, sales))}
          muted
        />
        <Row
          label="Benefits"
          value={moneyWithSales(pnl.benefits, pctOf(pnl.benefits, sales))}
          muted
        />
        <Row
          label="Overhead"
          value={moneyWithSales(pnl.overhead, pctOf(pnl.overhead, sales))}
          muted
        />
        <Row
          label="Total OpEx"
          value={moneyWithSales(pnl.totalOpEx, pctOf(pnl.totalOpEx, sales))}
          strong
        />
        <hr />
        <Row
          label="Operating income"
          value={moneyWithSales(pnl.operatingIncome, pctOf(pnl.operatingIncome, sales))}
          strong
        />
        <Row
          label="Income tax"
          value={moneyWithSales(pnl.incomeTax, pctOf(pnl.incomeTax, sales))}
          muted
        />
        <Row
          label="Net income"
          value={`${formatUsd(pnl.netIncome)} · ${formatPct(pnl.netMarginPct)} sales`}
          strong
        />
      </section>
    </div>
  );
}
