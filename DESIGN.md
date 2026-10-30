---
name: Oyster Atelier
description: Uma chegada editorial e um atelier interativo para explorar o relógio livremente.
colors:
  bg: "#081b16"
  light: "#244c3c"
  ivory: "#f5f2e8"
  gold: "#c9b78c"
  muted: "#adbbb1"
  line: "rgba(212,225,214,.16)"
  panel: "rgba(12,32,25,.85)"
typography:
  display:
    fontFamily: "Cormorant, Georgia, serif"
    fontSize: "clamp(84px, 8vw, 130px)"
    fontWeight: 400
    lineHeight: 0.88
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Cormorant, Georgia, serif"
    fontSize: "49px"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-.025em"
  title:
    fontFamily: "Cormorant, Georgia, serif"
    fontSize: "37px"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-.02em"
  body:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  camera: "6px"
  part: "8px"
  action: "10px"
  inspector: "14px"
  dock: "18px"
  dialog: "20px"
  primary: "30px"
spacing:
  action-gap: "6px"
  part-gap: "12px"
  mobile-inset: "22px"
  dialog-padding: "48px"
components:
  button-primary:
    backgroundColor: "{colors.ivory}"
    textColor: "#153628"
    typography: "{typography.label}"
    rounded: "{rounded.primary}"
    padding: "18px 22px 18px 25px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "#fffdf6"
  button-part:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.part}"
    padding: "11px 12px"
    height: "46px"
  button-part-active:
    backgroundColor: "rgba(187,206,165,.1)"
    textColor: "{colors.ivory}"
  button-part-action:
    backgroundColor: "rgba(9,26,20,.3)"
    textColor: "#d4ddcf"
    rounded: "{rounded.action}"
    height: "63px"
  nav-item:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: "14px 0"
  nav-item-active:
    textColor: "{colors.ivory}"
  explosion-control:
    textColor: "#b5c6b3"
  guide-dialog:
    backgroundColor: "#10291f"
    textColor: "{colors.ivory}"
    rounded: "{rounded.dialog}"
    padding: "{spacing.dialog-padding}"
---

# Design System: Oyster Atelier

## Overview

**Creative North Star: "O atelier da luz"**

Oyster Atelier aproxima a presença editorial de uma fotografia de produto da liberdade de uma bancada de exploração. O verde profundo envolve o relógio; luz metálica, títulos serifados e controles discretos mantêm o objeto como protagonista. O novo sistema substitui a composição anterior por autorização expressa de redesenho completo. A direção atual está registrada em .impeccable/surfaces/atelier.md; os vídeos anteriores continuam como referências do objeto e do movimento, sem impor o antigo layout.

A interface usa português e torna a exploração concreta: selecionar qualquer uma das sete peças, aproximar a câmera, isolar, mover e recompor. O relógio permanece preto e prateado. O modelo e o mecanismo são reconstruções artísticas, enquanto a galeria apresenta fotografias reais com links de origem. A linguagem visual deve manter essa distinção legível.

**Key Characteristics:**

- Verde esmeralda profundo, marfim luminoso e acentos de champanhe.
- Cormorant editorial com Montserrat funcional, ambas hospedadas localmente.
- Um objeto vivo entre uma chegada cinematográfica e controles de precisão.
- Superfícies arredondadas, regras finas e profundidade tonal.

**The Current Authority Rule.** A implementação atual e o contrato do atelier definem o novo sistema; não restaurar a antiga composição de tela única como autoridade visual.

## Colors

As cores normativas acima correspondem às propriedades reutilizáveis de src/style.css. Tons locais de gradiente, texto e estados complementam esses fundamentos sem criar outra paleta global.

### Primary

- **Champanhe:** indicadores de seleção, ícones, valores de ajuste, progresso e foco visível. O botão principal usa marfim para se destacar do ambiente verde.

### Secondary

- **Verde iluminado:** referência cromática para a luz ambiente e as camadas verdes do palco; não é uma cor de texto.

### Neutral

