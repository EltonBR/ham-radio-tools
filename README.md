# Ham Radio Tools

Aplicacao web estatica para calculadoras de radioamadorismo, feita com HTML,
CSS e JavaScript puro. O projeto nao usa framework, bundler ou dependencias de
runtime: cada calculadora e um Web Component independente.

## Como Rodar

Como a aplicacao usa ES Modules, sirva os arquivos por HTTP:

```bash
busybox httpd -p 0.0.0.0:8000 -h .
```

Depois acesse:

```text
http://127.0.0.1:8000/
```

Tambem funciona com qualquer servidor estatico equivalente.

## Calculadoras

As calculadoras estao organizadas em accordions por categoria:

- `Antenas`
  - Dipolo
  - Ground Plane
  - Yagi
  - Parabolica
- `Filtros RC`
  - Passa baixa RC
  - Passa alta RC
- `Filtros LC`
  - Passa baixa LC
  - Passa alta LC
  - PI passa banda

O filtro PI passa banda usa uma imagem de esquematico salva em
`assets/schematics/pi-bandpass-filter.png`.

A calculadora Yagi usa uma imagem de referencia salva em
`assets/schematics/yagi-basic-format.svg`.

## Estrutura

```text
.
├── assets/
│   └── schematics/
│       └── pi-bandpass-filter.png
├── components/
│   ├── dipole-calculator/
│   │   ├── dipole-calculator.css
│   │   ├── dipole-calculator.js
│   │   └── dipole-logic.js
│   ├── ground-plane-calculator/
│   ├── yagi-calculator/
│   ├── parabolic-calculator/
│   ├── high-pass-filter-calculator/
│   ├── lc-high-pass-filter-calculator/
│   ├── lc-low-pass-filter-calculator/
│   ├── low-pass-filter-calculator/
│   └── pi-filter-calculator/
├── js/
│   └── app.js
├── tests/
│   └── calculators.test.mjs
├── index.html
├── package.json
├── styles.css
└── README.md
```

Cada pasta em `components/` segue o mesmo padrao:

- `nome-calculator.js`: Web Component, template HTML, eventos e renderizacao.
- `nome-calculator.css`: estilo isolado do componente via Shadow DOM.
- `nome-logic.js`: regra de negocio e formatacao dos resultados.

## Arquitetura

### HTML

`index.html` define a estrutura principal:

- header da aplicacao com logo e botao de tema;
- area introdutoria;
- accordions nativos com `details` e `summary`;
- tags dos Web Components.

### JavaScript

`js/app.js` importa todos os componentes e controla o tema claro/escuro.

O tema:

- usa `data-theme` no elemento `html`;
- respeita `prefers-color-scheme` quando nao ha preferencia salva;
- persiste a escolha em `localStorage`.

### Web Components

Cada calculadora registra um custom element com `customElements.define`.
O componente cria seu proprio Shadow DOM, importa seu CSS e escuta eventos do
formulario para recalcular os resultados em tempo real.

Exemplo de fluxo:

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
- layout da aplicacao;
- header;
- accordions;
- grid responsivo.

Os CSS dos componentes usam as variaveis globais (`--panel`, `--text`,
`--line`, etc.) para herdar o tema, mas mantem regras locais no Shadow DOM.

## Padrao Para Adicionar Uma Calculadora

1. Crie uma pasta em `components/nome-da-calculadora/`.
2. Adicione:
   - `nome-da-calculadora.js`
   - `nome-da-calculadora.css`
   - `nome-da-calculadora-logic.js`
3. Registre o custom element no JS do componente.
4. Importe o componente em `js/app.js`.
5. Adicione a tag do componente no accordion correto em `index.html`.

Mantenha a regra de negocio dentro do arquivo `*-logic.js` da propria
calculadora. Nao centralize formulas em um modulo global.

## Validacao

Para rodar os testes unitarios das regras de calculo:

```bash
npm test
```

A suite usa apenas `node:assert/strict`, sem bibliotecas externas.

Para validar sintaxe dos modulos manualmente:

```bash
node --check js/app.js
node --check components/pi-filter-calculator/pi-filter-calculator.js
node --check components/pi-filter-calculator/pi-filter-logic.js
```

Repita o mesmo padrao para qualquer componente alterado.
