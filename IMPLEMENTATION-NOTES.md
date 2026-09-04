# Painel de números — alterações
## Referência visual
Design adaptado de [crm-ads-whatsapp/main/apps/web](https://github.com/NeroProject329/crm-ads-whatsapp/tree/bc9a15f0590d0c70f2c07e9f778c0ab7b61d8a9e/apps/web), conforme pedido do proprietário. A referência contém uma tela-base, não um dashboard completo: foram reutilizados sua linguagem verde escura, tipografia de sistema, acentos menta e bordas discretas, aplicados aos fluxos reais do painel.
## Funcionalidades
- PWA com manifesto, ícones, instalação nas Configurações e aviso offline. API e dados autenticados não são armazenados no cache do service worker.
- Sessão de 30 dias para novos logins, saída sincronizada entre abas e alteração de senha em Configurações.
- Números novos entram em todos os domínios, sem substituir o número ativo.
- Exclusão preserva outros números ativos; vínculo em lote usa uma chamada.
- Dashboard abre detalhes do domínio.
- Troca em vários sites seleciona domínios ativos e um número. A ativação substitui os números atuais; a desativação remove somente o escolhido.
- Navegação sem animações de entrada, consultas independentes paralelas e preconnect para a API.
## Verificação
Build e lint do frontend aprovados. Suíte local isolada: 13 testes de API e 2 testes completos de navegador, incluindo desktop/mobile, alterações, senha, logout entre abas e PWA/offline. Dados sintéticos e MongoDB temporário; nenhum teste destrutivo contra produção.
## Configuração
`NEXT_PUBLIC_API_BASE` aponta para a API Railway. O build padrão usa `.next`; `NEXT_DIST_DIR=.next-qa` isola o build de testes. Ícones podem ser regenerados por `node scripts/generate-icons.mjs`.
## Compatibilidade
Publicar a API com as novas rotas antes do frontend: `PATCH /auth/password`, `POST /admin/domains/:id/numbers/all`, `PATCH /admin/domains/bulk-active-number`. Tokens já emitidos mantêm sua expiração anterior até novo login. Nenhuma mudança de CORS ou credenciais faz parte desta entrega.
