import assert from "node:assert/strict";

import { calculateDipole, frequencyToHz as dipoleFrequencyToHz } from "../components/dipole-calculator/dipole-logic.js";
import { calculateGroundPlane, frequencyToHz as groundPlaneFrequencyToHz } from "../components/ground-plane-calculator/ground-plane-logic.js";
import { calculateHighPassRc, calculateHighPassResistance } from "../components/high-pass-filter-calculator/high-pass-filter-logic.js";
import { calculateLcHighPass } from "../components/lc-high-pass-filter-calculator/lc-high-pass-filter-logic.js";
import { calculateLcLowPass } from "../components/lc-low-pass-filter-calculator/lc-low-pass-filter-logic.js";
import { calculateLowPassRc, calculateLowPassResistance } from "../components/low-pass-filter-calculator/low-pass-filter-logic.js";
import {
  calculateParabolicAntenna,
  frequencyToHz as parabolicFrequencyToHz,
  lengthToMeters,
} from "../components/parabolic-calculator/parabolic-logic.js";
import { calculatePiBandPass } from "../components/pi-filter-calculator/pi-filter-logic.js";
import { calculateYagi, frequencyToHz as yagiFrequencyToHz } from "../components/yagi-calculator/yagi-logic.js";

const SPEED_OF_LIGHT = 299_792_458;
const tests = [];

test("dipole calculator returns half-wave total length and equal legs", () => {
  const frequencyHz = dipoleFrequencyToHz(146, "mhz");
  const result = calculateDipole(frequencyHz, 0.95);
  const wavelength = SPEED_OF_LIGHT / frequencyHz;
  const expectedTotal = (wavelength / 2) * 0.95;

  approx(result.wavelength, wavelength);
  approx(result.totalLength, expectedTotal);
  approx(result.eachLeg, expectedTotal / 2);
});

test("ground plane calculator returns quarter-wave radiator and four radials", () => {
  const frequencyHz = groundPlaneFrequencyToHz(146, "mhz");
  const result = calculateGroundPlane(frequencyHz, 0.95, 45);
  const wavelength = SPEED_OF_LIGHT / frequencyHz;
  const quarterWave = (wavelength / 4) * 0.95;
  const radialCorrection = 1 + (45 / 90) * 0.04;

  approx(result.radiator, quarterWave);
  approx(result.radial, quarterWave * radialCorrection);
  assert.equal(result.radialCount, 4);
});

test("yagi calculator follows Rothammel dimensional guidelines", () => {
  const frequencyHz = yagiFrequencyToHz(146, "mhz");
  const result = calculateYagi(frequencyHz, 10, 20, 3, true);
  const wavelength = SPEED_OF_LIGHT / frequencyHz;
  const drivenElement = wavelength * 0.475;

  approx(result.wavelength, wavelength);
  approx(result.drivenElement, drivenElement);
  approx(result.reflectorLength, drivenElement * 1.05);
  approx(result.dipolePosition, wavelength * 0.2);
  approx(result.directors[0].length, drivenElement * 0.95);
  approx(result.directors[0].position, wavelength * 0.35);
  approx(result.directors[0].distanceFromPrevious, wavelength * 0.15);
  approx(result.directors[2].length, drivenElement * 0.93);
  approx(result.directors[2].position, wavelength * 0.75);
  approx(result.boomLength, wavelength * 0.75);
  assert.ok(result.gainDbd > 5.2);
});

test("yagi calculator applies metal boom correction when elements are not isolated", () => {
  const frequencyHz = yagiFrequencyToHz(146, "mhz");
  const isolated = calculateYagi(frequencyHz, 10, 20, 1, true);
  const notIsolated = calculateYagi(frequencyHz, 10, 20, 1, false);

  assert.ok(notIsolated.reflectorLength > isolated.reflectorLength);
  assert.ok(notIsolated.directors[0].length > isolated.directors[0].length);
  assert.ok(notIsolated.boomCorrection > 0);
  assert.equal(notIsolated.boomIsolated, false);
});

test("parabolic calculator returns focal distance, F/D, and approximate gain", () => {
  const result = calculateParabolicAntenna(
    parabolicFrequencyToHz(2.4, "ghz"),
    lengthToMeters(0.9, "m"),
    lengthToMeters(0.12, "m"),
    60,
  );
  const wavelength = SPEED_OF_LIGHT / 2.4e9;
  const focalDistance = (0.9 * 0.9) / (16 * 0.12);
  const gainLinear = 0.6 * Math.pow((Math.PI * 0.9) / wavelength, 2);

  approx(result.wavelength, wavelength);
  approx(result.focalDistance, focalDistance);
  approx(result.fOverD, focalDistance / 0.9);
  approx(result.gainDbi, 10 * Math.log10(gainLinear));
});

test("parabolic calculator rejects non-metric length units", () => {
  assert.throws(() => lengthToMeters(1, "ft"), /unidades metricas/);
  assert.throws(() => lengthToMeters(1, "in"), /unidades metricas/);
});

test("low-pass RC calculator solves capacitance and resistance", () => {
  const capacitanceResult = calculateLowPassRc(1000, 3000);
  const expectedCapacitance = 1 / (2 * Math.PI * 1000 * 3000);
  approx(capacitanceResult.capacitance, expectedCapacitance);

  const resistanceResult = calculateLowPassResistance(expectedCapacitance, 3000);
  approx(resistanceResult.resistance, 1000);
});

test("high-pass RC calculator solves capacitance and resistance", () => {
  const capacitanceResult = calculateHighPassRc(1000, 300);
  const expectedCapacitance = 1 / (2 * Math.PI * 1000 * 300);
  approx(capacitanceResult.capacitance, expectedCapacitance);

  const resistanceResult = calculateHighPassResistance(expectedCapacitance, 300);
  approx(resistanceResult.resistance, 1000);
});

test("LC low-pass calculator returns constant-k inductor and capacitor", () => {
  const result = calculateLcLowPass(30e6, 50);

  approx(result.inductance, 50 / (Math.PI * 30e6));
  approx(result.capacitance, 1 / (Math.PI * 30e6 * 50));
});

test("LC high-pass calculator returns constant-k capacitor and inductor", () => {
  const result = calculateLcHighPass(3.5e6, 50);

  approx(result.capacitance, 1 / (Math.PI * 3.5e6 * 50));
  approx(result.inductance, 50 / (Math.PI * 3.5e6));
});

test("PI band-pass calculator returns symmetric shunt sections and series resonator", () => {
  const result = calculatePiBandPass(7.1e6, 200e3, 50);
  const angularCenter = 2 * Math.PI * 7.1e6;
  const angularBandwidth = 2 * Math.PI * 200e3;

  approx(result.inputShuntCapacitance, 1 / (50 * angularBandwidth));
  approx(result.outputShuntCapacitance, result.inputShuntCapacitance);
  approx(result.inputShuntInductance, (50 * angularBandwidth) / (angularCenter * angularCenter));
  approx(result.outputShuntInductance, result.inputShuntInductance);
  approx(result.seriesInductance, (2 * 50) / angularBandwidth);
  approx(result.seriesCapacitance, angularBandwidth / (2 * 50 * angularCenter * angularCenter));
});

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

console.log(`${tests.length} tests passed`);

function test(name, fn) {
  tests.push({ name, fn });
}

function approx(actual, expected, relativeTolerance = 1e-9) {
  const tolerance = Math.max(Math.abs(expected) * relativeTolerance, Number.EPSILON * 16);
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `expected ${actual} to be within ${tolerance} of ${expected}`,
  );
}
