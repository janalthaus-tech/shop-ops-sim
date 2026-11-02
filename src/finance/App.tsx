import { useState } from 'react';
import { BalanceSheetPanel } from './components/BalanceSheetPanel';
import { InputPanel } from './components/InputPanel';
import { KpiPanel } from './components/KpiPanel';
import { PnLPanel } from './components/PnLPanel';
import { PrintSummary } from './components/PrintSummary';
import { useInputs } from './hooks/useInputs';
import { formatUsd } from './model/format';
import './finance.css';

type Tab = 'inputs' | 'pnl' | 'bs' | 'kpis';

const TABS: { id: Tab; label: string }[] = [
  { id: 'inputs', label: 'Inputs' },
  { id: 'pnl', label: 'P&L' },
  { id: 'bs', label: 'Balance sheet' },
  { id: 'kpis', label: 'KPIs' },
];

export default function App() {
  const { inputs, setField, resetDefaults, applyStarter, applyBusy, applyAcquisition, result } =
    useInputs();
  const [tab, setTab] = useState<Tab>('inputs');

  return (
    <div className="finance-app"><div className="app">
      <header className="header no-print">
        <div className="header-text">
          <h1>Auto Repair Shop Financial Simulator</h1>
          <p className="tagline">
            Michigan-style 6–8 bay starting point for absentee / independent shop investors.
            Edit inputs → live P&amp;L, balance sheet, and KPIs.
          </p>
          <p className="disclaimer">
            All figures are <strong>illustrative</strong> — not financial, tax, or investment advice.
          </p>
          <p className="disclaimer metrics-note">
            Illustrative training-inspired metrics — not advice / not a verbatim third-party glossary.
          </p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn" onClick={applyStarter}>
            Starter 6-bay
          </button>
          <button type="button" className="btn" onClick={applyBusy}>
            Busy 8-bay
          </button>
          <button type="button" className="btn" onClick={applyAcquisition} title="EXAMPLE / illustrative leased acquisition, SBA off">
            Acquisition EXAMPLE
          </button>
          <button type="button" className="btn btn-ghost" onClick={resetDefaults}>
            Reset defaults
          </button>
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            Print summary
          </button>
        </div>
      </header>

      <div className="snapshot-bar no-print">
        <div>
          <span className="snap-label">Monthly sales</span>
          <strong>{formatUsd(result.pnl.monthlySales)}</strong>
        </div>
        <div>
          <span className="snap-label">Gross profit</span>
          <strong>{formatUsd(result.pnl.grossProfit)}</strong>
        </div>
        <div>
          <span className="snap-label">Net income</span>
          <strong className={result.pnl.netIncome >= 0 ? 'pos' : 'neg'}>
            {formatUsd(result.pnl.netIncome)}
          </strong>
        </div>
        <div>
          <span className="snap-label">ROs / mo</span>
          <strong>{Math.round(result.pnl.rosPerMonth)}</strong>
        </div>
      </div>

      <nav className="tabs no-print" role="tablist" aria-label="Sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main">
        <div className="screen-panels no-print">
          {tab === 'inputs' && <InputPanel inputs={inputs} setField={setField} />}
          {tab === 'pnl' && <PnLPanel pnl={result.pnl} />}
          {tab === 'bs' && <BalanceSheetPanel bs={result.balanceSheet} />}
          {tab === 'kpis' && <KpiPanel result={result} inputs={inputs} />}
        </div>

        <div className="print-only-stack">
          <PrintSummary inputs={inputs} result={result} />
          <PnLPanel pnl={result.pnl} />
          <BalanceSheetPanel bs={result.balanceSheet} />
          <KpiPanel result={result} inputs={inputs} />
        </div>
      </main>

      <footer className="footer no-print">
        <h3>Assumptions (read me)</h3>
        <ul>
          <li>Monthly ROs = ROs/day × working days; sales = ROs × ARO.</li>
          <li>Labor/parts sales split by mix % (normalized if they do not sum to 100).</li>
          <li>
            Flag hours ≈ labor sales ÷ effective labor rate. Tech payroll = flag hours × avg pay per
            flag hour (flag-hour linked model). Efficiency is a capacity/KPI input, not a multiplier
            on pay in this version.
          </li>
          <li>
            Tech payroll is treated as labor COGS for gross profit. Advisors, manager, payroll tax
            &amp; benefits sit in OpEx with overhead.
          </li>
          <li>AR ≈ sales × (AR days / 30). AP ≈ (parts COGS + sublet) × (AP days / 30).</li>
          <li>
            Equity = Assets − Liabilities (balancing plug). Implied cash after month = opening cash +
            NI.
          </li>
          <li>
            KPI color bands are simple heuristics for discussion, not industry standards or
            guarantees (e.g. net often ≥20% green; parts cost often ≤25%; labor cost often ≤15%;
            GP often ~60% store).
          </li>
          <li>
            Parts cost % of sales bundles parts COGS + sublet + shop supplies. Labor cost % uses
            tech payroll (labor COGS).
          </li>
        </ul>
        <p className="footer-meta">
          shop-financial-sim · inputs persist in localStorage · illustrative only
        </p>
      </footer>
    </div></div>
  );
}
