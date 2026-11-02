# KPI equations to implement (paraphrased; training-inspired — do NOT paste proprietary tip text)

## Required mix / cost ratios
- Labor sales % of sales, Parts sales % of sales (already from mix)
- Labor cost % of sales = labor COGS (tech payroll) ÷ total sales
- Parts cost % of sales = (parts COGS + sublet + shop supplies) ÷ total sales  [bundle sublet/supplies with parts bucket]
- Labor % of COGS = labor COGS ÷ total COGS
- Parts % of COGS = (parts COGS + sublet + supplies) ÷ total COGS
- Labor GP % of labor sales, Parts GP % of parts sales (already have)
- Optional: Labor GP % and Parts GP % vs total sales

## Shop Fix–style KPIs (compute from model)
Billed/billable hours = existing flagHours (labor sales ÷ ELR).
Clocked hours ≈ billable ÷ (efficiency%/100) when efficiency > 0.

1. Shop Capacity = 8 × bayCount × GSH × workingDaysPerMonth (GSH = sales÷billable hrs)
2. GPD / GP% (existing gross profit)
3. NET / net margin % (existing; band green ≥20% for net margin status)
4. Parts Cost % of sales (goal ≤25% band)
5. Labor Cost % of sales (goal ≤15% band)
6. ARO (input / sales÷ROs)
7. ELR = laborSales ÷ billable hrs (input rate should match; show computed)
8. GPH = GPD ÷ billable hrs
9. Tech Quote (TQ) — need input `quotedWorkPerRo` or `techQuoteMultiplier` (default 2× ARO) → TQ = quoted ÷ ROs
10. Close Ratio — need input `closeRatioPct` OR derive sold/quoted if quoted total known; default editable closeRatioPct 50%; approved work = sales if close applied to quotes: quoted = sales / (CR/100) when CR given
11. GSH = sales ÷ billable hrs
12. TCH = techPayroll ÷ billable hrs
13. ROI — optional input `investmentCost`; ROI = (GPD ÷ investment) × 100 when >0
14. OHCH = overhead ÷ billable hrs
15. NPH = netIncome ÷ billable hrs
16. OH/C = overhead ÷ ROs
17. Marketing Spend % = marketing ÷ sales
18. New Customer % — input `newCustomerPct` (default 30)
19. CAC = marketing ÷ (ROs × newCustomerPct/100) as proxy for new customers/month
20. Days to Outrun Overhead = overhead ÷ (GPD / workingDaysPerMonth)
21. Daily GP Goal = overhead ÷ 15
22. Revenue per Bay (RPB)
23. Revenue per Employee = sales ÷ (techCount + advisorCount + (managerSalary>0?1:0))
24. Tech Efficiency % / Productivity % = shopEfficiencyPct (same equation; label both or one with note)
25. EBITDA ≈ netIncome + incomeTax + interest + depreciation — add optional inputs interestMonthly, depreciationMonthly (default 0)

Show % of sales on P&L rows for sales lines and COGS lines; show % of COGS on labor vs parts COGS rows.
