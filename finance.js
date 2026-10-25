/**
 * Monetary values are billions of credits; volumeMt is millions of delivered
 * payload tonnes per year, summed over both directions.
 * t=0 is the start of 2222. All payments occur at year end.
 */
export function calculateFinance({
  volumeMt = 100,
  fee = 4000,
  capexTrillion = 2.4,
  variablePerTon = 600,
  fixedBillion = 12,
  renewalBillion = 8,
  discountRate = 0.05,
  constructionYears = 8,
  operatingYears = 60,
} = {}) {
  const inputs = {
    volumeMt, fee, capexTrillion, variablePerTon, fixedBillion,
    renewalBillion, discountRate, constructionYears, operatingYears,
  };
  if (Object.values(inputs).some(value => !Number.isFinite(value))) {
    throw new RangeError("Finance inputs must be finite numbers.");
  }
  if (volumeMt < 0 || fee < 0 || capexTrillion <= 0 ||
      variablePerTon < 0 || fixedBillion < 0 || renewalBillion < 0 ||
      discountRate <= -1 ||
      !Number.isInteger(constructionYears) || constructionYears < 1 ||
      !Number.isInteger(operatingYears) || operatingYears < 1) {
    throw new RangeError("Invalid finance inputs.");
  }

  const capexBillion = capexTrillion * 1000;
  const annualRevenueBillion = volumeMt * fee / 1000;
  const annualVariableBillion = volumeMt * variablePerTon / 1000;
  const annualCashBillion = annualRevenueBillion - annualVariableBillion -
    fixedBillion - renewalBillion;
  const cashflows = [
    0,
    ...Array(constructionYears).fill(-capexBillion / constructionYears),
    ...Array(operatingYears).fill(annualCashBillion),
  ];
  const annuity = (years, rate) => Math.abs(rate) < 1e-12
    ? years
    : -Math.expm1(-years * Math.log1p(rate)) / rate;
  const npvAt = rate => {
    // Horner evaluation includes the explicit t=0 cash flow.
    let value = 0;
    for (let t = cashflows.length - 1; t >= 0; t--) {
      value = value / (1 + rate) + cashflows[t];
    }
    return value;
  };

  let irr = null;
  if (annualCashBillion > 0) {
    let lower = -0.9999;
    let upper = 1;
    while (npvAt(upper) > 0 && upper < 1e6) upper = upper * 2 + 1;
    if (npvAt(lower) > 0 && npvAt(upper) <= 0) {
      for (let i = 0; i < 120; i++) {
        const midpoint = (lower + upper) / 2;
        if (npvAt(midpoint) > 0) lower = midpoint;
        else upper = midpoint;
      }
      irr = (lower + upper) / 2;
    }
  }

  const cumulative = series => {
    let running = 0;
    return series.map(value => (running += value));
  };
  const discountedCashflows = cashflows.map(
    (value, t) => value / (1 + discountRate) ** t
  );
  const cumulativeCash = cumulative(cashflows);
  const cumulativeDiscountedCash = cumulative(discountedCashflows);
  const payback = (series, running) => {
    for (let t = 1; t < series.length; t++) {
      if (running[t - 1] < 0 && running[t] >= -1e-9 && series[t] > 0) {
        return t - 1 + Math.min(1, -running[t - 1] / series[t]);
      }
    }
    return null;
  };

  const capitalPV = capexBillion / constructionYears *
    annuity(constructionYears, discountRate);
  const operationPVFactor = annuity(operatingYears, discountRate) /
    (1 + discountRate) ** constructionYears;
  const marginPerTon = fee - variablePerTon;
  const breakEvenMt = marginPerTon > 0
    ? 1000 * (fixedBillion + renewalBillion +
        capitalPV / operationPVFactor) / marginPerTon
    : null;

  return {
    annualRevenueBillion,
    annualVariableBillion,
    annualCashBillion,
    irr,
    npvBillion: npvAt(discountRate),
    // From project start, with linear interpolation between year-end receipts.
    paybackYears: payback(cashflows, cumulativeCash),
    staticOperatingPaybackYears: annualCashBillion > 0
      ? capexBillion / annualCashBillion : null,
    discountedPaybackYears: payback(discountedCashflows, cumulativeDiscountedCash),
    // NPV=0 threshold including construction timing and the chosen discount rate.
    breakEvenMt,
    operatingBreakEvenMt: marginPerTon > 0
      ? 1000 * (fixedBillion + renewalBillion) / marginPerTon : null,
    cashflows,
    cumulativeCash,
    discountedCashflows,
    cumulativeDiscountedCash,
  };
}

