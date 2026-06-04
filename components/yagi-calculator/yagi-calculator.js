import {
  LENGTH_UNITS,
  calculateYagi,
  formatGain,
  formatScaledUnit,
  frequencyToHz,
} from "./yagi-logic.js";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="./components/yagi-calculator/yagi-calculator.css">
  <article class="calculator">
    <header>
      <p>Antena</p>
      <h2>Yagi</h2>
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
        Diretores
        <input name="directorCount" type="number" min="1" max="10" step="1" value="1">
      </label>
    </form>

    <figure class="antenna-image">
      <img
        src="./assets/schematics/yagi-basic-format.svg"
        alt="Diagrama basico de uma antena Yagi com refletor, elemento excitado e diretores"
      >
    </figure>

    <section class="results" aria-live="polite"></section>
  </article>
`;

class YagiCalculator extends HTMLElement {
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
      const result = calculateYagi(
        frequencyToHz(data.get("frequency"), data.get("frequencyUnit")),
        Number(data.get("velocityFactor")),
        Number(data.get("directorCount")),
      );
      const directorRows = result.directors
        .map((director) =>
          resultRow(
            `${director.label} / posicao`,
            `${formatScaledUnit(director.length, LENGTH_UNITS)} / ${formatScaledUnit(
              director.position,
              LENGTH_UNITS,
            )}`,
          ),
        )
        .join("");

      this.results.innerHTML = `
        ${resultRow("Comprimento de onda", formatScaledUnit(result.wavelength, LENGTH_UNITS))}
        ${resultRow("Refletor", formatScaledUnit(result.reflector, LENGTH_UNITS))}
        ${resultRow("Elemento excitado", formatScaledUnit(result.drivenElement, LENGTH_UNITS))}
        ${resultRow("Espaco refletor-excitado", formatScaledUnit(result.reflectorSpacing, LENGTH_UNITS))}
        ${resultRow("Espaco entre diretores", formatScaledUnit(result.directorSpacing, LENGTH_UNITS))}
        ${directorRows}
        ${resultRow("Boom estimado", formatScaledUnit(result.boomLength, LENGTH_UNITS))}
        ${resultRow("Ganho estimado", formatGain(result.estimatedGainDbi))}
      `;
    } catch (error) {
      this.results.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

function resultRow(label, value) {
  return `<div class="result-row"><span>${label}</span><strong>${value}</strong></div>`;
}

customElements.define("yagi-calculator", YagiCalculator);
