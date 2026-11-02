import type { ReactNode } from 'react';
import type { CalcResult, ShopInputs, StatusBand } from '../model/types';
import { formatNum, formatPct, formatRatio, formatUsd } from '../model/format';

interface Props {
  result: CalcResult;
  inputs?: ShopInputs;
}

function statusClass(s: StatusBand) {
  if (s === 'neutral') return 'kpi-card';
  return `kpi-card status-${s}`;
}

function KpiCard({
  label,
  value,
  sub,
  status = 'neutral',
}: {
  label: string;
  value: string;
  sub?: string;
  status?: StatusBand;
}) {
  return (
    <div className={statusClass(status)}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {sub ? <div className="kpi-sub">{sub}</div> : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="kpi-section print-block">
      <h3 className="kpi-section-title">{title}</h3>
      <div className="kpi-grid">{children}</div>
    </section>
  );
}

export function KpiPanel({ result, inputs }: Props) {
  const { pnl, kpis, balanceSheet } = result;
  const doorRate = inputs?.doorRate ?? 0;

  return (
    <div className="kpi-panel">
      <p className="card-note kpi-disclaimer">
        Illustrative training-inspired metrics — not advice / not a verbatim third-party glossary.
      </p>

      <Section title="Profitability">
        <KpiCard
          label="GPD (gross profit)"
          value={formatUsd(pnl.grossProfit)}
          sub={`${formatPct(pnl.grossProfitPct)} GP · often ~60% store · ≥60% green`}
          status={kpis.gpStatus}
        />
        <KpiCard
          label="NET"
          value={formatUsd(pnl.netIncome)}
          sub={`${formatPct(pnl.netMarginPct)} net · often ≥20% green`}
          status={kpis.netStatus}
        />
        <KpiCard
          label="Parts cost % sales"
          value={formatPct(kpis.partsCostPctOfSales)}
          sub="Parts+sublet+supplies · often ≤25%"
          status={kpis.partsCostStatus}
        />
        <KpiCard
          label="Labor cost % sales"
          value={formatPct(kpis.laborCostPctOfSales)}
          sub="Tech payroll · often ≤15%"
          status={kpis.laborCostStatus}
        />
        <KpiCard
          label="Labor GP %"
          value={formatPct(kpis.laborGpPct)}
          sub="Of labor sales"
        />
        <KpiCard
          label="Parts GP %"
          value={formatPct(kpis.partsGpPct)}
          sub="Of parts sales"
        />
        <KpiCard
          label="EBITDA"
          value={formatUsd(kpis.ebitda)}
          sub="NI + tax + interest + depreciation"
        />
        {kpis.roiPct != null ? (
          <KpiCard
            label="ROI"
            value={formatPct(kpis.roiPct)}
            sub="GPD ÷ investment × 100"
          />
        ) : null}
      </Section>

      <Section title="Capacity & hours">
        <KpiCard
          label="Shop capacity"
          value={formatUsd(kpis.shopCapacity)}
          sub="8 × bays × GSH × working days"
        />
        <KpiCard
          label="GSH"
          value={formatUsd(kpis.gsh)}
          sub="Sales ÷ billable hours"
        />
        <KpiCard
          label="ELR"
          value={formatUsd(kpis.elr)}
          sub={
            doorRate > 0
              ? `Labor sales ÷ billable hrs · door ${formatUsd(doorRate)}`
              : 'Labor sales ÷ billable hours'
          }
        />
        <KpiCard
          label="GPH"
          value={formatUsd(kpis.gph)}
          sub="GPD ÷ billable hours"
        />
        <KpiCard
          label="TCH"
          value={formatUsd(kpis.tch)}
          sub="Tech payroll ÷ billable hours"
        />
        <KpiCard
          label="Billable hours"
          value={formatNum(kpis.billableHours, 0)}
          sub={`Clocked ≈ ${formatNum(kpis.clockedHours, 0)} @ efficiency`}
        />
        <KpiCard
          label="Efficiency / productivity %"
          value={formatPct(kpis.productivityPct, 0)}
          sub="≥90% green / 80–90% amber"
          status={kpis.efficiencyStatus}
        />
        <KpiCard
          label="RPB (revenue / bay)"
          value={formatUsd(kpis.revenuePerBay)}
          sub="Monthly sales ÷ bays"
        />
      </Section>

      <Section title="Sales process">
        <KpiCard label="ARO" value={formatUsd(kpis.salesPerRo)} sub="Average repair order" />
        <KpiCard
          label="TQ (tech quote)"
          value={formatUsd(kpis.techQuote)}
          sub="ARO × quote multiplier"
        />
        <KpiCard
          label="Close ratio"
          value={formatPct(kpis.closeRatioPct, 0)}
          sub="Editable input (sold vs quoted)"
        />
        <KpiCard
          label="Sales / tech"
          value={formatUsd(kpis.salesPerTech)}
          sub="Monthly"
        />
      </Section>

      <Section title="Overhead & marketing">
        <KpiCard
          label="OHCH"
          value={formatUsd(kpis.ohch)}
          sub="Overhead ÷ billable hours"
        />
        <KpiCard
          label="NPH"
          value={formatUsd(kpis.nph)}
          sub="Net income ÷ billable hours"
        />
        <KpiCard
          label="OH / C"
          value={formatUsd(kpis.ohPerRo)}
          sub="Overhead ÷ ROs"
        />
        <KpiCard
          label="Marketing %"
          value={formatPct(kpis.marketingPctOfSales)}
          sub="Marketing ÷ sales"
        />
        <KpiCard
          label="New customer %"
          value={formatPct(kpis.newCustomerPct, 0)}
          sub="Input · proxy for new RO share"
        />
        <KpiCard
          label="CAC"
          value={formatUsd(kpis.cac)}
          sub="Marketing ÷ (ROs × new customer %)"
        />
        <KpiCard
          label="Days to outrun overhead"
          value={formatNum(kpis.daysToOutrunOverhead, 1)}
          sub="Overhead ÷ (GPD / working days)"
        />
        <KpiCard
          label="Daily GP goal"
          value={formatUsd(kpis.dailyGpGoal)}
          sub="Overhead ÷ 15"
        />
      </Section>

      <Section title="Staffing">
        <KpiCard
          label="Revenue / employee"
          value={formatUsd(kpis.revenuePerEmployee)}
          sub="Sales ÷ (techs + advisors + manager if paid)"
        />
        <KpiCard
          label="Current ratio"
          value={formatRatio(kpis.currentRatio)}
          sub="CA / AP · ≥1.5 green"
          status={kpis.currentRatioStatus}
        />
        <KpiCard
          label="Cash runway"
          value={`${formatNum(kpis.cashRunwayMonths, 1)} mo`}
          sub="Implied cash ÷ (payroll+opex) · ≥3 mo green"
          status={kpis.runwayStatus}
        />
        <KpiCard
          label="Debt / equity"
          value={formatRatio(kpis.debtToEquity)}
          sub={`Equity = ${formatUsd(balanceSheet.equity)}`}
        />
        <KpiCard
          label="Break-even sales"
          value={formatUsd(kpis.breakEvenSales)}
          sub={`≈ ${formatNum(kpis.breakEvenRoCount, 0)} ROs / mo`}
        />
      </Section>
    </div>
  );
}
