# Ham Radio Tools

Aplicacao web estatica para calculadoras de radioamadorismo, feita com HTML,
CSS e JavaScript puro. O projeto nao usa framework, bundler nem dependencias de
runtime. Cada calculadora e um Web Component independente, com regra de negocio
isolada na propria pasta.

## Como Rodar

Como a aplicacao usa ES Modules, sirva os arquivos por HTTP:

```bash
./start.sh
```

Depois acesse:

```text
http://127.0.0.1:8000/
```

Para parar:

```bash
./stop.sh
```

Tambem e possivel mudar host e porta:

```bash
HOST=127.0.0.1 PORT=8010 ./start.sh
PORT=8010 ./stop.sh
```

Qualquer servidor estatico equivalente tambem funciona.

## Escopo

As calculadoras estao organizadas em accordions por categoria.

### Antenas

- Dipolo
- Ground Plane
- Yagi
- Parabolica

### Filtros RC

- Passa baixa RC
- Passa alta RC

### Filtros LC

- Passa baixa LC
- Passa alta LC
- PI passa banda

Todas as entradas de comprimento usam sistema metrico. Pes e polegadas nao sao
permitidos no projeto.

## Recursos de UI

- Header com logo e botao de tema claro/escuro.
- Tema inicial baseado em `prefers-color-scheme`.
- Preferencia de tema persistida em `localStorage`.
- Categorias em accordions nativos com `details` e `summary`.
- Grid responsivo para aproveitar monitores ultrawide.
- Modal de ajuda na calculadora parabolica explicando eficiencia estimada.
- Modal de ajuda na calculadora Yagi explicando frequencia, diametros,
  diretores, boom isolado, isolador minimo e posicao no boom.
- Calculadora Yagi baseada em diretrizes dimensionais classicas popularizadas
  por Karl Rothammel, com diametro dos parasitas, diametro do boom, ganho em
  dBd/dBi e toggle para boom isolado ou metalico nao isolado.

## Assets

```text
assets/schematics/pi-bandpass-filter.png
assets/schematics/yagi-basic-format.svg
```

- `pi-bandpass-filter.png`: imagem de referencia para o filtro PI passa banda.
- `yagi-basic-format.svg`: imagem de referencia para a antena Yagi.

## Estrutura

```text
.
├── assets/
│   └── schematics/
│       ├── pi-bandpass-filter.png
│       └── yagi-basic-format.svg
├── components/
│   ├── dipole-calculator/
│   │   ├── dipole-calculator.css
│   │   ├── dipole-calculator.js
│   │   └── dipole-logic.js
│   ├── ground-plane-calculator/
│   ├── high-pass-filter-calculator/
│   ├── lc-high-pass-filter-calculator/
│   ├── lc-low-pass-filter-calculator/
│   ├── low-pass-filter-calculator/
│   ├── parabolic-calculator/
│   ├── pi-filter-calculator/
│   └── yagi-calculator/
├── js/
│   └── app.js
├── tests/
│   └── calculators.test.mjs
├── index.html
├── package.json
├── start.sh
├── stop.sh
├── styles.css
└── README.md
```

Cada pasta em `components/` segue o mesmo padrao:

- `*-calculator.js`: Web Component, template HTML, eventos e renderizacao.
- `*-calculator.css`: estilo isolado no Shadow DOM.
- `*-logic.js`: regra de negocio, conversoes e formatacao.

## Arquitetura

### `index.html`

Define a estrutura da aplicacao:

- header com logo e toggle de tema;
- texto introdutorio curto;
- accordions por categoria;
- tags dos Web Components.

### `js/app.js`

Responsavel por:

- importar todos os Web Components;
- configurar o tema inicial;
- alternar entre tema claro e escuro;
- persistir a escolha do usuario em `localStorage`.

### Web Components

Cada calculadora registra seu custom element com `customElements.define`.
O componente cria Shadow DOM, importa seu CSS local e recalcula resultados a
cada alteracao no formulario.

Fluxo geral:

```text
input do usuario
  -> FormData no componente
  -> conversao de unidades no arquivo logic
  -> calculo
  -> formatacao
  -> renderizacao dos resultados
```

### CSS

`styles.css` contem:

- tokens globais de tema;
- layout principal;
- header;
- accordions;
- grid responsivo.

Os componentes herdam variaveis CSS globais como `--panel`, `--text`, `--line`,
`--accent` e `--shadow`, mas mantem regras visuais locais no Shadow DOM.

## Regras de Implementacao

- Nao usar bibliotecas externas.
- Nao centralizar formulas em um modulo global.
- Toda regra de negocio deve ficar no `*-logic.js` da propria calculadora.
- Toda calculadora deve ter teste unitario cobrindo seu calculo principal.
- Unidades de comprimento devem ser metricas.

## Notas de Calculo

- Yagi: usa diretrizes dimensionais classicas de Yagi-Uda popularizadas por
  Karl Rothammel: refletor maior que o elemento excitado, diretores
  progressivamente menores e espacamentos em fracoes de lambda. O toggle de
  boom isolado aplica ou remove uma compensacao dimensional simples para boom
  metalico nos elementos parasitas. Quando o boom esta isolado, o resultado
  `Isolador minimo` sugere uma espessura inicial para afastar eletricamente os
  parasitas do boom, usando metade do diametro do boom como referencia pratica.
- Ground Plane: usa 4 radiais fixos. A quantidade fica explicita na interface,
  mas nao e um parametro de calculo.
- Parabolica: diametro e profundidade usam centimetros por padrao; eficiencia
  estimada e explicada no modal de ajuda.

## Adicionando Uma Calculadora

1. Crie `components/nome-da-calculadora/`.
2. Adicione:
   - `nome-da-calculadora.js`
   - `nome-da-calculadora.css`
   - `nome-da-calculadora-logic.js`
3. Registre o custom element no arquivo JS do componente.
4. Importe o componente em `js/app.js`.
5. Adicione a tag no accordion correto em `index.html`.
6. Adicione um teste em `tests/calculators.test.mjs`.

## Testes

Os testes usam apenas `node:assert/strict`.

```bash
npm test
```

Cobertura atual:

- Dipolo
- Ground Plane
- Yagi Rothammel dimensional
- Parabolica
- Passa baixa RC
- Passa alta RC
- Passa baixa LC
- Passa alta LC
- PI passa banda

## Validacao Manual

Para validar sintaxe de um modulo:

```bash
node --check js/app.js
node --check components/pi-filter-calculator/pi-filter-calculator.js
node --check components/pi-filter-calculator/pi-filter-logic.js
```

Repita o mesmo padrao para qualquer componente alterado.
