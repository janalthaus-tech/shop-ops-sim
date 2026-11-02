import type { ShopInputs } from '../model/types';
import { NumberField } from './NumberField';

interface Props {
  inputs: ShopInputs;
  setField: <K extends keyof ShopInputs>(key: K, value: ShopInputs[K]) => void;
}

export function InputPanel({ inputs, setField }: Props) {
  return (
    <div className="input-panel">
      <section className="card">
        <h2>Ops / Revenue</h2>
        <div className="field-grid">
          <NumberField label="Bay count" value={inputs.bayCount} min={1} step={1} onChange={(v) => setField('bayCount', v)} />
          <NumberField label="Tech count" value={inputs.techCount} min={0} step={1} onChange={(v) => setField('techCount', v)} />
          <NumberField label="Advisor count" value={inputs.advisorCount} min={0} step={1} onChange={(v) => setField('advisorCount', v)} />
          <NumberField label="Working days / month" value={inputs.workingDaysPerMonth} min={1} max={31} step={1} onChange={(v) => setField('workingDaysPerMonth', v)} />
          <NumberField label="ROs per day" value={inputs.rosPerDay} min={0} step={0.5} onChange={(v) => setField('rosPerDay', v)} hint="Closed repair orders / day" />
          <NumberField label="Average repair order (ARO)" value={inputs.aro} min={0} step={5} prefix="$" onChange={(v) => setField('aro', v)} />
          <NumberField label="Parts mix" value={inputs.partsMixPct} min={0} max={100} step={1} suffix="%" onChange={(v) => setField('partsMixPct', v)} hint="Labor mix auto-adjusts to 100 − parts" />
          <NumberField label="Labor mix" value={inputs.laborMixPct} min={0} max={100} step={1} suffix="%" onChange={(v) => setField('laborMixPct', v)} />
          <NumberField label="Effective labor rate" value={inputs.effectiveLaborRate} min={0} step={1} prefix="$" suffix="/hr" onChange={(v) => setField('effectiveLaborRate', v)} />
          <NumberField label="Door rate (optional)" value={inputs.doorRate} min={0} step={1} prefix="$" suffix="/hr" onChange={(v) => setField('doorRate', v)} hint="0 hides door vs ELR compare on KPIs" />
          <NumberField label="Shop efficiency" value={inputs.shopEfficiencyPct} min={0} max={100} step={1} suffix="%" onChange={(v) => setField('shopEfficiencyPct', v)} hint="Used for KPI bands / clocked hours" />
        </div>
      </section>

      <section className="card">
        <h2>Sales process</h2>
        <div className="field-grid">
          <NumberField
            label="Tech quote multiplier"
            value={inputs.techQuoteMultiplier}
            min={0}
            step={0.1}
            suffix="× ARO"
            onChange={(v) => setField('techQuoteMultiplier', v)}
            hint="TQ = ARO × multiplier (default 2)"
          />
          <NumberField
            label="Close ratio"
            value={inputs.closeRatioPct}
            min={0}
            max={100}
            step={1}
            suffix="%"
            onChange={(v) => setField('closeRatioPct', v)}
            hint="Sold vs quoted (default 50%)"
          />
          <NumberField
            label="New customer %"
            value={inputs.newCustomerPct}
            min={0}
            max={100}
            step={1}
            suffix="%"
            onChange={(v) => setField('newCustomerPct', v)}
            hint="Proxy share of ROs that are new customers (default 30%)"
          />
        </div>
      </section>

      <section className="card">
        <h2>COGS</h2>
        <div className="field-grid">
          <NumberField label="Parts cost % of parts sales" value={inputs.partsCostPctOfPartsSales} min={0} max={100} step={0.5} suffix="%" onChange={(v) => setField('partsCostPctOfPartsSales', v)} />
          <NumberField label="Sublet % of sales" value={inputs.subletPctOfSales} min={0} max={100} step={0.1} suffix="%" onChange={(v) => setField('subletPctOfSales', v)} />
          <NumberField label="Shop supplies % of sales" value={inputs.shopSuppliesPctOfSales} min={0} max={100} step={0.1} suffix="%" onChange={(v) => setField('shopSuppliesPctOfSales', v)} />
        </div>
      </section>

      <section className="card">
        <h2>Payroll</h2>
        <p className="card-note">Tech pay is flag-hour linked: flag hours ≈ labor sales ÷ effective labor rate; tech payroll = flag hours × avg pay per flag hour.</p>
        <div className="field-grid">
          <NumberField label="Avg tech pay / flag hr" value={inputs.avgTechPayPerFlagHr} min={0} step={0.5} prefix="$" onChange={(v) => setField('avgTechPayPerFlagHr', v)} />
          <NumberField label="Advisor salary (each) / mo" value={inputs.advisorSalaryMonthly} min={0} step={100} prefix="$" onChange={(v) => setField('advisorSalaryMonthly', v)} />
          <NumberField label="Manager salary / mo" value={inputs.managerSalaryMonthly} min={0} step={100} prefix="$" onChange={(v) => setField('managerSalaryMonthly', v)} />
          <NumberField label="Payroll tax" value={inputs.payrollTaxPct} min={0} max={100} step={0.5} suffix="%" onChange={(v) => setField('payrollTaxPct', v)} />
          <NumberField label="Benefits % of payroll" value={inputs.benefitsPctOfPayroll} min={0} max={100} step={0.5} suffix="%" onChange={(v) => setField('benefitsPctOfPayroll', v)} />
        </div>
      </section>

      <section className="card">
        <h2>Overhead (monthly)</h2>
        <div className="field-grid">
          <NumberField label="Rent" value={inputs.rent} min={0} step={100} prefix="$" onChange={(v) => setField('rent', v)} />
          <NumberField label="Utilities" value={inputs.utilities} min={0} step={50} prefix="$" onChange={(v) => setField('utilities', v)} />
          <NumberField label="Insurance" value={inputs.insurance} min={0} step={50} prefix="$" onChange={(v) => setField('insurance', v)} />
          <NumberField label="Software" value={inputs.software} min={0} step={25} prefix="$" onChange={(v) => setField('software', v)} />
          <NumberField label="Marketing" value={inputs.marketing} min={0} step={50} prefix="$" onChange={(v) => setField('marketing', v)} />
          <NumberField label="Training" value={inputs.training} min={0} step={25} prefix="$" onChange={(v) => setField('training', v)} />
          <NumberField label="Misc" value={inputs.misc} min={0} step={25} prefix="$" onChange={(v) => setField('misc', v)} />
        </div>
      </section>

      <section className="card">
        <h2>Capital / EBITDA add-backs</h2>
        <div className="field-grid">
          <NumberField
            label="Investment cost"
            value={inputs.investmentCost}
            min={0}
            step={1000}
            prefix="$"
            onChange={(v) => setField('investmentCost', v)}
            hint="0 hides ROI KPI"
          />
          <NumberField
            label="Interest / month"
            value={inputs.interestMonthly}
            min={0}
            step={50}
            prefix="$"
            onChange={(v) => setField('interestMonthly', v)}
          />
          <NumberField
            label="Depreciation / month"
            value={inputs.depreciationMonthly}
            min={0}
            step={50}
            prefix="$"
            onChange={(v) => setField('depreciationMonthly', v)}
          />
        </div>
      </section>

      <section className="card">
        <h2>Acquisition debt (EXAMPLE / illustrative)</h2>
        <p className="card-note">
          SBA often unavailable to non–US citizen / non-PR owners (e.g. L-1B); confirm with lender/counsel. Owner cash EXAMPLE range $150–200k.
        </p>
        <div className="field-grid">
          <NumberField label="Senior debt principal" value={inputs.seniorDebtPrincipal} min={0} step={1000} prefix="$" onChange={(v) => setField('seniorDebtPrincipal', v)} />
          <NumberField label="Senior rate" value={inputs.seniorDebtRatePct} min={0} max={30} step={0.25} suffix="%" onChange={(v) => setField('seniorDebtRatePct', v)} />
          <NumberField label="Senior term (yrs)" value={inputs.seniorDebtTermYears} min={0} step={1} onChange={(v) => setField('seniorDebtTermYears', v)} />
          <NumberField label="Seller note principal" value={inputs.sellerNotePrincipal} min={0} step={1000} prefix="$" onChange={(v) => setField('sellerNotePrincipal', v)} />
          <NumberField label="Seller note rate" value={inputs.sellerNoteRatePct} min={0} max={30} step={0.25} suffix="%" onChange={(v) => setField('sellerNoteRatePct', v)} />
          <NumberField label="Seller note term (yrs)" value={inputs.sellerNoteTermYears} min={0} step={1} onChange={(v) => setField('sellerNoteTermYears', v)} />
          <NumberField label="Owner cash invested" value={inputs.ownerCashInvested} min={0} step={5000} prefix="$" onChange={(v) => setField('ownerCashInvested', v)} hint="Informational" />
          <NumberField label="Distributions / month" value={inputs.distributionsMonthly} min={0} step={500} prefix="$" onChange={(v) => setField('distributionsMonthly', v)} />
          <label className="field">
            <span>SBA available</span>
            <input type="checkbox" checked={inputs.sbaAvailable} onChange={(e) => setField('sbaAvailable', e.target.checked)} />
          </label>
        </div>
      </section>

      <section className="card">
        <h2>Balance sheet starters</h2>
        <div className="field-grid">
          <NumberField label="Opening cash" value={inputs.openingCash} min={0} step={1000} prefix="$" onChange={(v) => setField('openingCash', v)} />
          <NumberField label="AR days" value={inputs.arDays} min={0} step={1} onChange={(v) => setField('arDays', v)} />
          <NumberField label="Parts inventory" value={inputs.inventoryParts} min={0} step={1000} prefix="$" onChange={(v) => setField('inventoryParts', v)} />
          <NumberField label="Equipment (net)" value={inputs.equipmentNet} min={0} step={1000} prefix="$" onChange={(v) => setField('equipmentNet', v)} />
          <NumberField label="AP days" value={inputs.apDays} min={0} step={1} onChange={(v) => setField('apDays', v)} />
          <NumberField label="Other debt (interest-only)" value={inputs.debt} min={0} step={1000} prefix="$" onChange={(v) => setField('debt', v)} />
          <NumberField label="Income tax rate" value={inputs.incomeTaxPct} min={0} max={100} step={1} suffix="%" onChange={(v) => setField('incomeTaxPct', v)} hint="Default 0%; try 21% for a rough corporate placeholder" />
        </div>
      </section>
    </div>
  );
}
