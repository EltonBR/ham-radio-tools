const SPEED_OF_LIGHT = 299_792_458;
const DBD_TO_DBI = 2.15;

export const LENGTH_UNITS = {
  meters: { label: "m", factor: 1 },
  centimeters: { label: "cm", factor: 100 },
  millimeters: { label: "mm", factor: 1000 },
};

export function frequencyToHz(value, unit) {
  const number = Number(value);
  const factors = { hz: 1, khz: 1e3, mhz: 1e6, ghz: 1e9 };
  assertPositive(number, "frequencia");
  return number * (factors[unit] ?? 1);
}

export function calculateYagi(
  frequencyHz,
  rodDiameterMm = 10,
  boomDiameterMm = 20,
  directorCount = 1,
  boomIsolated = true,
) {
  assertPositive(frequencyHz, "frequencia");
  assertPositive(rodDiameterMm, "diametro dos elementos");
  assertPositive(boomDiameterMm, "diametro do boom");
  assertIntegerRange(directorCount, 1, 20, "diretores");

  const wavelength = SPEED_OF_LIGHT / frequencyHz;
  const wavelengthMm = wavelength * 1000;
  const rodDiameterRatio = rodDiameterMm / wavelengthMm;
  const boomDiameterRatio = boomDiameterMm / wavelengthMm;
  const boomCorrection = boomIsolated ? 0 : calculateMetalBoomCorrection(wavelength, boomDiameterRatio);

  const drivenElement = wavelength * 0.475;
  const reflectorLength = drivenElement * 1.05 + boomCorrection;
  const reflectorSpacing = wavelength * 0.2;
  const firstDirectorSpacing = wavelength * 0.15;
  const directorSpacing = wavelength * 0.2;

  const directors = Array.from({ length: directorCount }, (_, index) => {
    const taper = Math.min(index * 0.01, 0.08);
    const lengthFactor = Math.max(0.87, 0.95 - taper);
    const position =
      reflectorSpacing + firstDirectorSpacing + (index === 0 ? 0 : directorSpacing * index);
    const distanceFromPrevious = index === 0 ? firstDirectorSpacing : directorSpacing;

    return {
      label: `Diretor ${index + 1}`,
      length: drivenElement * lengthFactor + boomCorrection,
      position,
      distanceFromPrevious,
    };
  });

  const boomLength = directors.at(-1).position;
  const gainDbd = estimateGainDbd(directorCount, boomLength / wavelength);

  return {
    model: "Rothammel dimensional",
    wavelength,
    wavelengthMm,
    rodDiameterMm,
    boomDiameterMm,
    rodDiameterRatio,
    boomDiameterRatio,
    boomIsolated,
    boomCorrection,
    reflectorLength,
    reflectorPosition: 0,
    drivenElement,
    dipolePosition: reflectorSpacing,
    reflectorSpacing,
    firstDirectorSpacing,
    directorSpacing,
    boomLength,
    gainDbd,
    gainDbi: gainDbd + DBD_TO_DBI,
    isolatorThickness: boomIsolated ? millimetersToMeters(boomDiameterMm / 2) : 0,
    directors,
  };
}

export function formatGainDbd(value) {
  return `${formatNumber(value, 2)} dBd`;
}

export function formatGainDbi(value) {
  return `${formatNumber(value, 2)} dBi`;
}

export function formatRatio(value) {
  return formatNumber(value, 3);
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

function calculateMetalBoomCorrection(wavelength, boomDiameterRatio) {
  const normalized = clamp(boomDiameterRatio / 0.05, 0.2, 1);
  return wavelength * 0.008 * normalized;
}

function estimateGainDbd(directorCount, boomLengthLambda) {
  const baseThreeElementGain = 5.2;
  const directorGain = 10 * Math.log10(1 + Math.max(0, directorCount - 1) * 0.35);
  const boomGain = Math.log10(1 + Math.max(0, boomLengthLambda - 0.35)) * 1.6;
  return baseThreeElementGain + directorGain + boomGain;
}

function millimetersToMeters(value) {
  return value / 1000;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

function assertIntegerRange(value, min, max, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new Error(`Informe ${label} entre ${min} e ${max}.`);
  }
}
