# Portfólio — Maikon Costa

Página estática com identidade geek discreta em grafite + jade, PT/EN e temas claro/escuro. Abra `index.html` no navegador ou, nesta pasta, execute `python -m http.server 4173 --bind 127.0.0.1` e acesse http://127.0.0.1:4173.

## Organização

- `index.html`: conteúdo, projetos e contatos.
- `assets/professional.css`: tokens dos dois temas, vidro, tipografia, layouts e transições.
- `assets/preferences.js`: preferência de tema antes da pintura inicial, com fallback ao sistema.
- `assets/locales.js`: tradução PT/EN, preservando elementos e links do HTML.
- `assets/main.js`: idioma, tema, menu mobile, filtros e entrada das seções ao rolar.
- `assets/styles.css` e `previews/`: estudos visuais anteriores preservados como referência.
- `docs/`: plano, pesquisa, progresso e evidências.
- `tests/`: fluxos em navegador, preferências e auditoria automatizada de acessibilidade.

Execute `python tests/smoke.py` e `python tests/preferences.py` para validar. O segundo teste inicia uma origem HTTP local temporária e verifica persistência. Execute `python tests/accessibility.py` para a auditoria complementar; ele obtém axe-core 4.10.3 do registro npm oficial e o executa sem instalar pacotes. Playwright e Chromium devem estar disponíveis no ambiente de desenvolvimento; não são dependências do site. Axe não substitui revisão manual nem representa certificação WCAG.

Conteúdo baseado no README do perfil e nas descrições locais dos projetos. Resultados profissionais são autorrelatados e contextualizados; não representam auditoria externa. Capturas reais do relatório público e da jornada E2E usam dados de demonstração. Origem registrada em assets/evidence/README.md; as imagens são registros estáticos.

As fontes IBM Plex Sans e IBM Plex Mono são carregadas pelo Google Fonts, com fontes de fallback. O conteúdo, navegação e todos os projetos continuam disponíveis sem JavaScript. O filtro e menu recolhível são aprimoramentos progressivos.

PT é o idioma inicial. O tema segue o sistema até a escolha manual. Botões PT/EN e tema salvam preferências quando o armazenamento está disponível. Idioma inclui textos, metadados, rótulos acessíveis e assunto do contato do projeto pessoal. Preferências em file:// variam por navegador; prefira HTTP para a avaliação de persistência. Sem armazenamento, os controles seguem funcionais na visita.

Glassmorphism é limitado ao cabeçalho; há fundo opaco em navegadores sem suporte a backdrop-filter. Animações são pontuais e respeitam prefers-reduced-motion. Nome e cargo lideram a apresentação, com cases verificáveis e contatos específicos para vagas e consultoria. A foto pessoal pode ser acrescentada na abertura quando fornecida, preservando o relatório na seção de projetos.

Não publicado. Para publicar no futuro, definir repositório e endereço final, configurar metadados de compartilhamento com URL definitiva e selecionar a pasta de publicação sem alterar o README de perfil.

Abertura com nome em duas linhas e apresentação direta. Case principal conta a investigação do contrato de tags do Conduit, documentada no README da suíte. Projetos secundários em linhas compactas e TrackFit em área própria. Os resultados ficam junto da trajetória, e os serviços partem das dúvidas do cliente. Direção em docs/personal-direction.md.

## Repositório e validação local

Repositório público: https://github.com/maikonfcosta/portfolio. O site não está publicado. Execute ./scripts/qa-ci-local.ps1 antes de commit ou push; requer Python, Playwright com Chromium e Node. A auditoria axe consulta o registro npm.