- **Esmeralda profundo:** fundo do documento e base da cena.
- **Marfim:** títulos, conteúdo principal e superfícies de ação clara.
- **Sálvia:** navegação e controles em repouso.
- **Linha translúcida:** separadores e limites de controles.
- **Painel escuro:** referência de superfície para camadas sobre a cena; o dock e o inspetor usam tratamentos específicos.

**The Object Palette Rule.** A paleta física do relógio é independente dos tokens da interface. Aço, mostrador preto, rubis e elementos do mecanismo pertencem aos materiais 3D e não devem ser catalogados como cores globais de UI.

## Typography

Cormorant e Montserrat são fontes TTF locais, declaradas apenas no peso regular (400), com font-display: swap e síntese de peso desativada. Georgia é a alternativa serifada e a fonte do wordmark, cujo peso próprio é (600).

O título de chegada usa o papel display do frontmatter. No desktop compacto ele mede (93px), no celular (74px), em até (390px) mede (66px), e em telas de pelo menos (1700px) mede (145px). A galeria usa headline (49px), o inspetor desktop usa title (37px) e o guia usa título de (44px). O inspetor compacto móvel usa (27px).

A introdução usa corpo de (16px) com entrelinha (1.7); o inspetor usa (12px) com entrelinha (1.8), e o guia usa (12–13px). Navegação desktop e dock usam (12px). Rótulos auxiliares variam conforme o contexto, em geral (9–11px). No celular, a lista de peças usa (11px) e alvos de pelo menos (44px); as ações usam rótulos de (9px) e alvos de (44px). Novos textos longos devem usar escala de leitura, sem adotar tamanhos de legenda.

**The Two Voices Rule.** Usar Cormorant para títulos editoriais e Montserrat para ações, explicações e ajustes; preservar rótulos em português e nomes concretos para as peças.

## Layout

A superfície principal ocupa a altura pequena da viewport e possui altura mínima desktop (730px). Na chegada, o cabeçalho ocupa uma faixa própria, a composição editorial fica à esquerda e o relógio usa o centro e a direita. Na exploração, a lista de peças fica à esquerda, a cena no centro e o inspetor à direita. O dock inferior reúne separação, filme e restauração; presets, iluminação e câmera ficam próximos à cena.

O desktop padrão usa cabeçalho com recuo horizontal de (54px), lista de (166px) e inspetor de (250px). A cena explorável reserva (190px) à esquerda e (290px) à direita. O dock tem largura máxima de (835px), altura de (83px) e recuos de (15px 21px). Em até (1150px), as laterais e a tipografia se ajustam. A partir de (1700px), a composição ganha espaço. Em desktop com altura de até (760px), a altura mínima da superfície passa a (650px).

No celular, até (760px), a altura mínima passa a (790px). As sete peças viram uma faixa horizontal rolável sob o cabeçalho. A cena tem uma área própria acima do inspetor compacto e do dock de duas linhas. O inspetor recolhido tem altura máxima de (165px). “Ajustes” revela descrição e posição, expande o limite para (240px) e eleva a reserva inferior da cena de (350px) para (465px). O topo do inspetor permanece visível enquanto seu conteúdo rola.

A galeria usa fotografia ampla e lista lateral no desktop; no celular, a lista vira uma faixa horizontal sob a imagem. Guia e galeria são diálogos nativos, limitados pela viewport e com rolagem própria.

**The Clear Gesture Rule.** Reservar espaço real para cena, lista, inspetor e dock; ajustes abertos no celular não podem ocupar a área destinada ao relógio.

## Elevation & Depth

A profundidade principal vem do objeto 3D e da iluminação radial verde. A interface usa superfícies escuras translúcidas, bordas discretas e desfoque funcional. O dock recebe sombra ambiente (0 16px 40px rgba(0,0,0,.16)); os diálogos usam separação mais forte (0 25px 100px rgba(0,0,0,.5)) e fundo escurecido com desfoque. Uma vinheta interna enquadra a cena.

O canvas aparece com transição de opacidade (.9s). Composição e painéis usam transições curtas de opacidade e deslocamento; estados de botão usam (.2s). O filme de montagem dura (12s), pode ser pausado e cede à interação. A preferência por movimento reduzido interrompe reprodução, remove transições CSS e torna os deslocamentos programáticos de câmera imediatos.

