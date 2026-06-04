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
  assertPositive(number, "frequencia");
  return number * (factors[unit] ?? 1);
}

export function resistanceToOhms(value, unit) {
  const number = Number(value);
  const factors = { ohm: 1, kohm: 1e3 };
  assertPositive(number, "impedancia");
  return number * (factors[unit] ?? 1);
}

export function calculatePiBandPass(centerHz, bandwidthHz, impedanceOhms) {
  assertPositive(centerHz, "frequencia central");
  assertPositive(bandwidthHz, "largura de banda");
  assertPositive(impedanceOhms, "impedancia");

  if (bandwidthHz >= centerHz * 2) {
    throw new Error("A largura de banda deve ser menor que duas vezes a frequencia central.");
  }

  const angularCenter = 2 * Math.PI * centerHz;
  const angularBandwidth = 2 * Math.PI * bandwidthHz;

  return {
    inputShuntCapacitance: 1 / (impedanceOhms * angularBandwidth),
    inputShuntInductance: (impedanceOhms * angularBandwidth) / (angularCenter * angularCenter),
    seriesInductance: (2 * impedanceOhms) / angularBandwidth,
    seriesCapacitance: angularBandwidth / (2 * impedanceOhms * angularCenter * angularCenter),
    outputShuntCapacitance: 1 / (impedanceOhms * angularBandwidth),
    outputShuntInductance: (impedanceOhms * angularBandwidth) / (angularCenter * angularCenter),
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
