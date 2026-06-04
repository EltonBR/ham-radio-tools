export const CAPACITANCE_UNITS = {
  farads: { label: "F", factor: 1 },
  millifarads: { label: "mF", factor: 1e3 },
  microfarads: { label: "uF", factor: 1e6 },
  nanofarads: { label: "nF", factor: 1e9 },
  picofarads: { label: "pF", factor: 1e12 },
};

export const RESISTANCE_UNITS = {
  ohms: { label: "ohm", factor: 1 },
  kiloohms: { label: "kohm", factor: 1 / 1e3 },
  megaohms: { label: "Mohm", factor: 1 / 1e6 },
};

export function frequencyToHz(value, unit) {
  const number = Number(value);
  const factors = { hz: 1, khz: 1e3, mhz: 1e6 };
  assertPositive(number, "frequencia de corte");
  return number * (factors[unit] ?? 1);
}

export function resistanceToOhms(value, unit) {
  const number = Number(value);
  const factors = { ohm: 1, kohm: 1e3, mohm: 1e6 };
  assertPositive(number, "resistencia");
  return number * (factors[unit] ?? 1);
}

export function capacitanceToFarads(value, unit) {
  const number = Number(value);
  const divisors = { f: 1, mf: 1e3, uf: 1e6, nf: 1e9, pf: 1e12 };
  assertPositive(number, "capacitancia");
  return number / (divisors[unit] ?? 1);
}

export function calculateHighPassRc(resistanceOhms, cutoffHz) {
  assertPositive(resistanceOhms, "resistencia");
  assertPositive(cutoffHz, "frequencia de corte");

  const capacitance = 1 / (2 * Math.PI * resistanceOhms * cutoffHz);
  return { capacitance };
}

export function calculateHighPassResistance(capacitanceFarads, cutoffHz) {
  assertPositive(capacitanceFarads, "capacitancia");
  assertPositive(cutoffHz, "frequencia de corte");

  const resistance = 1 / (2 * Math.PI * capacitanceFarads * cutoffHz);
  return { resistance };
}

export function formatScaledUnit(value, units, precision = 3) {
  const entries = Object.values(units);
  const best =
    entries.find((unit) => {
      const scaled = Math.abs(value * unit.factor);
      return scaled >= 1 && scaled < 1000;
    }) ?? entries[entries.length - 1];

  return `${formatNumber(value * best.factor, precision)} ${best.label}`;
}

function formatNumber(value, precision = 3) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: precision,
    minimumFractionDigits: 0,
  }).format(value);
}

function assertPositive(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Informe um valor positivo para ${label}.`);
  }
}
