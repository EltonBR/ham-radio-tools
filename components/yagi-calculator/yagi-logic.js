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

export function calculateYagi(frequencyHz, velocityFactor = 0.95, directorCount = 1) {
  assertPositive(frequencyHz, "frequencia");
  assertRange(velocityFactor, 0.5, 1, "fator de velocidade");
  assertIntegerRange(directorCount, 1, 10, "diretores");

  const wavelength = SPEED_OF_LIGHT / frequencyHz;
  const drivenElement = (wavelength / 2) * velocityFactor;
  const reflector = drivenElement * 1.05;
  const directorBase = drivenElement * 0.95;
  const reflectorSpacing = wavelength * 0.2;
  const directorSpacing = wavelength * 0.15;

  const directors = Array.from({ length: directorCount }, (_, index) => ({
    label: `Diretor ${index + 1}`,
    length: directorBase * (1 - index * 0.01),
    position: reflectorSpacing + directorSpacing * (index + 1),
  }));

  return {
    wavelength,
    reflector,
    drivenElement,
    reflectorSpacing,
    directorSpacing,
    boomLength: directors.at(-1).position,
    estimatedGainDbi: estimateGainDbi(directorCount),
    directors,
  };
}

export function formatGain(value) {
  return `${formatNumber(value, 1)} dBi`;
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

function assertIntegerRange(value, min, max, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`Informe ${label} entre ${min} e ${max}.`);
  }
}

function estimateGainDbi(directorCount) {
  const elementCount = directorCount + 2;
  const lookup = {
    3: 7.2,
    4: 8.5,
    5: 9.6,
    6: 10.4,
    7: 11.1,
    8: 11.7,
    9: 12.2,
    10: 12.7,
    11: 13.1,
    12: 13.5,
  };

  return lookup[elementCount] ?? 7.2 + Math.log2(elementCount - 2) * 2.1;
}
