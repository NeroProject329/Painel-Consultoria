---
name: Painel de Números
description: Operação de domínios e WhatsApp na linguagem visual do CRM.
colors:
  brand: "#7bffb2"
  brand-2: "#a5ffc9"
  bg: "#07110d"
  surface: "#0c1b14"
  surface-2: "#11271c"
  text: "#ecfff5"
  muted: "#b9d6c5"
  border: "#2a4636"
typography:
  headline:
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontSize: "18px"
    fontWeight: 600
    letterSpacing: "-0.015em"
  body:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "14px"
  label:
    fontSize: "12px"
rounded:
  control: "10px"
  panel: "16px"
  pill: "999px"
spacing:
  small: "8px"
  medium: "16px"
  panel: "20px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.bg}"
    rounded: "{rounded.control}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
  input:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
  badge:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.brand-2}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Painel de Números

## Overview

**Creative North Star: "Operação na linguagem visual do CRM"**

Verdes escuros, acentos menta, texto claro e bordas discretas organizam tarefas reais de administração. A interface mantém densidade moderada e controles explícitos, sem animações de entrada.

A autoridade visual é `NeroProject329/crm-ads-whatsapp/main/apps/web`, commit `bc9a15f0590d0c70f2c07e9f778c0ab7b61d8a9e`. Sua tela-base fornece paleta, tipografia e caráter; o painel adapta a composição aos seus fluxos. Não é uma réplica de um dashboard existente na referência.

**Key Characteristics:**

- Superfícies verde-escuras com bordas discretas.
- Menta para ações e orientação.
- Tipografia local, informação legível e estados explícitos.

Registro extraído de `src/app/globals.css`, `src/components/layout/AppShell.tsx`, `src/app/app/bulk/page.tsx`, `src/components/ui/Modal.tsx`, `src/app/layout.tsx` e `src/app/manifest.ts`. Revisão de acabamento recebida: ship, sem correções materiais.

## Colors

A menta é o acento primário; não há uma segunda identidade cromática. Fundo, painéis e painéis secundários formam camadas de verde. Texto claro identifica conteúdo; verde suave identifica apoio.

Estados usam os pares semânticos de CSS `--success-bg/text`, `--danger-bg/text`, `--warning-bg/text` e `--info-bg/text`; mensagens também nomeiam o resultado, sem depender apenas de cor.

**The Continuidade Rule.** A PWA e o viewport usam o mesmo fundo escuro do aplicativo.

## Typography

A pilha local começa em Inter e recua para fontes de sistema; não há download de fontes. Títulos de página são compactos, sem tipografia de campanha. Títulos de seção separam blocos operacionais; corpo e apoio usam os papéis do frontmatter. Telefones recebem números tabulares onde implementado.

## Layout

O shell centraliza o conteúdo em até 72rem, com margem interna horizontal de 16px e vertical de 24px. Cabeçalho e navegação ficam acima do conteúdo, não em uma sidebar. A navegação quebra linhas naturalmente.

Na troca em lote, dois painéis tornam-se colunas a partir de 1024px; abaixo disso ficam empilhados. Listas longas têm rolagem interna e domínios podem quebrar palavras. Até 640px, campos usam 16px e a navegação reduz espaçamento e texto. Diálogos têm largura máxima de 28rem, margens laterais de 1rem e altura limitada a 90dvh com rolagem.

## Elevation & Depth

Profundidade vem de tons, bordas e um brilho radial discreto no fundo. Os painéis não herdam a grande sombra da tela-base de referência. A navegação ativa usa contorno interno; diálogos escurecem o conteúdo ao fundo.

## Shapes

Painéis têm cantos amplos; campos e botões, curvas menores. Badges são cápsulas. O símbolo do painel ocupa um quadrado menta arredondado. Bordas finas delimitam superfícies e áreas operacionais.

## Components

- **Botões:** primário menta, secundário verde-escuro e destrutivo com semântica de perigo. Altura mínima de 40px, peso 600, mudança de fundo/borda em 150ms. Desabilitados ficam com opacidade reduzida e cursor de indisponibilidade.
- **Campos:** fundo escuro, borda discreta, altura mínima de 42px e rótulos visíveis. Foco recebe contorno menta de 2px; o foco de teclado global tem afastamento de 4px. Checkbox e radio preservam a interação nativa.
- **Navegação:** estado atual identificado por `aria-current="page"`, menta e contorno interno; há atalho de teclado para ir ao conteúdo.
- **Painéis e badges:** separam grupos, contagens e estados sem impor decoração a cada linha.
- **Confirmações:** diálogo nativo com título e descrição associados, ações nomeadas e estado “Salvando…”. O cancelamento fica bloqueado durante a operação.
- **Troca em lote:** seleção múltipla de domínios, seleção única de número e resumo antes de confirmar. Ativar e desativar explicam consequências diferentes.
- **Erros e retorno:** erros usam `role="alert"`; sucesso e carregamento usam `role="status"`. Erros da confirmação permanecem dentro do diálogo; resultados vazios têm texto explícito.
- **PWA:** manifesto e ícones acompanham a identidade escura. Instalação é oferecida nas Configurações; o aviso offline esclarece que operar requer conexão.
- **Movimento:** transições de estado são curtas; há spinner de espera. A preferência por movimento reduzido suprime animações e transições prolongadas.

## Do's and Don'ts

### Do:

- **Do** preservar a linguagem visual da referência confirmada.
- **Do** distinguir seleção, confirmação, carregamento, erro e resultado.
- **Do** manter foco visível e navegação utilizável em telas estreitas.

### Don't:

- **Don't** descrever a adaptação operacional como réplica exata da tela-base.
- **Don't** adicionar fontes de rede ou animações de entrada.
- **Don't** apresentar ausência de conexão como operação concluída.
