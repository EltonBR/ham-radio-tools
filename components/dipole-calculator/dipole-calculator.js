import {
  LENGTH_UNITS,
  calculateDipole,
  formatScaledUnit,
  frequencyToHz,
} from "./dipole-logic.js";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="./components/dipole-calculator/dipole-calculator.css">
  <article class="calculator">
    <header>
      <p>Antena</p>
      <h2>Dipolo</h2>
    </header>

    <form>
      <label>
        Frequencia
        <span class="input-row">
          <input name="frequency" type="number" min="0" step="0.001" value="7.1">
          <select name="frequencyUnit">
            <option value="mhz" selected>MHz</option>
            <option value="khz">kHz</option>
            <option value="hz">Hz</option>
            <option value="ghz">GHz</option>
          </select>
        </span>
      </label>

      <label>
        Fator de velocidade
        <input name="velocityFactor" type="number" min="0.5" max="1" step="0.01" value="0.95">
      </label>
    </form>

    <section class="results" aria-live="polite"></section>
  </article>
`;

class DipoleCalculator extends HTMLElement {
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
      const frequencyHz = frequencyToHz(data.get("frequency"), data.get("frequencyUnit"));
      const result = calculateDipole(frequencyHz, Number(data.get("velocityFactor")));

      this.results.innerHTML = `
        ${resultRow("Comprimento de onda", formatScaledUnit(result.wavelength, LENGTH_UNITS))}
        ${resultRow("Dipolo total", formatScaledUnit(result.totalLength, LENGTH_UNITS))}
        ${resultRow("Cada perna", formatScaledUnit(result.eachLeg, LENGTH_UNITS))}
      `;
    } catch (error) {
      this.results.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

function resultRow(label, value) {
  return `<div class="result-row"><span>${label}</span><strong>${value}</strong></div>`;
}

customElements.define("dipole-calculator", DipoleCalculator);
