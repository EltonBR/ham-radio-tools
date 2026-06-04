const SPEED_OF_LIGHT = 299_792_458;

export const LENGTH_UNITS = {
  meters: { label: "m", factor: 1 },
  centimeters: { label: "cm", factor: 100 },
};

export function frequencyToHz(value, unit) {
  const number = Number(value);
  const factors = { hz: 1, khz: 1e3, mhz: 1e6, ghz: 1e9 };
  assertPositive(number, "frequencia");
  return number * (factors[unit] ?? 1);
}

export function lengthToMeters(value, unit) {
  const number = Number(value);
  const factors = { m: 1, cm: 0.01 };
  assertPositive(number, "comprimento");
  if (!Object.hasOwn(factors, unit)) {
    throw new Error("Use apenas unidades metricas para comprimento.");
  }
  return number * factors[unit];
}

export function calculateParabolicAntenna(
  frequencyHz,
  diameterMeters,
  depthMeters,
  efficiencyPercent = 60,
) {
  assertPositive(frequencyHz, "frequencia");
  assertPositive(diameterMeters, "diametro do refletor");
  assertPositive(depthMeters, "profundidade");
  assertRange(efficiencyPercent, 1, 100, "eficiencia");

  if (depthMeters >= diameterMeters / 2) {
    throw new Error("A profundidade deve ser menor que metade do diametro.");
  }

  const wavelength = SPEED_OF_LIGHT / frequencyHz;
  const focalDistance = (diameterMeters * diameterMeters) / (16 * depthMeters);
  const efficiency = efficiencyPercent / 100;
  const gainLinear = efficiency * Math.pow((Math.PI * diameterMeters) / wavelength, 2);
  const gainDbi = 10 * Math.log10(gainLinear);
  const fOverD = focalDistance / diameterMeters;

  return {
    wavelength,
    focalDistance,
    fOverD,
    gainDbi,
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

export function formatGain(value) {
  return `${formatNumber(value, 2)} dBi`;
}

export function formatRatio(value) {
  return formatNumber(value, 3);
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

function assertRange(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`Informe ${label} entre ${min} e ${max}.`);
  }
}
