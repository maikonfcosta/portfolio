/**
 * PORTFÓLIO MAIKON COSTA · MODERN TCG & BOARD GAME ENGINE
 * Interatividade: Física 3D Tilt, Efeito Foil Holográfico, Rolagem do D20 Tático e Filtros do Deck
 */

document.addEventListener('DOMContentLoaded', () => {
  initCard3DTilt();
  initD20Roller();
  initDeckFilters();
  initDeckViewToggle();
  initContactForm();
});

/* ==========================================================================
   1. FÍSICA 3D TILT & EFEITO FOIL HOLOGRÁFICO
   ========================================================================== */
function initCard3DTilt() {
  const tiltCards = document.querySelectorAll('.leader-card-3d, .tcg-card-item');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
      
      // Atualiza coordenadas do brilho de luz holográfica
      const glareX = ((x / rect.width) * 100).toFixed(1);
      const glareY = ((y / rect.height) * 100).toFixed(1);
      card.style.setProperty('--glare-x', `${glareX}%`);
      card.style.setProperty('--glare-y', `${glareY}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

/* ==========================================================================
   2. D20 TÁTICO: DADO POLIEDRO 3D (THREE.JS ICOSAEDRO REAL)
   ========================================================================== */
function initD20Roller() {
  const canvas = document.getElementById('d20ThreeCanvas');
  const container = document.getElementById('d20CanvasContainer');
  const rollBtn = document.getElementById('btnRollD20');
  const outcomeTitle = document.getElementById('ruleOutcomeTitle');
  const outcomeText = document.getElementById('ruleOutcomeText');

  if (!canvas || !container || typeof THREE === 'undefined') return;

  const qualityRules = [
    { num: 20, title: "D20 · CRITICAL SUCCESS: ZERO FLAKINESS", text: "O anel crítico atinge 0% de instabilidade. A esteira de CI/CD só quebra se o produto quebrar." },
    { num: 19, title: "D19 · CONTROLE DE TABULEIRO", text: "Isolamento total de massa de dados: nenhum teste depende da execução anterior." },
    { num: 18, title: "D18 · CONTRATO BLINDADO", text: "Drift scanner em OpenAPI: nenhuma mudança de schema passa despercebida." },
    { num: 17, title: "D17 · PATCH COVERAGE >= 80%", text: "Foco no código novo que entra em produção, sem punir o débito técnico legado." },
    { num: 16, title: "D16 · SLO P95 RIGOROSO", text: "Testes de carga contínuos com Locust garantindo latência abaixo do teto em 95% das chamadas." },
    { num: 15, title: "D15 · EVOLUÇÃO DETERMINÍSTICA", text: "Automação de processos RPA reduzindo tarefas de 7 dias para apenas 1 dia." },
    { num: 14, title: "D14 · AUDITORIA DE REGRAS", text: "Como em um Eurogame pesado: entenda todos os cenários de borda antes de codificar." },
    { num: 13, title: "D13 · OBSERVABILIDADE ATIVA", text: "Integração direta de erros Datadog gerando tickets desduplicados no Azure DevOps." },
    { num: 12, title: "D12 · MATRIZ RBAC & BOLA", text: "Proteção contra manipulação de objetos e posse de recursos em APIs REST." },
    { num: 11, title: "D11 · TESTES COM EVIDÊNCIA", text: "Diagnóstico reprodutível antes do fix. 'Parece correto' nunca é evidência." },
    { num: 10, title: "D10 · ANÉIS DE QUALIDADE", text: "Jornadas críticas a cada push (~10s); rotina profunda cross-browser à noite." },
    { num: 9, title: "D09 · SANEAMENTO DE DADOS", text: "Anonimização rigorosa de dados relacionais e proteção de informações sensíveis (PII)." },
    { num: 8, title: "D08 · ESTRATÉGIA DE DECKBUILDING", text: "Pirâmide de testes adaptada: unitários na base, componentes e E2E cirúrgico no topo." },
    { num: 7, title: "D07 · TRIAGEM COM IA", text: "LLMs apoiando o diagnóstico de falhas sem delegar o quality gate de aprovação." },
    { num: 6, title: "D06 · RESILIÊNCIA EM NUVEM", text: "Probes sintéticos em produção monitorando transações 24 horas por dia." },
    { num: 5, title: "D05 · COMUNICAÇÃO TRANSPARENTE", text: "Explicação técnica em duas camadas: o termo exato seguido da analogia prática." },
    { num: 4, title: "D04 · ESCAPE RATE MINIMIZADO", text: "Queda na evasão de bugs para produção (de 83% para 20% comprovados)." },
    { num: 3, title: "D03 · CONTROLE DE FLUXO", text: "Tratamento de exceções e tolerância a falhas na camada de orquestração de robôs." },
    { num: 2, title: "D02 · REVISÃO ENTRE PARES", text: "Code review técnico focado em Clean Code, SOLID e manutenibilidade." },
    { num: 1, title: "D01 · FALHA CONTROLADA", text: "Classificador determinístico isolando se o erro é bug de produto, ambiente ou teste." }
  ];

  // 1. Configuração de Cena, Câmera e Renderer
  const width = container.clientWidth || 220;
  const height = container.clientHeight || 220;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 5.2);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. Iluminação do Dado (Cores do Portfólio: Esmeralda QA, Dourado Ouro e Ônix)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfef08a, 1.4); // Dourado nobre
  keyLight.position.set(3, 4, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x10b981, 1.0); // Verde Esmeralda QA
  fillLight.position.set(-3, -2, 3);
  scene.add(fillLight);

  const topRimLight = new THREE.PointLight(0x34d399, 1.2, 10);
  topRimLight.position.set(0, 3, 2);
  scene.add(topRimLight);

  // 3. Gerador de Textura para as Faces do D20 (Resina Ônix / Esmeralda & Números em Ouro)
  function createD20FaceTexture(number) {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 256;
    texCanvas.height = 256;
    const ctx = texCanvas.getContext('2d');

    // Fundo de resina ônix profunda com reflexo esmeralda translúcido
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 130);
    grad.addColorStop(0, '#064e3b');   // Esmeralda nobre
    grad.addColorStop(0.55, '#0f172a'); // Ardósia profundo
    grad.addColorStop(1, '#020617');    // Ônix negro
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Borda triangular externa esmeralda
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(128, 22);
    ctx.lineTo(234, 218);
    ctx.lineTo(22, 218);
    ctx.closePath();
    ctx.stroke();

    // Borda interna dourada sutil
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(128, 32);
    ctx.lineTo(224, 210);
    ctx.lineTo(32, 210);
    ctx.closePath();
    ctx.stroke();

    // Número gravado em alto contraste e elegância
    ctx.fillStyle = number === 20 ? '#fef08a' : (number === 1 ? '#f87171' : '#ffffff');
    ctx.font = 'bold 82px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = number === 20 ? '#10b981' : 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = number === 20 ? 18 : 8;

    const label = (number === 6 || number === 9) ? `${number}.` : `${number}`;
    ctx.fillText(label, 128, 142);

    const texture = new THREE.CanvasTexture(texCanvas);
    texture.needsUpdate = true;
    return texture;
  }

  // 4. Construção da Geometria do Icosaedro com Alinhamento Orthonormal
  const radius = 1.45;
  const geom = new THREE.IcosahedronGeometry(radius, 0).toNonIndexed();
  const pos = geom.attributes.position.array;
  const numFaces = pos.length / 9; // 20 faces

  const uvs = new Float32Array(numFaces * 6);
  const faceTargetQuats = [];
  const materials = [];

  for (let i = 0; i < numFaces; i++) {
    // UVs do triângulo: Vértice 0 (topo), Vértice 1 (inferior esquerdo), Vértice 2 (inferior direito)
    // p1 = esquerdo (u=0.08), p2 = direito (u=0.92) para evitar textura espelhada
    uvs[i * 6] = 0.5;     uvs[i * 6 + 1] = 0.92;
    uvs[i * 6 + 2] = 0.08;  uvs[i * 6 + 3] = 0.14;
    uvs[i * 6 + 4] = 0.92;  uvs[i * 6 + 5] = 0.14;

    const p0 = new THREE.Vector3(pos[i * 9], pos[i * 9 + 1], pos[i * 9 + 2]);
    const p1 = new THREE.Vector3(pos[i * 9 + 3], pos[i * 9 + 4], pos[i * 9 + 5]);
    const p2 = new THREE.Vector3(pos[i * 9 + 6], pos[i * 9 + 7], pos[i * 9 + 8]);

    // Normal da face (Z local da face apontando para fora)
    const center = p0.clone().add(p1).add(p2).divideScalar(3);
    const N = center.clone().normalize();

    // Vetor Right da face (X local: aponta do canto esquerdo p1 para o canto direito p2)
    const R = p2.clone().sub(p1).normalize();

    // Vetor Up da face (Y local: perpendicular a N e R, apontando para o topo p0)
    const U = new THREE.Vector3().crossVectors(N, R).normalize();

    // Matriz de rotação ortonormal que alinha a face de frente para a tela [X=(1,0,0), Y=(0,1,0), Z=(0,0,1)]
    const rotMatrix = new THREE.Matrix4().set(
      R.x, R.y, R.z, 0,
      U.x, U.y, U.z, 0,
      N.x, N.y, N.z, 0,
      0,   0,   0,   1
    );
    const quat = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);
    faceTargetQuats.push(quat);

    geom.addGroup(i * 3, 3, i);
    materials.push(new THREE.MeshStandardMaterial({
      map: createD20FaceTexture(i + 1), // Face i recebe o número i + 1 (1 a 20)
      roughness: 0.22,
      metalness: 0.25
    }));
  }

  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.computeVertexNormals();

  const d20Group = new THREE.Group();
  const d20Mesh = new THREE.Mesh(geom, materials);
  d20Group.add(d20Mesh);

  // Arestas Douradas e Esmeralda com reflexo elegante
  const wireGeom = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(radius * 1.002, 0));
  const wireMat = new THREE.LineBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.45 });
  const wireMesh = new THREE.LineSegments(wireGeom, wireMat);
  d20Group.add(wireMesh);

  scene.add(d20Group);

  // Posição inicial: Face 20 perfeitamente ereta e voltada para a frente
  d20Group.quaternion.copy(faceTargetQuats[19]);

  // 5. Sintetizador de Som de Dado (Web Audio API)
  let audioCtx = null;
  function playDiceClatter() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300 + Math.random() * 250, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.05);
          gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.05);
        }, i * 90);
      }
    } catch (_) {}
  }

  // 6. Estados de Animação e Rolagem Ultra Fluida
  let isRolling = false;
  let rollFrame = 0;
  const totalRollFrames = 85; // ~1.4 segundos a 60fps
  let spinAxis = new THREE.Vector3(1, 0, 0);
  let initialAngularSpeed = 0.42;
  let targetQuat = new THREE.Quaternion();
  let chosenRule = null;

  function rollD20() {
    if (isRolling) return;
    isRolling = true;
    rollFrame = 0;
    playDiceClatter();

    container.classList.remove('roll-settled');

    // Sorteia face física do dado de 1 a 20 (índice 0 a 19)
    const chosenIdx = Math.floor(Math.random() * 20);
    const faceNumber = chosenIdx + 1; // 1 a 20
    // Garante sincronização 100% exata entre o número gravado no dado e a regra exibida
    chosenRule = qualityRules.find(r => r.num === faceNumber) || qualityRules[0];

    // Face com alinhamento ortonormal exato para a câmera
    targetQuat.copy(faceTargetQuats[chosenIdx]);

    // Eixo de rotação tridimensional aleatório e velocidade inicial
    spinAxis.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 1.5
    ).normalize();
    initialAngularSpeed = 0.38 + Math.random() * 0.12;
  }

  // 7. Eventos de Clique e Drag Interativo com o Mouse
  let isDragging = false;
  let prevMousePos = { x: 0, y: 0 };

  container.addEventListener('mousedown', (e) => {
    if (isRolling) return;
    isDragging = true;
    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging || isRolling) return;
    const deltaX = e.clientX - prevMousePos.x;
    const deltaY = e.clientY - prevMousePos.y;

    const rotSpeed = 0.008;
    const rotQuatX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * rotSpeed);
    const rotQuatY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * rotSpeed);

    d20Group.quaternion.premultiply(rotQuatX);
    d20Group.quaternion.premultiply(rotQuatY);

    prevMousePos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Clique no container ou botão dispara rolagem
  canvas.addEventListener('click', () => {
    if (!isDragging) rollD20();
  });

  if (rollBtn) {
    rollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      rollD20();
    });
  }

  // 8. Loop de Renderização e Física Amortecida Contínua
  function animate() {
    requestAnimationFrame(animate);

    if (isRolling) {
      rollFrame++;
      const p = Math.min(rollFrame / totalRollFrames, 1.0); // 0.0 a 1.0

      // Decaimento contínuo e orgânico de velocidade angular (curva de atrito)
      const currentSpeed = initialAngularSpeed * Math.pow(1 - p, 2.2);

      // Gira sobre o eixo no espaço global
      if (currentSpeed > 0.001) {
        const stepQuat = new THREE.Quaternion().setFromAxisAngle(spinAxis, currentSpeed);
        d20Group.quaternion.premultiply(stepQuat);
      }

      // Atração suave crescente para a face sorteada à medida que perde energia
      if (p > 0.35) {
        const settleProgress = (p - 0.35) / 0.65;
        // Curva suave de atração magnética para a face do dado
        const attractionWeight = Math.pow(settleProgress, 2.5) * 0.45;
        d20Group.quaternion.slerp(targetQuat, attractionWeight);
      }

      // Simulação física de quiques na mesa (bounces amortecidos)
      const bounceWaves = Math.sin(p * Math.PI * 3.5);
      const bounceAmplitude = 0.32 * Math.pow(1 - p, 1.8);
      d20Group.position.y = Math.max(0, bounceWaves * bounceAmplitude);

      // Finalização precisa
      if (rollFrame >= totalRollFrames) {
        isRolling = false;
        d20Group.quaternion.copy(targetQuat);
        d20Group.position.set(0, 0, 0);

        container.classList.add('roll-settled');

        if (chosenRule) {
          outcomeTitle.textContent = chosenRule.title;
          outcomeText.textContent = chosenRule.text;
        }
      }
    } else if (!isDragging) {
      // Idle fluido e sutil
      d20Group.position.y = Math.sin(Date.now() * 0.002) * 0.03;
    }

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   3. FILTROS DO DECK DE PROJETOS
   ========================================================================== */
function initDeckFilters() {
  const tabs = document.querySelectorAll('.deck-tab');
  const cards = document.querySelectorAll('.tcg-card-item');
  const counter = document.getElementById('deckCount');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      let visible = 0;

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter || cat.includes(filter)) {
          card.style.display = 'flex';
          visible++;
        } else {
          card.style.display = 'none';
        }
      });

      if (counter) {
        counter.textContent = `${String(visible).padStart(2, '0')} cartas no grimório`;
      }
    });
  });
}

/* ==========================================================================
   4. TOGGLE BINDER (FICHÁRIO) VS MESA TÁTICA (LISTA)
   ========================================================================== */
function initDeckViewToggle() {
  const btnBinder = document.getElementById('btnViewBinder');
  const btnBoard = document.getElementById('btnViewBoard');
  const grid = document.getElementById('deckBinderGrid');

  if (!btnBinder || !btnBoard || !grid) return;

  btnBinder.addEventListener('click', () => {
    btnBinder.classList.add('active');
    btnBoard.classList.remove('active');
    grid.classList.remove('board-mode');
  });

  btnBoard.addEventListener('click', () => {
    btnBoard.classList.add('active');
    btnBinder.classList.remove('active');
    grid.classList.add('board-mode');
  });
}

/* ==========================================================================
   5. FORMULÁRIO DE CONVOCAÇÃO PARA A MESA (CONTATO)
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('tableContactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('playerSenderName').value.trim();
    const context = document.getElementById('playerSenderContext').value.trim();
    const msg = document.getElementById('playerSenderMsg').value.trim();

    const subject = encodeURIComponent(`[Mesa Tática QA] ${context} - ${name}`);
    const body = encodeURIComponent(
      `Olá Maikon,\n\nMeu nome é ${name}.\nContexto / Oportunidade: ${context}\n\nMensagem:\n${msg}\n\n---\nEnviado através do portfólio oficial maikonfcosta.github.io.`
    );

    window.location.href = `mailto:maikonfcosta@gmail.com?subject=${subject}&body=${body}`;
  });
}
