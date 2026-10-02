# Grafite + jade — refinamento de UX/UI

## Direção escolhida
Grafite + jade em claro e escuro, mantendo composição editorial e identidade geek discreta. Vidro translúcido no cabeçalho e painel de apresentação; superfícies mais opacas no conteúdo. Bordas sutis, luz localizada, ritmo de espaços e tipografia consistente. Os projetos exibem evidências e decisões reais.

## Interações
Seleção explícita PT/EN com tradução integral do conteúdo e atributos acessíveis. Botão de tema segue o sistema até a primeira escolha manual. Preferências persistem quando o armazenamento está disponível. Idioma padrão PT. Filtros mantêm seleção ao trocar idioma. Menu mobile permite Escape e devolve o foco. Entrada ao rolar e resposta em hover/foco respeitam movimento reduzido. Sem efeitos contínuos nem bibliotecas de animação.

## Aceite e execução
- [x] Teste dos controles antes de implementar.
- [x] Preferências de tema, traduções e controles acessíveis.
- [x] Novo CSS com tokens e glassmorphism progressivo; layout responsivo.
- [x] Testes de PT/EN × claro/escuro, persistência, filtros, teclado, movimento reduzido e fallback.
- [x] Revisão visual e atualização da documentação; abertura da prévia na entrega.

Documentação oficial consultada: MDN backdrop-filter, Intersection Observer e localStorage. Efeito de vidro com fallback opaco. Armazenamento indisponível não impede uso. A verificação local via file:// é complementada por HTTP para persistência previsível.