## Shapes

As formas arredondadas acompanham a precisão do objeto: chamada principal em cápsula (30px), dock contínuo (18px), diálogos (20px), inspetor móvel (14px) e ações de peça (10px). Botões de lista usam (8px) no desktop e cápsulas no celular. Bordas de um pixel e pequenos indicadores circulares distinguem seleção e foco.

## Components

**Chegada editorial.** Título em duas linhas, texto breve, chamada “Explorar livremente” e acesso ao filme. A ação clara combina texto e seta, eleva-se discretamente no hover e mantém foco visível de champanhe.

**Navegação.** “O relógio”, “Explorar em 3D” e “Os detalhes” usam botões sem fundo. O estado atual ganha marfim e um ponto inferior; o primeiro item é omitido no celular, onde o wordmark leva à apresentação.

**Lista de peças.** Cristal de safira, luneta polida, mostrador, mecanismo, caixa Oyster, pulseira Oyster e fundo da caixa têm botões semânticos com aria-pressed. A seleção também funciona por clique na geometria 3D; clique duplo seleciona e aproxima. A lista oferece a alternativa acessível à seleção por raycast.

**Inspetor.** Material, título e descrição acompanham “Focar”, “Isolar” e “Mover”. Isolar oculta as demais peças e se reverte por “Mostrar tudo”. Mover permite arrastar a peça independentemente em plano paralelo à câmera. “Lateral”, “Altura” e “Profundidade” ajustam offsets entre (-4) e (4), em unidades internas, com passo (0.05); não são milímetros. “Restaurar esta peça” limpa somente esse deslocamento.

**Dock de montagem.** “Desconstruir” e “Recompor” alternam a separação; “Separação das peças” permite qualquer valor de (0–100%). O filme tem reprodução, pausa, continuação e repetição, com progresso de (12s). Restaurar recompõe o objeto, limpa deslocamentos e isolamento e restaura a câmera.

**Câmera e iluminação.** OrbitControls permite órbita de (360°), pan e zoom. Arrastar gira; botão direito ou gesto de dois dedos desloca; roda ou pinça aproxima. Botões e atalhos de teclado oferecem rotação, zoom e restauração. Presets “Frente”, “Perfil” e “Verso” e luzes “Luz de estúdio”, “Luz fria” e “Luz quente” complementam os controles livres.

**Fotografias e guia.** Sete fotografias cobrem três quartos, mostrador frontal, perfil/coroa, verso/fecho, pulseira, detalhe de índice e movimento real. Cada escolha atualiza imagem, descrição e link de origem. As imagens pertencem a seus autores. O guia explica gestos, peças e teclado e declara a natureza independente e ilustrativa do estudo.

**Disponibilidade e acessibilidade.** Durante o preparo, os comandos dependentes do modelo ficam desativados. Se WebGL falhar, a fotografia original substitui o canvas e a galeria continua disponível. Botões, links, campos e detalhes têm foco visível; estados selecionados são expostos semanticamente. A cena aceita setas, mais, menos e Home; no modo Mover, as setas deslocam a peça. Contraste sobre o canvas exige verificação visual e não é garantido apenas pelos tokens.

**The Honest Model Rule.** Descrever o relógio e o mecanismo como reconstruções artísticas; fotografias reais não tornam a geometria um CAD oficial nem uma representação técnica exata do calibre 3230.

## Do's and Don'ts

### Do:

- Do manter o relógio preto e prateado legível contra o ambiente esmeralda.
- Do preservar seleção por lista, foco de teclado e ajustes de três eixos como alternativas aos gestos.
- Do reservar espaço para o objeto ao abrir os ajustes no celular.
- Do preservar fontes locais, links de origem das sete fotografias e a fotografia de fallback.
- Do tratar intro, exploração, guia e galeria como partes do mesmo vocabulário visual.

### Don't:

- Don't restaurar a antiga composição como restrição ao redesenho autorizado.
- Don't transformar cores de materiais 3D em tokens de interface.
- Don't apresentar o modelo como CAD oficial ou engenharia exata da Rolex.
- Don't esconder comandos essenciais atrás de gestos sem alternativa acessível.
