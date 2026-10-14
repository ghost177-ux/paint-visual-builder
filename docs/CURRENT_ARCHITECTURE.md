# Arquitetura atual do Paint Visual Builder

Este documento descreve o estado observado no código do repositório em 2026-10-14. Ele reflete apenas o que foi confirmado no código e aponta explicitamente os pontos não verificados.

## Atualização do estado após implementação do Módulo 1

A implementação concluída no Módulo 1 adicionou ao editor:
- seleção individual e múltipla com Shift;
- movimentação de elementos com mouse e teclado;
- redimensionamento por alças para elementos editáveis;
- duplicação e exclusão de seleção;
- histórico de desfazer/refazer;
- controles de viewport e régua de breakpoints na interface;
- suporte à movimentação de elementos em zoom diferente de 100%;
- base para manutenção do estado geométrico e da seleção sem duplicar deslocamentos entre pai e filho.

As funcionalidades ainda pendentes continuam sendo as dependências explícitas do Módulo 2, em especial a lógica completa de Flexbox/Grid, reparenting, seções hierárquicas e JSON definitivo.

## 1) Tecnologias, bibliotecas e dependências existentes

### Stack principal
- React 19 em ambiente Vite.
- TypeScript.
- TanStack Start + TanStack Router para roteamento e shell da aplicação.
- React Query como provedor de contexto do router.
- Tailwind CSS v4 com `@theme inline` e utilitários customizados em `src/styles.css`.
- Radix UI e componentes de UI shadcn-style em `src/components/ui`.

