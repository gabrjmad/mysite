/* =========================================================
   1. FUMO SUL CURSORE
========================================================= */
const smokeCanvas = document.getElementById("smoke-canvas");
const smokeCtx = smokeCanvas.getContext("2d");
let mx = -300;
let my = -300;
const smokePool = [];

class SmokeParticle {
  constructor(x, y) {
    this.x = x + (Math.random() - 0.5) * 8;
    this.y = y + (Math.random() - 0.5) * 8;
    this.r = 4 + Math.random() * 10;
    this.vx = (Math.random() - 0.5) * 1.4;
    this.vy = -(0.5 + Math.random() * 1.6);
    this.a = 0.2 + Math.random() * 0.3;
    this.da = 0.01 + Math.random() * 0.01;
    this.c = Math.random() > 0.5 ? "0,230,255" : "160,160,220";
  }
  tick() {
    this.x += this.vx;
    this.y += this.vy;
    this.r += 0.4;
    this.a -= this.da;
  }
  draw(ctx) {
    if (this.a <= 0) return;
    const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    g.addColorStop(0, `rgba(${this.c},${this.a})`);
    g.addColorStop(1, `rgba(${this.c},0)`);
    ctx.beginPath();
    ctx.fillStyle = g;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
  dead() {
    return this.a <= 0;
  }
}

function resizeSmoke() {
  smokeCanvas.width = window.innerWidth;
  smokeCanvas.height = window.innerHeight;
}
resizeSmoke();
window.addEventListener("resize", resizeSmoke);

function smokeLoop() {
  smokeCtx.clearRect(0, 0, smokeCanvas.width, smokeCanvas.height);
  for (let i = smokePool.length - 1; i >= 0; i--) {
    smokePool[i].tick();
    smokePool[i].draw(smokeCtx);
    if (smokePool[i].dead()) smokePool.splice(i, 1);
  }
  requestAnimationFrame(smokeLoop);
}
smokeLoop();

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  for (let i = 0; i < 5; i++) smokePool.push(new SmokeParticle(mx, my));
});

/* =========================================================
   2. BOLLE DI SAPONE INTERATTIVE
========================================================= */
const bubblesContainer = document.getElementById("bubbles-container");
const bubbles = [];

class Bubble {
  constructor() {
    this.el = document.createElement("div");
    this.el.className = "soap-bubble";
    this.size = 40 + Math.random() * 80;
    this.x = Math.random() * window.innerWidth;
    this.y = window.innerHeight + 80;
    this.vx = (Math.random() - 0.5) * 0.7;
    this.vy = -(0.4 + Math.random() * 0.6);
    this.life = 1;

    this.el.style.width = `${this.size}px`;
    this.el.style.height = `${this.size}px`;

    bubblesContainer.appendChild(this.el);
  }

  update() {
    const dx = mx - this.x;
    const dy = my - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150 && dist > 0) {
      const force = (150 - dist) / 150 * 0.4;
      this.vx -= (dx / dist) * force;
      this.vy -= (dy / dist) * force * 0.3;
    }

    this.vx *= 0.97;
    this.vy *= 0.98;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 0.002;

    if (this.x < this.size / 2) {
      this.x = this.size / 2;
      this.vx *= -0.6;
    }
    if (this.x > window.innerWidth - this.size / 2) {
      this.x = window.innerWidth - this.size / 2;
      this.vx *= -0.6;
    }

    const scale = Math.max(0.2, this.life);
    this.el.style.transform =
      `translate(${this.x - this.size / 2}px, ${this.y - this.size / 2}px) scale(${scale})`;
    this.el.style.opacity = this.life.toFixed(2);

    return this.y > -120 && this.life > 0;
  }

  destroy() {
    this.el.remove();
    const idx = bubbles.indexOf(this);
    if (idx >= 0) bubbles.splice(idx, 1);
  }
}

function spawnBubble() {
  if (Math.random() < 0.45) bubbles.push(new Bubble());
}
setInterval(spawnBubble, 120);

function bubbleLoop() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    if (!bubbles[i].update()) bubbles[i].destroy();
  }
  requestAnimationFrame(bubbleLoop);
}
bubbleLoop();

/* =========================================================
   3. PORTAL: LETTERE + PORTA + TUNNEL
   (effetto ispirato al portfolio di Mohit Virli)[web:20][web:21]
========================================================= */
const portalSection = document.getElementById("portal");
const portalDoor = document.getElementById("portal-door");
const portalTunnel = document.getElementById("portal-tunnel");

const NAME_TEXT = "GABRIELE MADEO";
const portalLetters = [];

// crea lettere attorno alla porta
NAME_TEXT.split("").forEach((ch, i) => {
  const el = document.createElement("div");
  el.className = "portal-letter";
  el.textContent = ch === " " ? "\u00A0" : ch;
  portalSection.appendChild(el);
  portalLetters.push({
    el,
    baseAngle: (i / NAME_TEXT.length) * Math.PI * 2,
    radius0: 40 + Math.random() * 10
  });
});

