export const INDUCTANCE_UNITS = {
  henrys: { label: "H", factor: 1 },
  millihenrys: { label: "mH", factor: 1e3 },
  microhenrys: { label: "uH", factor: 1e6 },
  nanohenrys: { label: "nH", factor: 1e9 },
};

export const CAPACITANCE_UNITS = {
  farads: { label: "F", factor: 1 },
  millifarads: { label: "mF", factor: 1e3 },
  microfarads: { label: "uF", factor: 1e6 },
  nanofarads: { label: "nF", factor: 1e9 },
  picofarads: { label: "pF", factor: 1e12 },
};

export function frequencyToHz(value, unit) {
  const number = Number(value);
  const factors = { hz: 1, khz: 1e3, mhz: 1e6 };
  assertPositive(number, "frequencia de corte");
  return number * (factors[unit] ?? 1);
}

export function resistanceToOhms(value, unit) {
  const number = Number(value);
  const factors = { ohm: 1, kohm: 1e3 };
  assertPositive(number, "impedancia");
  return number * (factors[unit] ?? 1);
}

export function calculateLcHighPass(cutoffHz, impedanceOhms) {
  assertPositive(cutoffHz, "frequencia de corte");
  assertPositive(impedanceOhms, "impedancia");

  return {
    capacitance: 1 / (Math.PI * cutoffHz * impedanceOhms),
    inductance: impedanceOhms / (Math.PI * cutoffHz),
  };
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
