import {
  CAPACITANCE_UNITS,
  INDUCTANCE_UNITS,
  calculatePiBandPass,
  formatScaledUnit,
  frequencyToHz,
  resistanceToOhms,
} from "./pi-filter-logic.js";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="./components/pi-filter-calculator/pi-filter-calculator.css">
  <article class="calculator">
    <header>
      <p>Filtro PI passivo</p>
      <h2>PI passa banda</h2>
    </header>

    <form>
      <label>
        Frequencia central
        <span class="input-row">
          <input name="center" type="number" min="0" step="0.001" value="7.1">
          <select name="centerUnit">
            <option value="mhz" selected>MHz</option>
            <option value="khz">kHz</option>
            <option value="hz">Hz</option>
          </select>
        </span>
      </label>

      <label>
        Largura de banda
        <span class="input-row">
          <input name="bandwidth" type="number" min="0" step="0.1" value="200">
          <select name="bandwidthUnit">
            <option value="khz" selected>kHz</option>
            <option value="hz">Hz</option>
            <option value="mhz">MHz</option>
          </select>
        </span>
      </label>

      <label>
        Impedancia de entrada/saida
        <span class="input-row">
          <input name="impedance" type="number" min="0" step="1" value="50">
          <select name="impedanceUnit">
            <option value="ohm" selected>ohm</option>
            <option value="kohm">kohm</option>
          </select>
        </span>
      </label>
    </form>

    <figure class="schematic">
      <img
        src="./assets/schematics/pi-bandpass-filter.png"
        alt="Esquematico de filtro LC passa-banda em topologia PI"
      >
    </figure>

    <section class="results" aria-live="polite"></section>
  </article>
`;

class PiFilterCalculator extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.form = this.shadowRoot.querySelector("form");
    this.results = this.shadowRoot.querySelector(".results");
    this.form.addEventListener("input", () => this.renderResults());
    this.form.addEventListener("change", () => this.renderResults());
    this.renderResults();
  }

  renderResults() {
    const data = new FormData(this.form);

    try {
      const result = calculatePiBandPass(
        frequencyToHz(data.get("center"), data.get("centerUnit")),
        frequencyToHz(data.get("bandwidth"), data.get("bandwidthUnit")),
        resistanceToOhms(data.get("impedance"), data.get("impedanceUnit")),
      );

      this.results.innerHTML = `
        ${resultRow("L1 shunt entrada", formatScaledUnit(result.inputShuntInductance, INDUCTANCE_UNITS))}
        ${resultRow("C1 shunt entrada", formatScaledUnit(result.inputShuntCapacitance, CAPACITANCE_UNITS))}
        ${resultRow("L2 serie", formatScaledUnit(result.seriesInductance, INDUCTANCE_UNITS))}
        ${resultRow("C2 serie", formatScaledUnit(result.seriesCapacitance, CAPACITANCE_UNITS))}
        ${resultRow("L3 shunt saida", formatScaledUnit(result.outputShuntInductance, INDUCTANCE_UNITS))}
        ${resultRow("C3 shunt saida", formatScaledUnit(result.outputShuntCapacitance, CAPACITANCE_UNITS))}
      `;
    } catch (error) {
      this.results.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

function resultRow(label, value) {
  return `<div class="result-row"><span>${label}</span><strong>${value}</strong></div>`;
}

customElements.define("pi-filter-calculator", PiFilterCalculator);
