import {
  CAPACITANCE_UNITS,
  INDUCTANCE_UNITS,
  calculateLcHighPass,
  formatScaledUnit,
  frequencyToHz,
  resistanceToOhms,
} from "./lc-high-pass-filter-logic.js";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="./components/lc-high-pass-filter-calculator/lc-high-pass-filter-calculator.css">
  <article class="calculator">
    <header>
      <p>Filtro LC passivo</p>
      <h2>Passa alta</h2>
    </header>

    <form>
      <label>
        Frequencia de corte
        <span class="input-row">
          <input name="cutoff" type="number" min="0" step="0.001" value="3.5">
          <select name="cutoffUnit">
            <option value="mhz" selected>MHz</option>
            <option value="khz">kHz</option>
            <option value="hz">Hz</option>
          </select>
        </span>
      </label>

      <label>
        Impedancia
        <span class="input-row">
          <input name="impedance" type="number" min="0" step="1" value="50">
          <select name="impedanceUnit">
            <option value="ohm" selected>ohm</option>
            <option value="kohm">kohm</option>
          </select>
        </span>
      </label>
    </form>

    <section class="circuit">
      <span>Entrada</span>
      <b>C serie</b>
      <b>L para terra</b>
      <span>Saida</span>
    </section>

    <section class="results" aria-live="polite"></section>
  </article>
`;

class LcHighPassFilterCalculator extends HTMLElement {
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
      const result = calculateLcHighPass(
        frequencyToHz(data.get("cutoff"), data.get("cutoffUnit")),
        resistanceToOhms(data.get("impedance"), data.get("impedanceUnit")),
      );

      this.results.innerHTML = `
        ${resultRow("Capacitor serie", formatScaledUnit(result.capacitance, CAPACITANCE_UNITS))}
        ${resultRow("Indutor shunt", formatScaledUnit(result.inductance, INDUCTANCE_UNITS))}
        ${resultRow("Resposta", "2a ordem, +40 dB/dec")}
      `;
    } catch (error) {
      this.results.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

function resultRow(label, value) {
  return `<div class="result-row"><span>${label}</span><strong>${value}</strong></div>`;
}

customElements.define("lc-high-pass-filter-calculator", LcHighPassFilterCalculator);