function updatePortalOnScroll() {
  const rect = portalSection.getBoundingClientRect();
  const vh = window.innerHeight;
  const progress = Math.max(0, Math.min(1, 1 - rect.top / vh));

  // lettere: da linea a cerchio + esplosione
  portalLetters.forEach((L, i) => {
    const p = progress;
    const angle = L.baseAngle + p * Math.PI * 4;
    const radius = L.radius0 + p * 120;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius * 0.6;
    const rot = p * 720 + i * 20;
    const opacity = 1 - p * 0.9;

    L.el.style.transform = `translate(${x}%, ${y}%) rotate(${rot}deg)`;
    L.el.style.opacity = opacity.toFixed(2);
  });

  // porta: zoom + inclinazione tipo "entri nel tunnel"
  const doorP = Math.max(0, (progress - 0.2) / 0.8);
  const doorScale = 1 + doorP * 8;
  const doorTilt = doorP * 80;
  portalDoor.style.transform =
    `translate(-50%, -50%) scale(${doorScale}) rotateX(${doorTilt}deg)`;

  // tunnel: allontanamento lungo Z e leggera rotazione
  const zDepth = 400 + progress * 900;
  const rotY = progress * -360;
  portalTunnel.style.transform =
    `translateZ(${-zDepth}px) rotateY(${rotY}deg)`;
}

window.addEventListener("scroll", updatePortalOnScroll, { passive: true });
updatePortalOnScroll();

/* =========================================================
   4. ICE: CRISTALLI 3D INTERATTIVI (Three.js)
========================================================= */
const iceSection = document.getElementById("ice");
const iceScene = new THREE.Scene();
const iceCamera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
iceCamera.position.set(0, 0, 10);

const iceRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
iceRenderer.setSize(window.innerWidth, window.innerHeight);
iceRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
iceSection.appendChild(iceRenderer.domElement);

// luci
iceScene.add(new THREE.AmbientLight(0x001133, 10));
const light1 = new THREE.PointLight(0x00ffff, 16, 35);
light1.position.set(5, 6, 5);
iceScene.add(light1);
const light2 = new THREE.PointLight(0x0066ff, 12, 30);
light2.position.set(-5, -4, 2);
iceScene.add(light2);

// cristalli
const CRYSTAL_DATA = [
  {
    title: "CHI SONO",
    body: "Designer & Developer specializzato in esperienze 3D e motion design sul web."
  },
  {
    title: "PROGETTI",
    body: "Landing page animate, esperienze WebGL, interfacce immersive per brand digitali."
  },
  {
    title: "CONTATTI",
    body: "gabriele@madeo.design\nPerugia · Milano · Remote"
  }
];

const crystals = [];
CRYSTAL_DATA.forEach((d, i) => {
  const group = new THREE.Group();
  const geo = new THREE.OctahedronGeometry(1.2 + Math.random() * 0.5, 1);
  const mat = new THREE.MeshPhongMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.32,
    shininess: 200,
    specular: 0xffffff
  });
  const wire = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.8
  });

  const solid = new THREE.Mesh(geo, mat);
  const wireMesh = new THREE.Mesh(geo.clone(), wire);
  group.add(solid);
  group.add(wireMesh);

  const angle = i * 2.1;
  group.position.set(
    Math.cos(angle) * 5,
    Math.sin(angle) * 3,
    (Math.random() - 0.5) * 3
  );
  group.userData = d;

  iceScene.add(group);
  crystals.push(group);
});

// particelle
const pCount = 1000;
const pPos = new Float32Array(pCount * 3);
for (let i = 0; i < pCount; i++) {
  pPos[i * 3] = (Math.random() - 0.5) * 28;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 18;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 0.07,
  transparent: true,
  opacity: 0.65
});
iceScene.add(new THREE.Points(pGeo, pMat));

// raycaster per click / hover
const raycaster = new THREE.Raycaster();
const mouse2D = new THREE.Vector2();
const baseMeshes = crystals.map((g) => g.children[0]);
const hovered = new Set();

// pannello info
const panel = document.getElementById("info-panel");
const panelTitle = document.getElementById("panel-title");
const panelBody = document.getElementById("panel-body");
const closePanel = document.getElementById("close-panel");
closePanel.addEventListener("click", () => panel.classList.remove("open"));

iceRenderer.domElement.addEventListener("click", (e) => {
  const rect = iceSection.getBoundingClientRect();
  mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse2D, iceCamera);
  const hits = raycaster.intersectObjects(baseMeshes);
  if (hits.length) {
    const data = hits[0].object.parent.userData;
    panelTitle.textContent = data.title;
    panelBody.textContent = data.body;
    panel.classList.add("open");
  }
});

iceRenderer.domElement.addEventListener("mousemove", (e) => {
  const rect = iceSection.getBoundingClientRect();
  mouse2D.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse2D.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse2D, iceCamera);
  const hits = raycaster.intersectObjects(baseMeshes);

  hovered.forEach((i) => {
    crystals[i].scale.setScalar(1);
  });
  hovered.clear();

  if (hits.length) {
    const idx = baseMeshes.indexOf(hits[0].object);
    if (idx >= 0) {
      crystals[idx].scale.setScalar(1.45);
      hovered.add(idx);
    }
  }
});

// animazione scena
const clock = new THREE.Clock();
function renderIce() {
  requestAnimationFrame(renderIce);
  const t = clock.getElapsedTime();
  crystals.forEach((g) => {
    g.rotation.x += 0.006;
    g.rotation.y += 0.008;
    g.position.y += Math.sin(t * 0.7) * 0.01;
  });
  iceCamera.lookAt(0, 0, 0);
  iceRenderer.render(iceScene, iceCamera);
}
renderIce();

// resize
window.addEventListener("resize", () => {
  resizeSmoke();
  iceCamera.aspect = window.innerWidth / window.innerHeight;
  iceCamera.updateProjectionMatrix();
  iceRenderer.setSize(window.innerWidth, window.innerHeight);
});
