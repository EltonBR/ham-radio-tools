import {
  CAPACITANCE_UNITS,
  RESISTANCE_UNITS,
  calculateLowPassResistance,
  calculateLowPassRc,
  capacitanceToFarads,
  formatScaledUnit,
  frequencyToHz,
  resistanceToOhms,
} from "./low-pass-filter-logic.js";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="./components/low-pass-filter-calculator/low-pass-filter-calculator.css">
  <article class="calculator">
    <header>
      <p>Filtro RC passivo</p>
      <h2>Passa baixa</h2>
    </header>

    <form>
      <label>
        Calcular
        <select name="solveFor">
          <option value="capacitance" selected>Capacitor</option>
          <option value="resistance">Resistor</option>
        </select>
      </label>

      <label>
        Frequencia de corte
        <span class="input-row">
          <input name="cutoff" type="number" min="0" step="1" value="3000">
          <select name="cutoffUnit">
            <option value="hz" selected>Hz</option>
            <option value="khz">kHz</option>
            <option value="mhz">MHz</option>
          </select>
        </span>
      </label>

      <label class="field-resistance">
        Resistencia
        <span class="input-row">
          <input name="resistance" type="number" min="0" step="1" value="1000">
          <select name="resistanceUnit">
            <option value="ohm" selected>ohm</option>
            <option value="kohm">kohm</option>
            <option value="mohm">Mohm</option>
          </select>
        </span>
      </label>

      <label class="field-capacitance is-hidden">
        Capacitancia
        <span class="input-row">
          <input name="capacitance" type="number" min="0" step="0.001" value="100">
          <select name="capacitanceUnit">
            <option value="nf" selected>nF</option>
            <option value="pf">pF</option>
            <option value="uf">uF</option>
            <option value="mf">mF</option>
            <option value="f">F</option>
          </select>
        </span>
      </label>
    </form>

    <section class="circuit">
      <span>Entrada</span>
      <b>R</b>
      <b>C para terra</b>
      <span>Saida</span>
    </section>

    <section class="results" aria-live="polite"></section>
  </article>
`;

class LowPassFilterCalculator extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.form = this.shadowRoot.querySelector("form");
    this.results = this.shadowRoot.querySelector(".results");
    this.resistanceField = this.shadowRoot.querySelector(".field-resistance");
    this.capacitanceField = this.shadowRoot.querySelector(".field-capacitance");
    this.form.addEventListener("input", () => this.renderResults());
    this.form.addEventListener("change", () => this.renderResults());
    this.renderResults();
  }

  renderResults() {
    const data = new FormData(this.form);
    const solveFor = data.get("solveFor");
    this.resistanceField.classList.toggle("is-hidden", solveFor === "resistance");
    this.capacitanceField.classList.toggle("is-hidden", solveFor === "capacitance");

    try {
      const cutoffHz = frequencyToHz(data.get("cutoff"), data.get("cutoffUnit"));
      const result =
        solveFor === "resistance"
          ? calculateLowPassResistance(
              capacitanceToFarads(data.get("capacitance"), data.get("capacitanceUnit")),
              cutoffHz,
            )
          : calculateLowPassRc(
              resistanceToOhms(data.get("resistance"), data.get("resistanceUnit")),
              cutoffHz,
            );
      const mainResult =
        solveFor === "resistance"
          ? resultRow("Resistor calculado", formatScaledUnit(result.resistance, RESISTANCE_UNITS))
          : resultRow("Capacitor calculado", formatScaledUnit(result.capacitance, CAPACITANCE_UNITS));

      this.results.innerHTML = `
        ${mainResult}
        ${resultRow("Topologia", "R em serie, C em paralelo")}
        ${resultRow("Ordem", "1a ordem, -20 dB/dec")}
      `;
    } catch (error) {
      this.results.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

function resultRow(label, value) {
  return `<div class="result-row"><span>${label}</span><strong>${value}</strong></div>`;
}

customElements.define("low-pass-filter-calculator", LowPassFilterCalculator);
