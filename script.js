/* ------------------- THREE.JS SETUP ------------------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

/* Luce ambiente + luce puntiforme per riflessi metallici */
const ambient = new THREE.AmbientLight(0x404040, 2);
scene.add(ambient);
const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

/* ---------- Logo 3D "GABRIELE MADEO" ---------- */
const loader = new THREE.FontLoader();
loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
  const textGeometry = new THREE.TextGeometry('GABRIELE MADEO', {
    font: font,
    size: 0.8,
    height: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5
  });
  textGeometry.center();
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, metalness: 0.8, roughness: 0.2 });
  const logo = new THREE.Mesh(textGeometry, material);
  scene.add(logo);

  // Rotazione lenta + mouse follow
  const clock = new THREE.Clock();
  let targetRotationY = 0;
  let targetRotationX = 0;

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // rotazione autonoma
    logo.rotation.y = elapsed * 0.2;
    logo.rotation.x = Math.sin(elapsed * 0.1) * 0.1;

    // avvicinamento al target mosso dal mouse (smorzato)
    logo.rotation.y += (targetRotationY - logo.rotation.y) * 0.05;
    logo.rotation.x += (targetRotationX - logo.rotation.x) * 0.05;

    renderer.render(scene, camera);
  }
  animate();

  // Mouse / touch interaction
  function onPointerMove(event) {
    const x = (event.clientX / window.innerWidth) * 2 - 1; // -1 … +1
    const y = (event.clientY / window.innerHeight) * 2 - 1;
    targetRotationY = x * 0.5;   // limitiamo la rotazione
    targetRotationX = -y * 0.3;
  }
  window.addEventListener('pointermove', onPointerMove);
});

/* ------------------- GSAP SCROLL TRIGGERS ------------------- */
// Portal letters effect (simplified: letters orbit while scrolling)
gsap.utils.toArray('#portal h2').forEach((el) => {
  const letters = el.getAttribute('data-letters').split(' ');
  // crea uno span per ogni lettera
  el.innerHTML = '';
  letters.forEach((l) => {
    const span = document.createElement('span');
    span.textContent = l === '' ? '&nbsp;' : l;
    el.appendChild(span);
  });
  const spans = gsap.utils.toArray(el.children);

  // animazione scroll: le lettere si dispongono su un cerchio e poi rientrano
  gsap.to(spans, {
    scrollTrigger: {
      trigger: '#portal',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
    rotation: () => gsap.utils.random(-180, 180),
    x: () => gsap.utils.random(-200, 200),
    y: () => gsap.utils.random(-100, 100),
    opacity: 0.6,
    ease: 'none',
  });
  // riporta le lettere al centro quando usciamo dalla sezione
  gsap.to(spans, {
    scrollTrigger: {
      trigger: '#portal',
      start: 'bottom top',
      end: 'bottom bottom',
      scrub: true,
    },
    rotation: 0,
    x: 0,
    y: 0,
    opacity: 1,
    duration: 0.5,
  });
});

/* ------------------- ICE SHARDS INTERACTION ------------------- */
const shards = document.querySelectorAll('.shard');
shards.forEach((shard) => {
  const info = shard.getAttribute('data-info');
  const content = shard.querySelector('.shard-content');

  // Mostra info al click (semplicemente sostituisce il contenuto)
  shard.addEventListener('click', () => {
    content.innerHTML = info;
    // piccoli effetti di "apertura"
    gsap.fromTo(content,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out' }
    );
  });

  // Animazione di leggera rotazione allo scroll (ice‑shard effect)
  gsap.to(shard, {
    scrollTrigger: {
      trigger: shard,
      start: 'top bottom+=100',
      end: 'bottom top-=100',
      scrub: true,
    },
    rotationY: () => gsap.utils.random(-10, 10),
    rotationX: () => gsap.utils.random(-5, 5),
  });
});

/* ------------------- RESPONSIVE ------------------- */
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