### Dependências relevantes do projeto
- `@tanstack/react-router` e `@tanstack/react-start` para roteamento e renderização do app.
- `@tanstack/react-query` para gestão de dados assíncronos no contexto do router.
- `react` e `react-dom` em versão 19.
- `vite` e plugins associados para build e dev server.
- `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css` para styling.
- `lucide-react` para ícones usados em toolbar, canvas e painéis.
- `clsx`, `tailwind-merge`, `class-variance-authority` para composição de classes CSS.
- `zod`, `react-hook-form`, `@hookform/resolvers` para formulários (presentes no ecossistema, mas não demonstrados no editor atual).
- `date-fns` e outros pacotes da biblioteca UI (`embla-carousel-react`, `cmdk`, `vaul`, `recharts`, `react-day-picker`) aparecem no `package.json`, mas não há evidência, no código do editor, de uso direto em `Paint Visual Builder`.
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` para testes automatizados.

### Observações sobre o ambiente
- O `bun.lock` existe, mas os scripts do projeto usam Vite/Node e são compatíveis com npm; o código não mostra um wrapper de ambiente específico do Bun.
- A configuração do Vite (`vite.config.ts`) referencia `@lovable.dev/vite-tanstack-config`, indicando que o projeto foi gerado ou ajustado com suporte do Lovable.
- O app usa um shell SSR customizado em `src/server.ts` e `src/start.ts` para tratamento de erros em servidor.

### Ponto não verificado
- Não foi possível confirmar se há backend, APIs, persistência em banco ou autenticação, porque o código atual não inclui esses módulos nem integrações em runtime.

## 2) Estrutura de pastas e responsabilidades dos componentes

### Estrutura principal
- `src/routes/`: rotas do TanStack Router.
  - `src/routes/__root.tsx`: provedor global de QueryClient, shell HTML e tratamento de erro 404/erro da app.
  - `src/routes/index.tsx`: rota `/` renderizando o editor.
- `src/components/editor/`: lógica e UI do editor visual.
  - `EditorLayout.tsx`: orquestra o documento, seleção, ferramenta ativa, zoom, device mode e abas.
  - `CanvasWorkspace.tsx`: canvas principal, cálculo de coordenadas e interações do mouse.
  - `PropertiesPanel.tsx`: painel lateral de propriedades do elemento selecionado.
  - `LayersPanel.tsx`: listagem de camadas/elementos.
  - `TopToolbar.tsx`: barra superior.
  - `LeftToolbar.tsx`: toolbox lateral.
  - `types.ts`: tipos compartilhados do modelo do editor.
  - `demo-data.ts`: documento inicial usado como dado de demonstração.
  - `EditorLayout.test.tsx`: testes focados no editor.
- `src/components/ui/`: componentes visuais primitivos do design system (Radix + shadcn-style).
- `src/lib/`: utilitários e wrappers de erro.
- `src/test/`: testes de roteamento e setup do ambiente de testes.
- `src/hooks/`: hook `use-mobile.tsx` (não demonstrado no editor atual).
- `src/styles.css`: design tokens, tema e utilitários do editor (`editor-grid`, `editor-page`, `editor-tool`, etc.).

### Responsabilidades de alto nível
- `EditorLayout` é o único componente que centraliza o estado do documento.
- `CanvasWorkspace` atua como camada de interação direta com o mouse e com o viewport do canvas.
- `PropertiesPanel` traduz o elemento selecionado em campos de edição, mas ainda atua principalmente para tipos `rectangle`.
- `LayersPanel` funciona como lista de itens e seleção por clique.
- `TopToolbar` e `LeftToolbar` fornecem o shell de comandos; vários botões existem visivelmente, mas nem todos têm lógica de execução implementada.

## 3) Modelo de dados atual

Os tipos estão em `src/components/editor/types.ts`.

### `ToolId`
`ToolId` define a paleta de ferramentas da interface:
- `select`
- `section`
- `container`
- `text`
- `rectangle`
- `circle`
- `line`
- `polygon`
- `image`
- `icon`
- `button`
- `input`
- `comment`

O comentário do arquivo diz: “Core editor types. Prepared for future drag, resize, layers, comments and JSON I/O.” Isso é um indício claro de preparação para evoluções futuras, mas não de implementação concluída.

### `ElementType`
`ElementType` remove `select` e `comment` de `ToolId` e representa os tipos realmente usados como elementos do documento.

### `EditorElement`
Estrutura confirmada:
- `id: string`
- `type: ElementType`
- `name: string`
- `x: number`
- `y: number`
- `width: number`
- `height: number`
- `fill: string`
- `stroke: string`
- `strokeWidth: number`
- `radius: number`
- `text?: string`
- `fontFamily?: string`
- `fontSize?: number`
- `fontWeight?: number`
- `parentId?: string | null`
- `visible: boolean`
- `locked: boolean`

Observações:
- O modelo foi pensado para suportar elementos hierárquicos (`parentId`), mas a lógica atual não implementa árvore funcional de layers e nesting de elementos.
- `visible` existe e é consultado em `CanvasWorkspace` para esconder elementos.
- `locked` é usado para impedir edição e exclusão em `updateElement` e no handler de Delete.
- `text`, `font*` e `radius` aparecem em elementos `button`, `text`, `circle`, etc., mas nem sempre há suporte de edição completo em todas as ferramentas.

### `EditorComment`
Estrutura:
- `id: string`
- `elementId: string | null`
- `author: string`
- `body: string`
- `createdAt: string`

No código, os comentários são exibidos em `PropertiesPanel` e preenchidos em `demoDocument`, mas não há persistência, criação real de comentários nem integração com backend.

### `EditorDocument`
Estrutura:
- `version: 1`
- `name: string`
- `elements: EditorElement[]`
- `comments: EditorComment[]`

O documento é um array plano de elementos, sem armazenamento em árvore, sem snapshots, sem estado derivado e sem serialização complexa.

### Dados iniciais (`demo-data.ts`)
`demoDocument` cria uma página com elementos de exemplo:
- `hero` (`section`)
- `title` (`text`)
- `cta` (`button`)
- `shape` (`circle`)
- `features` (`container`)

`comments` também são carregados para o elemento `cta`.

## 4) Como funciona o gerenciamento de estado

O projeto não usa Redux, Zustand, Context API especializado para editor, MobX, ou biblioteca de estado global. A estrutura atual é a seguinte:

### Estado local em `EditorLayout`
`EditorLayout` usa `useState` para:
- `doc`: documento atual (`demoDocument` inicial)
- `tool`: ferramenta ativa (`ToolId`)
- `selectedId`: elemento selecionado
- `zoom`: zoom atual em porcentagem
- `device`: `desktop` ou `mobile`
- `tab`: painel ativo (`props` ou `layers`)

### Operações centrais
- `updateElement(id, changes)`: atualiza um elemento do `doc` via `setDoc`, preservando `locked`.
- `createRectangle(x, y)`: cria um `EditorElement` do tipo `rectangle` com posição e tamanho iniciais; seleciona o novo elemento e seta a ferramenta para `select`.
- `selectVisibleLayer(id)`: seleciona somente quando o elemento está `visible`.

### Regras de atualização
- `updateElement` faz `current.elements.map(...)` para atualizar um elemento específico.
- A função respeita `!element.locked` antes de aplicar mudanças.
- A exclusão por teclado também checa `element.type !== "rectangle"` e `element.locked` antes de remover o elemento.

### Estado local de interação por elemento
Em `CanvasWorkspace`, cada `ElementNode` cria um `useRef<Interaction | null>` para rastrear:
- `id`
- posição inicial do ponteiro (`pointerX`, `pointerY`)
- `x`, `y`, `width`, `height` do elemento antes da interação
- `handle` de redimensionamento (`nw`, `ne`, `sw`, `se`) ou `null` para move.

Isso significa que o arrasto/redimensionamento é tratado por estado local de instância em vez de um store global.

### Limitação clara
- Não há sincronização de estado com backend, localStorage, IndexedDB ou servidor.
- O estado volta ao valor inicial ao recarregar a página.

## 5) Como funcionam seleção, criação, movimentação, redimensionamento e exclusão de elementos

### Seleção
- `selectedId` é armazenado em `EditorLayout`.
- `CanvasWorkspace` recebe `selectedId` e `onSelect`.
- O `ElementNode` usa `selected ? "editor-selected" : ...` para renderizar destaque.
- Se o clique for em um elemento, `onSelect(el.id)` é disparado.
- O `onPagePointerDown` do canvas limpa a seleção quando o clique fora do elemento e a ferramenta atual é `select`.

### Criação de retângulos
- `LeftToolbar` define a ferramenta `rectangle`.
- `CanvasWorkspace` detecta clique no canvas quando `tool === "rectangle"`:
  - lê `getBoundingClientRect()` do container
  - calcula `scale = zoom / 100`
  - transforma a posição do clique em coordenadas do canvas `(event.clientX - bounds.left) / scale` e `(event.clientY - bounds.top) / scale`
  - chama `onCreateRectangle(x, y)`
- `createRectangle` cria um objeto com:
  - id gerado por `crypto.randomUUID()`
  - `type: "rectangle"`
  - `name: "Retângulo N"`
  - `x`, `y`, `width: 160`, `height: 100`
  - `fill`, `stroke`, `strokeWidth`, `radius`
  - `visible: true`, `locked: false`, `parentId: null`
- Após criação, escolhe o novo elemento e volta a `tool` para `select`.

### Movimentação
- `ElementNode` usa `startInteraction(event, null)` para iniciar a operação de mover.
- Durante o `pointermove`, a diferença de posição em pixels é convertida em coordenadas do documento:
  - `dx = (event.clientX - start.pointerX) / (zoom / 100)`
  - `dy = (event.clientY - start.pointerY) / (zoom / 100)`
- Em seguida, chama `onUpdate(start.id, { x: start.x + dx, y: start.y + dy })`.
- Isso significa que o movimento é compensado pelo zoom atual.
- O movimento só ocorre se `canEdit` for verdadeiro, e `canEdit` é `el.type === "rectangle" && !el.locked`.

### Redimensionamento
- Um retângulo selecionado mostra `editor-handle` em 4 cantos (`nw`, `ne`, `sw`, `se`).
- `startInteraction(event, handle)` define o identificador do handle e salva o estado inicial do elemento.
- Em `moveInteraction`, a lógica analisa cada handle:
  - `e` / `s`: amplia largura/altura ao mover para a direita/baixo
  - `w` / `n`: reduz largura/altura e ajusta `x`/`y` para manter o canto oposto fixo
  - `Math.max(1, ...)` preserva largura/altura mínima de 1
- O código redimensiona apenas elementos do tipo `rectangle`, com exceção de interações não permitidas para locked elements.

### Exclusão
- O `useEffect` em `EditorLayout` escuta `keydown` global para `Delete` e `Backspace`.
- Se o alvo não for um campo editável (input, textarea, select, contenteditable), verifica se o elemento selecionado existe, é `rectangle` e não está `locked`.
- Caso positivo, remove o elemento do array e zera `selectedId`.
- A lógica não exclui outros tipos de elementos, mesmo com `ToolId` para outros tipos.

### Observações
- Não há suporte confirmado para `section`, `container`, `text`, `button` etc. em criação real e manipulação direta.
- O `Tools` incluem muitas opções visuais, mas o código confirma o uso operacional apenas para `select` e `rectangle`.

## 6) Como o canvas calcula coordenadas e zoom

### Modelo de página
`CanvasWorkspace` usa `PAGE_WIDTH`:
- desktop: `1200`
- mobile: `390`

A página também tem `height: 1100` fixa e foi criada dentro do wrapper com transform de escala `scale(zoom / 100)`.

### Cálculo do zoom
- `zoom` é um número em porcentagem (`useState(70)` no `EditorLayout`).
- O contêiner externo aplica `transform: scale(${zoom / 100})` com `transformOrigin: "top center"`.
- Isso amplia/reduz visualmente tudo dentro do canvas sem alterar o tamanho do modelo lógico do elemento.

### Cálculo de ponteiro e coordenadas do documento
No arrasto e redimensionamento, o código converte distância do ponteiro em coordenadas do documento usando:

```ts
const dx = (event.clientX - start.pointerX) / (zoom / 100);
const dy = (event.clientY - start.pointerY) / (zoom / 100);
```

Isso faz sentido porque o canvas foi escalado visualmente; a operação é invertida para manter as coordenadas lógicas consistentes com o zoom.

### Conversão de clique para criação de retângulo
Quando `tool === "rectangle"` e o usuário clica no canvas:

```ts
const scale = zoom / 100;
onCreateRectangle(
  Math.max(0, (event.clientX - bounds.left) / scale),
  Math.max(0, (event.clientY - bounds.top) / scale),
);
```

O código estabelece a origem no canto superior esquerdo do page, com clamp mínimo em `0`.

### Ponto não verificado
- Não há confirmação de um sistema de coordenadas global, canvas virtual, scroll infinito, sistema de grades-snapping ou regras de snap. O código atual usa uma página fixa de 1200x1100 e zoom simples.

## 7) Como funcionam os painéis de propriedades e camadas

### Painel de propriedades (`PropertiesPanel.tsx`)
Esse componente recebe:
- `element: EditorElement | null`
- `comments: EditorComment[]`
- `onUpdate: (id, changes)`

Se não houver elemento selecionado, renderiza mensagem informativa: “Selecione um elemento no canvas para editar suas propriedades.”

### Estrutura do painel
- Título com nome do elemento e tipo
- Seção “Posição e tamanho”:
  - X, Y, L, A
- Seção “Aparência”:
  - preenchimento (ColorField)
  - borda (ColorField)
  - `Esp.` (strokeWidth)
  - `Raio` (radius)
- Seção “Tipografia”:
  - fonte
  - tamanho e peso
  - botões de alinhamento (visuais, sem lógica real de alinhamento implementada)
- Seção “Comentários”: lista comentários do elemento e input para novo comentário

### Atualização dos valores
- `update = (changes) => onUpdate(element.id, changes)`
- `NumberField` dispara `onChange` usando `event.currentTarget.valueAsNumber`
- `ColorField` aceita um valor hex e converte para uppercase no `onChange`
- `disabled = element.type !== "rectangle" || element.locked`

Isto significa que o painel de propriedades é funcional para `rectangle` e bloqueado para outros tipos e elementos travados.

### Painel de camadas (`LayersPanel.tsx`)
- Lista `elements.map(...)`
- Cada linha mostra ícone por tipo
- Elementos com `parentId` têm recuo (`pl-6`)
- Clique seleciona a camada `onSelect(el.id)`
- `selectedId === el.id` aplica destaque visual
- A interface também mostra ícones de olho e cadeado, mas eles não possuem estado real ou handlers implementados

### Observações importantes
- O código confirma seleção de camadas, porém não há:
  - toggling de visibilidade
  - bloqueio/desbloqueio
  - reorder de layers
  - hierarquia funcional
  - renomeação real do layer
- As opções de ícones e controles no UI parecem ser stubs visuais do editor, e não regras operacionais.

## 8) Funcionalidades implementadas, parcialmente implementadas e ainda não implementadas

### Implementadas
- Shell visual do editor com top bar, left toolbar, canvas e painel lateral.
- Roteamento da página inicial em `/` com metadados.
- Documento de modelo `EditorDocument` com `EditorElement` e `EditorComment`.
- Dados iniciais `demoDocument` com landing page de exemplo.
- Criação de retângulos via ferramenta `Retângulo` no canvas.
- Seleção de elementos pelo clique.
- Movimentação de retângulos com mouse.
- Redimensionamento de retângulos usando 4 handles.
- Atualização de atributos em propriedades (`x`, `y`, `width`, `height`, `fill`, `stroke`, `strokeWidth`, `radius`).
- Exibição e seleção de layers.
- Exibição de comentários associados ao elemento.
- Zoom por porcentagem e switch entre desktop/mobile.
- Deleção por teclado para retângulos não bloqueados.

### Parcialmente implementadas
- `ToolId` inclui muitos tipos de elementos, mas somente a ferramenta `rectangle` tem fluxo operacional real de criação e edição.
- `PropertiesPanel` exibe campos de tipografia, mas os componentes `Field` usam `defaultValue` e não persistem alterações; parecem apenas ilustrativos.
- O painel de comentários tem um input visual, mas não aplica lógica real de adicionar comentário.
- `LayersPanel` mostra botões de olho e bloqueio, mas não há handlers de visibilidade/lock.
- Botões da `TopToolbar` (“Novo”, “Importar JSON”, “Exportar JSON”, “Desfazer”, “Refazer”, “Pré-visualizar”) existem visualmente, mas não têm ações implementadas.
- O painel `LeftToolbar` expõe várias ferramentas, mas a lógica de runtime só responde a `select` e `rectangle` na criação/seleção do canvas.

### Ainda não implementadas (confirmadas como ausentes no código)
- Persistência do documento.
- Importar/exportar JSON funcional.
- Undo/redo real.
- Criação de `section`, `container`, `text`, `circle`, `button`, `input` e outras ferramentas além de `rectangle`.
- Swap de layers / reorder.
- Toggle de visibilidade e bloqueio por camada.
- Sistema de comentários persistente.
- Regras de alinhamento e tipografia editáveis reais.
- Seleção/movimentação/redimensionamento de todos os tipos de elementos.
- Design de canvas multi-page, smart guides, grid snapping, export para HTML/CSS/React.

## 9) Limitações técnicas e possíveis problemas de arquitetura

### Limitações confirmadas
- Estado local simples e não persistente.
- Documento plano sem estrutura de árvore/pai-filho funcional.
- Hub centralizado em `EditorLayout`, que cresce de forma acoplada aos componentes filhos.
- Lógica da interação de arrasto e resize está espalhada em `CanvasWorkspace`/`ElementNode` e aproveita refs locais; isso funciona para a prova de conceito, mas dificulta escalabilidade.
- Muitos comandos visuais existem sem comportamento real.
- `PropertiesPanel` e `LayersPanel` têm estado visual de UI, mas não representam um modelo de edição consistente com regras de negócio do editor.
- O sistema de coordenadas depende de `zoom` e de `transform: scale(...)`, mas não há uma camada de “coordenadas do documento” separada da “coordenadas do viewport”.

### Possíveis problemas de arquitetura
- A ausência de uma camada de modelo/editor abstraída pode tornar difícil evoluir para múltiplos tipos, regras complexas de layout e operações de histórico.
- O desenho com `ElementNode` e `useRef` local é simples, mas pode gerar bugs de sincronização com seleção, arrasto e redimensionamento em elementos múltiplos se forem adicionados novos tipos ou uma lista mais complexa.
- O código usa `crypto.randomUUID()`, o que funciona em browser moderno, mas depende do ambiente de runtime; não há fallback para casos mais antigos.
- O `onKeyDown` global de deleção é sensível ao estado do documento e da seleção, e a ocorrência de vários listeners ou re-renders pode exigir atenção em evoluções maiores.
- O canvas é renderizado com `height: 1100`, mas o código não mostra lógica de scroll para elementos fora do viewport ou paginação de desenho.

### Ponto não verificado
- Não foi possível confirmar como o editor será combinado com backend, exportação, versionamento de documentos ou colaboração em tempo real, porque nenhum desses módulos foi encontrado no código atual.

## 10) Testes automatizados existentes e sua cobertura

### Testes encontrados
1. `src/components/editor/EditorLayout.test.tsx`
   - Verifica criação, edição, movimentação, redimensionamento e exclusão de um retângulo.
   - Usa `@testing-library/react` e `vitest`.
   - Ajusta `getBoundingClientRect()` do canvas para simular viewport de 840x770 e zoom 70%.

2. `src/test/app-routing.test.tsx`
   - Verifica que a rota `/` resolve para uma rota concreta e não cai em `notFound`.

### Cobertura observada
- Cobertura positiva e direta para:
  - ferramenta de retângulo
  - seleção do novo elemento
  - atualização de propriedades (X, Y, L, A, preenchimento, borda, espessura, raio)
  - movimentação do retângulo
  - redimensionamento com handle inferior-direito
  - exclusão por teclado
  - zoom não-100%
- Cobertura limitadíssima para:
  - outros tipos de elementos
  - painel de camadas
  - toolbar superior
  - labels de propriedades e fontes
  - notificações de comentários
  - tool state de `section`, `text`, `button`, `circle`, etc.
  - mobile mode
  - comportamento de visibilidade e lock

### Gaps de testes confirmados
- Não há testes para `LayersPanel`.
- Não há testes para manipulação de elementos diferentes de `rectangle`.
- Não há testes para `PropertiesPanel` com elemento nulo ou tipos bloqueados.
- Não há testes para zoom e device em combinações mais complexas.
- Não há testes de regressão para ações da `TopToolbar` e para critérios de `Delete` nas condições de input/textarea.

## Análise de partes reaproveitáveis na evolução do editor

Há partes do código que têm bom potencial de reutilização e extensão:

### 1. Modelo de tipos centralizado (`types.ts`)
O arquivo `types.ts` é um bom ponto de partida para evoluir o editor, porque já concentra:
- tipos do documento
- tipos de ferramenta
- propriedades do elemento
- modelo de comentários

Esse modelo pode virar um núcleo mais robusto para operações futuras, desde serialização JSON até regras de validação.

### 2. Separação por responsabilidade em `src/components/editor`
A estrutura em componentes isolados facilita a evolução incremental:
- `EditorLayout` como orquestrador
- `CanvasWorkspace` como área de interação
- `PropertiesPanel` e `LayersPanel` como sub-interfaces
- `TopToolbar` e `LeftToolbar` como shell de ferramentas

Essa separação já reduz muito acoplamento direto entre UI e lógica no nível superficial.

### 3. Utilitários de estilo do design system (`styles.css`)
Os utilitários `editor-grid`, `editor-page`, `editor-tool`, `editor-field`, `editor-handle` e `editor-selected` fornecem um conjunto reutilizável de classes de editor. Isso reduz duplicação e cria um código visual consistente para a arquitetura atual.

### 4. Lógica de interação local e testes de DOM
A combinação de `useRef` + `pointerdown/pointermove/pointerup` e os testes renderizados com Testing Library mostram uma base funcional útil para evoluir para outros tipos de interação, desde drag até redimensionamento mais sofisticado.

### 5. Estrutura de demo document com elementos de exemplo
A presença de `demoDocument` ajuda a demonstrar a arquitetura e a validar o editor em ambiente de desenvolvimento sem depender de backend.

### Limitações dessa reaproveitabilidade
- O código atual está mais próximo de um protótipo interativo do que de um editor completo e escalável.
- O modelo de dados e a lógica de interação precisariam ser generalizados para suportar múltiplos tipos, seleção mais rica e operações de histórico, sem depender de regras hardcoded para `rectangle`.

## Diagnóstico resumido

O projeto atual se apresenta como um editor visual de páginas em estágio inicial/funcional de prova de conceito. Ele já entrega uma UI de editor com toolbar, canvas, propriedades e camadas, além de interação real para retângulos. Porém, o conjunto de ferramentas e o modelo de dados foram estruturados como uma base extensível, e a implementação funcional confirma apenas uma parte dessa visão.

As principais evidências são:
- `ToolId` e `EditorElement` foram pensados para muitas ferramentas e recursos mais avançados.
- O estado e a lógica do editor ainda são simples e locais.
- O funcionamento real foi validado principalmente para retângulos.
- Há muitos stubs visuais e ações de UI sem implementação real.
- A ausência de persistência, histórico, import/export e operações mais sofisticadas limita a arquitetura como editor completo.

## Pontos não verificados
- Persistência de arquivos/documentos.
- Backend ou serviços externos.
- Implementação real das outras ferramentas do toolbar.
- Lógica de visibilidade, bloqueio e reorder em camadas.
- Persistência de comentários e modelo colaborativo.
- Mecanismos de serialização JSON ou import/export reais.
- Estrutura de dados para arcos de edição, colaboração ou versionamento.

## Caminho do documento
`docs/CURRENT_ARCHITECTURE.md`
