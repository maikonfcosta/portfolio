# Pesquisa e decisões

Referência: https://isaoliveira13.github.io/ e seu index.html público. Aproveitar estrutura de apresentação e seções; criar identidade original.
Fonte pessoal: ../README.md e READMEs locais de playwright-reference-suite, failure-classifier, ai-ci-triage e treino-tracker. Os números são autorrelatados, não auditados. A triagem com IA possui implementação e demonstração no README atual do projeto, apesar da checkbox antiga no perfil.

## Sistema visual
Fundo #101412; superfície #191e1b; texto #eff2ec; secundário #adb8ad; destaque #b6ef82. Títulos em sans-serif editorial, monoespaçada em rótulos. Escala de espaçamento em múltiplos de 8. Controles com área mínima de 44px, foco visível, contraste de texto >=4.5:1, sem efeitos que dependam de hover. Um CTA principal por bloco. Sem terminal simulando testes executados.

Skills: frontend-design e ui-ux-pro-max. O script scripts/search.py e bases da segunda skill não estão presentes; diretrizes do SKILL.md aplicadas manualmente. Recomendações de stack React Native do arquivo não se aplicam ao site estático.
Documentação oficial consultada: MDN prefers-reduced-motion e aria-expanded. Menu anuncia expansão; movimento reduzido desativa rolagem suave e animações.

## Verificação de links
02/10/2026: repositórios QA e relatório público responderam 200. O endereço GitHub do treino-tracker respondeu 404 sem autenticação; cartão oferece contato sobre o projeto em vez de um link inacessível.

## Refinamento escolhido
Paleta final grafite + jade: dark bg #111715, surface #1b2520, accent #91d5ae; light bg #f6f8f3, surface #eaf0e6, accent #246444. Contraste e legibilidade têm prioridade sobre transparência. Cabeçalho com backdrop-filter de 16px e painel de 18px, com fallback opaco; sem filtros nos demais cards. Painel de notas substitui código fictício por princípios de atuação.

Idioma preserva os nós originais, sem innerHTML nem acesso remoto para traduções; localStorage protegido por try/catch. Preferência de tema aplicada antes do CSS. IntersectionObserver revela conteúdo sem loop de scroll; elementos focados por teclado são revelados imediatamente. Movimento reduzido desativa animações, inclusive se a preferência mudar durante a visita.

Documentação: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter ; https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API ; https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage . Validação complementar com axe-core 4.10.3, sem instalação de dependência.

## Revisão — 07/10/2026

Publicado corresponde ao último commit 14c491f, após normalizar CRLF/LF. QA Automation Java foi identificado pela implementação e documentação locais: quatro cenários Java e seis testes Python, com execução histórica registrada em 05/10/2026. Repositório privado: case não deve apontar para código/pipeline inacessíveis. Não publicar credenciais, IDs de cartões ou documentação interna; texto do case contém somente arquitetura e dados sintéticos.
