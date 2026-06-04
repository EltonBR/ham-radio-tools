import {
  LENGTH_UNITS,
  calculateGroundPlane,
  formatScaledUnit,
  frequencyToHz,
} from "./ground-plane-logic.js";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="./components/ground-plane-calculator/ground-plane-calculator.css">
  <article class="calculator">
    <header>
      <p>Antena</p>
      <h2>Ground Plane</h2>
    </header>

    <form>
      <label>
        Frequencia
        <span class="input-row">
          <input name="frequency" type="number" min="0" step="0.001" value="146">
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

      <label>
        Angulo dos radiais
        <span class="range-row">
          <input name="radialAngle" type="range" min="0" max="90" step="5" value="45">
          <output name="radialAngleValue">45 graus</output>
        </span>
      </label>
    </form>

    <section class="results" aria-live="polite"></section>
  </article>
`;

class GroundPlaneCalculator extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.form = this.shadowRoot.querySelector("form");
    this.results = this.shadowRoot.querySelector(".results");
    this.angleOutput = this.shadowRoot.querySelector("[name='radialAngleValue']");
    this.form.addEventListener("input", () => this.renderResults());
    this.form.addEventListener("change", () => this.renderResults());
    this.renderResults();
  }

  renderResults() {
    const data = new FormData(this.form);
    const radialAngle = Number(data.get("radialAngle"));
    this.angleOutput.value = `${radialAngle} graus`;

    try {
      const frequencyHz = frequencyToHz(data.get("frequency"), data.get("frequencyUnit"));
      const result = calculateGroundPlane(
        frequencyHz,
        Number(data.get("velocityFactor")),
        radialAngle,
      );

      this.results.innerHTML = `
        ${resultRow("Comprimento de onda", formatScaledUnit(result.wavelength, LENGTH_UNITS))}
        ${resultRow("Irradiante vertical", formatScaledUnit(result.radiator, LENGTH_UNITS))}
        ${resultRow("Radiais", `${result.radialCount} radiais`)}
        ${resultRow("Cada radial", formatScaledUnit(result.radial, LENGTH_UNITS))}
      `;
    } catch (error) {
      this.results.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

function resultRow(label, value) {
  return `<div class="result-row"><span>${label}</span><strong>${value}</strong></div>`;
}

customElements.define("ground-plane-calculator", GroundPlaneCalculator);
