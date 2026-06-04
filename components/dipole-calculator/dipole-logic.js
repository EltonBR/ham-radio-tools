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

export function calculateDipole(frequencyHz, velocityFactor = 0.95) {
  assertPositive(frequencyHz, "frequencia");
  assertRange(velocityFactor, 0.5, 1, "fator de velocidade");

  const wavelength = SPEED_OF_LIGHT / frequencyHz;
  const totalLength = (wavelength / 2) * velocityFactor;

  return {
    wavelength,
    totalLength,
    eachLeg: totalLength / 2,
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

function assertRange(value, min, max, label) {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`Informe ${label} entre ${min} e ${max}.`);
  }
}
