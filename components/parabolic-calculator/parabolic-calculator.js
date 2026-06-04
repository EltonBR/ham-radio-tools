import {
  LENGTH_UNITS,
  calculateParabolicAntenna,
  formatGain,
  formatRatio,
  formatScaledUnit,
  frequencyToHz,
  lengthToMeters,
} from "./parabolic-logic.js";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="./components/parabolic-calculator/parabolic-calculator.css">
  <article class="calculator">
    <header>
      <p>Antena</p>
      <h2>Parabolica</h2>
    </header>

    <form>
      <label>
        Frequencia
        <span class="input-row">
          <input name="frequency" type="number" min="0" step="0.001" value="2.4">
          <select name="frequencyUnit">
            <option value="ghz" selected>GHz</option>
            <option value="mhz">MHz</option>
            <option value="khz">kHz</option>
            <option value="hz">Hz</option>
          </select>
        </span>
      </label>

      <label>
        Diametro do refletor
        <span class="input-row">
          <input name="diameter" type="number" min="0" step="0.1" value="90">
          <select name="diameterUnit">
            <option value="cm" selected>cm</option>
            <option value="m">m</option>
          </select>
        </span>
      </label>

      <label>
        Profundidade
        <span class="input-row">
          <input name="depth" type="number" min="0" step="0.1" value="12">
          <select name="depthUnit">
            <option value="cm" selected>cm</option>
            <option value="m">m</option>
          </select>
        </span>
      </label>

      <label>
        <span class="label-heading">
          Eficiencia estimada
          <button class="help-button" type="button" aria-label="Explicar eficiencia estimada">?</button>
        </span>
        <span class="range-row">
          <input name="efficiency" type="range" min="30" max="80" step="1" value="60">
          <output name="efficiencyValue">60%</output>
        </span>
      </label>
    </form>

    <dialog class="efficiency-dialog" aria-labelledby="efficiency-title">
      <div class="modal-header">
        <h3 id="efficiency-title">Eficiencia estimada</h3>
        <button class="modal-close" type="button" aria-label="Fechar">x</button>
      </div>
      <p>
        A eficiencia de abertura ajusta o ganho ideal do prato para perdas reais:
        iluminacao do refletor, spillover, bloqueio do alimentador, casamento e
        precisao da superficie.
      </p>
      <p>
        Em refletores DIY, a espessura so ajuda ate certo ponto. Se a camada
        condutora tiver algumas profundidades de pele na frequencia usada, o
        limitante passa a ser continuidade eletrica, emendas, rugas, oxidacao,
        adesivo e precisao mecanica.
      </p>
      <table>
        <thead>
          <tr>
            <th>Refletor</th>
            <th>Eficiencia pratica</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Chapa metalica solida bem formada</td>
            <td>60-70%</td>
          </tr>
          <tr>
            <td>Aluminio solido ou usinado de alta precisao</td>
            <td>65-75%</td>
          </tr>
          <tr>
            <td>Fita de cobre continua sobre molde rigido</td>
            <td>50-65%</td>
          </tr>
          <tr>
            <td>Fita de aluminio ou folha de aluminio bem sobreposta</td>
            <td>45-60%</td>
          </tr>
          <tr>
            <td>Tela metalica fina adequada a frequencia</td>
            <td>45-60%</td>
          </tr>
          <tr>
            <td>Grade ou malha grossa</td>
            <td>35-50%</td>
          </tr>
          <tr>
            <td>Filme aluminizado muito fino ou mylar metalizado</td>
            <td>20-40%</td>
          </tr>
          <tr>
            <td>Prato pequeno reaproveitado ou deformado</td>
            <td>30-45%</td>
          </tr>
        </tbody>
      </table>
    </dialog>

    <section class="results" aria-live="polite"></section>
  </article>
`;

class ParabolicCalculator extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.form = this.shadowRoot.querySelector("form");
    this.results = this.shadowRoot.querySelector(".results");
    this.efficiencyOutput = this.shadowRoot.querySelector("[name='efficiencyValue']");
    this.dialog = this.shadowRoot.querySelector(".efficiency-dialog");
    this.helpButton = this.shadowRoot.querySelector(".help-button");
    this.closeButton = this.shadowRoot.querySelector(".modal-close");
    this.form.addEventListener("input", () => this.renderResults());
    this.form.addEventListener("change", () => this.renderResults());
    this.helpButton.addEventListener("click", () => this.dialog.showModal());
    this.closeButton.addEventListener("click", () => this.dialog.close());
    this.dialog.addEventListener("click", (event) => {
      if (event.target === this.dialog) this.dialog.close();
    });
    this.renderResults();
  }

  renderResults() {
    const data = new FormData(this.form);
    const efficiency = Number(data.get("efficiency"));
    this.efficiencyOutput.value = `${efficiency}%`;

    try {
      const result = calculateParabolicAntenna(
        frequencyToHz(data.get("frequency"), data.get("frequencyUnit")),
        lengthToMeters(data.get("diameter"), data.get("diameterUnit")),
        lengthToMeters(data.get("depth"), data.get("depthUnit")),
        efficiency,
      );

      this.results.innerHTML = `
        ${resultRow("Comprimento de onda", formatScaledUnit(result.wavelength, LENGTH_UNITS))}
        ${resultRow("Distancia focal", formatScaledUnit(result.focalDistance, LENGTH_UNITS))}
        ${resultRow("Relacao F/D", formatRatio(result.fOverD))}
        ${resultRow("Ganho aproximado", formatGain(result.gainDbi))}
      `;
    } catch (error) {
      this.results.innerHTML = `<p class="error">${error.message}</p>`;
    }
  }
}

function resultRow(label, value) {
  return `<div class="result-row"><span>${label}</span><strong>${value}</strong></div>`;
}

customElements.define("parabolic-calculator", ParabolicCalculator);
