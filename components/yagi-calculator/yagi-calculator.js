import {
  LENGTH_UNITS,
  calculateYagi,
  formatGainDbd,
  formatGainDbi,
  formatRatio,
  formatScaledUnit,
  frequencyToHz,
} from "./yagi-logic.js";

const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="./components/yagi-calculator/yagi-calculator.css">
  <article class="calculator">
    <header>
      <p>Antena</p>
      <div class="title-row">
        <h2>Yagi</h2>
        <button class="help-button" type="button" aria-label="Explicar parametros da Yagi">?</button>
      </div>
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
        Diametro dos elementos parasitas
        <span class="input-row">
          <input name="rodDiameter" type="number" min="0.1" step="0.1" value="10">
          <select aria-label="Unidade do diametro dos elementos parasitas" disabled>
            <option>mm</option>
          </select>
        </span>
      </label>

      <label>
        Diametro do boom
        <span class="input-row">
          <input name="boomDiameter" type="number" min="0.1" step="0.1" value="20">
          <select aria-label="Unidade do diametro do boom" disabled>
            <option>mm</option>
          </select>
        </span>
      </label>

      <label>
        Diretores
        <input name="directorCount" type="number" min="1" max="20" step="1" value="1">
      </label>

      <label class="toggle-row">
        <span>Boom isolado dos elementos</span>
        <input name="boomIsolated" type="checkbox" checked>
      </label>
    </form>

    <figure class="antenna-image">
      <img
        src="./assets/schematics/yagi-basic-format.svg"
        alt="Diagrama basico de uma antena Yagi com refletor, elemento excitado e diretores"
      >
    </figure>

    <dialog class="help-dialog" aria-labelledby="yagi-help-title">
      <div class="modal-header">
        <h3 id="yagi-help-title">Parametros da Yagi</h3>
        <button class="modal-close" type="button" aria-label="Fechar">x</button>
      </div>
      <dl>
        <dt>Frequencia</dt>
        <dd>Define o comprimento de onda usado em todos os comprimentos e espacamentos.</dd>
        <dt>Diametro dos elementos parasitas</dt>
        <dd>Diametro fisico do refletor e dos diretores. A relacao d/lambda ajuda a avaliar se os elementos estao finos ou grossos para a frequencia.</dd>
        <dt>Diametro do boom</dt>
        <dd>Usado para mostrar D/lambda e estimar a compensacao quando o boom metalico nao isola os elementos parasitas.</dd>
        <dt>Diretores</dt>
        <dd>Quantidade de elementos depois do elemento excitado. Mais diretores aumentam a diretividade estimada, mas tambem deixam ajuste e construcao mais criticos.</dd>
        <dt>Boom isolado dos elementos</dt>
        <dd>Quando marcado, os parasitas nao fazem contato eletrico com o boom. Quando desmarcado, a calculadora acrescenta uma compensacao simples no comprimento dos parasitas.</dd>
        <dt>Isolador minimo</dt>
        <dd>Espessura minima sugerida para manter os elementos parasitas afastados eletricamente do boom metalico. A estimativa usa metade do diametro do boom como referencia pratica inicial.</dd>
        <dt>Posicao no boom</dt>
        <dd>Distancia medida a partir do refletor, que fica na posicao zero.</dd>
      </dl>
    </dialog>

    <section class="results" aria-live="polite"></section>
  </article>
`;

class YagiCalculator extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" }).append(template.content.cloneNode(true));
    this.form = this.shadowRoot.querySelector("form");
    this.results = this.shadowRoot.querySelector(".results");
    this.dialog = this.shadowRoot.querySelector(".help-dialog");
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

    try {
      const result = calculateYagi(
        frequencyToHz(data.get("frequency"), data.get("frequencyUnit")),
        Number(data.get("rodDiameter")),
        Number(data.get("boomDiameter")),
        Number(data.get("directorCount")),
        data.has("boomIsolated"),
      );
      const directorRows = result.directors
        .map(
          (director) => `
            ${resultRow(`${director.label} - comprimento`, formatScaledUnit(director.length, LENGTH_UNITS))}
            ${resultRow(`${director.label} - posicao no boom`, formatScaledUnit(director.position, LENGTH_UNITS))}
            ${resultRow(`${director.label} - distancia anterior`, formatScaledUnit(director.distanceFromPrevious, LENGTH_UNITS))}
          `,
        )
        .join("");

      this.results.innerHTML = `
        ${resultRow("Modelo", result.model)}
        ${resultRow("Comprimento de onda", formatScaledUnit(result.wavelength, LENGTH_UNITS))}
        ${resultRow("d/lambda", formatRatio(result.rodDiameterRatio))}
        ${resultRow("D/lambda", formatRatio(result.boomDiameterRatio))}
        ${resultRow("Refletor - comprimento", formatScaledUnit(result.reflectorLength, LENGTH_UNITS))}
        ${resultRow("Refletor - posicao no boom", formatScaledUnit(result.reflectorPosition, LENGTH_UNITS))}
        ${resultRow("Elemento excitado - comprimento", formatScaledUnit(result.drivenElement, LENGTH_UNITS))}
        ${resultRow("Elemento excitado - posicao no boom", formatScaledUnit(result.dipolePosition, LENGTH_UNITS))}
        ${directorRows}
        ${resultRow("Boom estimado", formatScaledUnit(result.boomLength, LENGTH_UNITS))}
        ${resultRow("Tipo de boom", result.boomIsolated ? "isolado" : "metalico nao isolado")}
        ${result.boomIsolated
          ? resultRow("Isolador minimo", formatScaledUnit(result.isolatorThickness, LENGTH_UNITS))
          : resultRow("Correcao de boom", `${formatScaledUnit(result.boomCorrection, LENGTH_UNITS)} nos parasitas`)}
        ${resultRow("Ganho estimado", `${formatGainDbd(result.gainDbd)} / ${formatGainDbi(result.gainDbi)}`)}
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
