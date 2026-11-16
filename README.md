# Portfólio — Maikon Costa

Portfólio profissional de **Maikon Costa** (Senior QA Engineer & RPA Developer), apresentando engenharia de qualidade, automação determinística de testes, observabilidade e cultura estratégica inspirada em *Modern Board Games & TCG*.

Hospedado no GitHub Pages: **[https://maikonfcosta.github.io/portfolio/](https://maikonfcosta.github.io/portfolio/)**

---

## 🎲 Arquitetura e Estrutura do Site

- `index.html`: Marcação semântica com metadados completos (Open Graph, Twitter Card), acessibilidade WCAG 2.1 AA, seções de estratégia, grimório de projetos e convocação para a mesa.
- `assets/tcg.css`: Tokens de design do playmat escuro, cartas colecionáveis holográficas (Alt-Art/Foil), efeitos de física e suporte nativo a `prefers-reduced-motion`.
- `assets/tcg.js`: Motor de interatividade com física de inclinação 3D (tilt), rotação do dado D20 poliedro em Three.js (com suporte a toque, redimensionamento responsivo via `ResizeObserver` e pausa inteligente fora do viewport via `IntersectionObserver`), filtros dinâmicos de deck e alternância de visualização (Fichário / Mesa).
- `assets/three.min.js`: Biblioteca Three.js para renderização WebGL do dado D20 carregada com `defer`.
- `tests/`: Suíte automatizada de testes com Playwright em Python:
  - `tests/smoke.py`: Validação de carregamento, cards de projetos, filtros do deck, links de contato, rolagem reativa do D20 e responsividade visual (360px a 1440px).
  - `tests/accessibility.py`: Auditoria contínua de acessibilidade com o motor oficial axe-core (WCAG 2.0 A/AA, WCAG 2.1 AA e Best Practices) em viewports mobile e desktop.
- `scripts/qa-ci-local.ps1`: Esteira local de validação contínua (syntax check JS com Node, execução da suíte Playwright/axe-core e verificação de diff git).

---

## 🃏 Grimório de Projetos Open Source (9 Cartas)

1. **Playwright Reference Suite:** Suíte de referência Conduit com isolamento absoluto de dados, 17 testes críticos em ~10s no push e 59 testes noturnos cross-browser.
2. **Failure Classifier:** Classificador determinístico de falhas em CI/CD (bug de produto vs ambiente vs drift de teste).
3. **AI CI Triage:** GitHub Action com LLM para triagem automatizada e diagnóstico idempotente de falhas em PRs.
4. **QA Playbook:** Compilação pública de estratégia de testes, taxonomia de defeitos e gates de patch coverage >= 80%.
5. **Synthetic Monitoring:** Probes sintéticos com Playwright e algoritmo double-fault contra falsos alarmes em produção.
6. **API Contract Lab:** Drift scanner OpenAPI/Swagger, auditoria de matriz RBAC e prevenção a vulnerabilidades BOLA/IDOR.
7. **Locust Perf Kit:** Framework de testes de carga em Python/uv com SLO rígido de latência p95.
8. **Data Seeding Pipeline:** CLI ultra rápido para geração de massa relacional sanitizada e conformidade LGPD (anonimização de PII).
9. **Rotine & TrackFit PRO:** Produtos proprietários (SaaS de automação RPA e PWA offline-first de treinos com Next.js e Supabase).

---

## 🧪 Validação Local & Testes

Para executar o site localmente:
```bash
python -m http.server 4173 --bind 127.0.0.1
# Acesse http://127.0.0.1:4173
```

Para rodar a suíte completa de qualidade e acessibilidade antes de commits:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\qa-ci-local.ps1
```

Ou execute os testes isoladamente:
```bash
# Teste de fumaça e jornadas visuais
python tests/smoke.py

# Auditoria automatizada de acessibilidade WCAG 2.1 AA (axe-core)
python tests/accessibility.py
```
