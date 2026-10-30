# Oyster Atelier

Experiência local interativa do Rolex Oyster Perpetual, com abertura cinematográfica, exploração livre e referências fotográficas reais.

## Abrir

```powershell
npm install
npm run dev
```

Abra http://127.0.0.1:4173/. Para distribuição, `npm run build`. Para servir o build, encerre o servidor de desenvolvimento e execute `npm run preview`.

## Explorar

- **Explorar livremente:** abre o atelier, com sete componentes selecionáveis.
- **Arrastar:** gira a câmera em torno do relógio. Roda do mouse ou pinça aproxima e afasta; botão direito desloca a câmera.
- **Selecionar:** clique em uma peça no próprio modelo ou na lista. Dois cliques, ou **Focar**, aproximam a câmera dela.
- **Isolar:** mantém somente o componente selecionado visível. Outra seleção mantém a nova peça isolada.
- **Mover:** arraste a peça selecionada independentemente. Em **Ajustar posição**, três controles ajustam lateral, altura e profundidade. No celular, **Ajustes** revela esse painel.
- **Separação das peças:** controle contínuo de 0 a 100%. **Desconstruir / Recompor** alterna os extremos.
- **Frente / Perfil / Verso:** pontos de partida para novos ângulos. A câmera continua livre depois de cada ação.
- **Iluminação:** opções de estúdio, fria e quente.
- **Restaurar:** recompõe câmera e posições. **Restaurar esta peça** afeta apenas o componente selecionado.
- **Ver a montagem:** filme de doze segundos, com pausa e retomada. Interagir interrompe a reprodução.
- **Teclado:** foque o relógio com Tab; as setas giram a câmera, + e − ajustam o zoom, Home restaura. Em Mover, as setas deslocam a peça.

## Referências reais

A galeria **Os detalhes** reúne frente, três quartos, perfil/coroa, verso/fecho, pulseira, índices e movimento. As fotografias foram pesquisadas na [SwissWatchExpo](https://www.swisswatchexpo.com/watches/rolex-oyster-perpetual-41-steel-black-dial-mens-watch-124300-box-card-81693/) e no [Watch Club](https://www.watchclub.com/rolex/oyster-perpetual/124300-box-and-certificate-ref-124300-year-2022). Os arquivos mantêm seus créditos e origem; URLs individuais estão em `public/assets/reference/sources.json`.

O modelo 3D é ilustrativo e não corresponde a CAD oficial ou a uma representação de engenharia do calibre 3230. A fotografia original fornecida é usada como fallback. A iluminação HDR Studio Small 03 é de Greg Zaal / Poly Haven, CC0, distribuída localmente com os créditos. As fontes Cormorant Garamond e Montserrat têm suas licenças OFL incluídas.

## Verificação

- Build de produção aprovado. O bundle Three.js tem aproximadamente 167 kB gzip, com aviso de tamanho acima de 500 kB sem compressão.
- 21 verificações de comportamento aprovadas em Chromium: seleção, separação contínua, posição independente nos três eixos, preservação das outras peças, foco, isolamento, restauração, iluminação, montagem completa com pausa, galeria e guia. Evidência: `evidence/v3-interactions.json`.
- Arraste real pelo mouse confirmado sobre o mecanismo isolado. Teclado e movimento reduzido confirmados no navegador.
- Layout inspecionado em 1440×900 e 390×844. Larguras 375 e 768 verificadas sem rolagem horizontal; telas baixas podem rolar verticalmente.
- Axe: zero violações automáticas e uma checagem de contraste incompleta por gradiente/canvas. Isso não é certificação de acessibilidade.
- Sem WebGL, a fotografia e a galeria continuam disponíveis; controles 3D ficam desabilitados.
- Revisão independente: os três problemas identificados de composição móvel e inicialização foram corrigidos e classificados como resolvidos.

As capturas atuais usam o prefixo `v3-` em `evidence/`. Os arquivos de referência e backups locais não são distribuídos no repositório. Não há uso de API paga.
