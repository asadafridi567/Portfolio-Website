import * as THREE from "../assets/vendor/three.module.js";

const stages = [
  { label: "Source", position: -3.35, color: 0x87a1ff },
  { label: "Bronze", position: -1.7, color: 0xe3a878 },
  { label: "Silver", position: 0, color: 0xe6e9ee },
  { label: "Gold", position: 1.7, color: 0xffd166 },
  { label: "Power BI", position: 3.35, color: 0x2f4bff }
];

export function initHeroScene() {
  const shell = document.querySelector("#pipeline-scene");
  const canvasHost = shell.querySelector(".scene-canvas");
  const fallback = shell.querySelector(".scene-fallback");
  const labelButtons = [...shell.querySelectorAll(".scene-label")];
  const status = document.querySelector(".scene-caption");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    if (status) status.textContent = "Static isometric pipeline preview";
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5.8, 5.8, 5.8, -5.8, 0.1, 100);
  camera.position.set(8, 9, 10);
  camera.lookAt(0, 0, 0);

  const width = Math.max(1, shell.clientWidth);
  const height = Math.max(1, shell.clientHeight);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.35 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Isometric data pipeline: Source, Bronze, Silver, Gold, Power BI");
  canvasHost.replaceChildren(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xf9fbff, 0xa1abc8, 2.2));
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(-5, 10, 5);
  scene.add(keyLight);

  const platformGroup = new THREE.Group();
  scene.add(platformGroup);
  addBox(platformGroup, 8.7, 0.3, 8.7, 0xdee3f2, 0);
  addBox(platformGroup, 8.62, 0.12, 8.62, 0xffffff, 0.19);
  addGrid(platformGroup);
  addTrack(platformGroup);

  const shadowTexture = makeShadowTexture();
  const stageMeshes = new Map();
  const stageTargets = new Map();
  const packetGroup = new THREE.Group();
  scene.add(packetGroup);

  stages.forEach((stage, index) => {
    const group = new THREE.Group();
    group.position.set(stage.position, -0.43, 0);
    group.userData.entrance = 0;
    group.userData.index = index;
    scene.add(group);
    addStageShadow(group, shadowTexture);
    if (stage.label === "Source") addSource(group);
    else if (stage.label === "Power BI") addPowerBi(group);
    else addMedallionStage(group, stage.label, stage.color);
    stageMeshes.set(stage.label, group);
    stageTargets.set(stage.label, 0);
  });

  const packetMaterial = new THREE.MeshLambertMaterial({ color: 0x2f4bff, emissive: 0x172aff, emissiveIntensity: 0.18 });
  const packets = Array.from({ length: 5 }, (_, index) => {
    const packet = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), packetMaterial);
    packet.userData.offset = index / 5;
    packetGroup.add(packet);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.22),
      new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: 0.34, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.255;
    packetGroup.add(shadow);
    packet.userData.shadow = shadow;
    return packet;
  });
  const shellLabels = new Map(labelButtons.map((button) => [button.dataset.stage, button]));
  shell.classList.add("has-webgl");
  fallback.setAttribute("aria-hidden", "true");

  labelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.stage === "Source" ? "about" : "projects";
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    button.addEventListener("pointerenter", () => setStageHover(button.dataset.stage));
    button.addEventListener("pointerleave", () => setStageHover(""));
    button.addEventListener("focus", () => setStageHover(button.dataset.stage));
    button.addEventListener("blur", () => setStageHover(""));
  });

  const raycaster = new THREE.Raycaster();
  const rayPointer = new THREE.Vector2();
  renderer.domElement.addEventListener("pointermove", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    rayPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    rayPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(rayPointer, camera);
    const hits = raycaster.intersectObjects([...stageMeshes.values()], true);
    setStageHover(hits.length ? hits[0].object.userData.stageName : "");
  });
  renderer.domElement.addEventListener("pointerleave", () => setStageHover(""));

  function setStageHover(name) {
    stageTargets.forEach((_, label) => stageTargets.set(label, label === name ? 0.2 : 0));
    shellLabels.forEach((button, label) => button.classList.toggle("is-active", label === name));
  }

  let visible = false;
  let disposed = false;
  let frameId = 0;
  let lastFrame = 0;
  const startTime = performance.now();

  function resize() {
    if (disposed) return;
    const nextWidth = Math.max(1, shell.clientWidth);
    const nextHeight = Math.max(1, shell.clientHeight);
    const aspect = nextWidth / nextHeight;
    const halfHeight = 5.8;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, nextWidth < 600 ? 1.35 : 2));
    renderer.setSize(nextWidth, nextHeight, false);
    positionLabels();
  }

  function positionLabels() {
    const rect = shell.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    stageMeshes.forEach((group, label) => {
      const projected = new THREE.Vector3(0, 1.18, 0);
      projected.applyMatrix4(group.matrixWorld);
      projected.project(camera);
      const button = shellLabels.get(label);
      if (!button) return;
      button.style.left = `${(projected.x * 0.5 + 0.5) * rect.width}px`;
      button.style.top = `${(-projected.y * 0.5 + 0.5) * rect.height}px`;
    });
  }

  function render(now) {
    frameId = 0;
    if (disposed || !visible || document.hidden) return;
    if (now - lastFrame < 1000 / 60) {
      frameId = window.requestAnimationFrame(render);
      return;
    }
    lastFrame = now;
    const elapsed = (now - startTime) / 1000;

    stageMeshes.forEach((group, label) => {
      const entranceDelay = group.userData.index * 0.12;
      const entranceProgress = THREE.MathUtils.clamp((elapsed - entranceDelay) / 0.65, 0, 1);
      const easedEntrance = 1 - Math.pow(1 - entranceProgress, 3);
      group.userData.entrance = 0.43 * easedEntrance;
      group.userData.hoverLift ??= 0;
      const liftTarget = stageTargets.get(label) ?? 0;
      group.userData.hoverLift += (liftTarget - group.userData.hoverLift) * 0.16;
      group.position.y = -0.43 + group.userData.entrance + group.userData.hoverLift;
    });

    const packetsActive = elapsed > 1.35;
    packets.forEach((packet) => {
      const progress = (elapsed * 0.16 + packet.userData.offset) % 1;
      packet.position.set(-3.35 + progress * 6.7, 0.48 + Math.sin(elapsed * 4 + packet.userData.offset * 8) * 0.06, 0);
      packet.userData.shadow.position.x = packet.position.x;
      packet.visible = packetsActive;
      packet.userData.shadow.visible = packetsActive;
    });
    scene.rotation.y += (pointer.x * 0.025 - scene.rotation.y) * 0.035;
    camera.position.x += (8 + pointer.x * 0.2 - camera.position.x) * 0.04;
    camera.position.y += (9 + pointer.y * 0.12 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    scene.updateMatrixWorld(true);
    positionLabels();
    renderer.render(scene, camera);
    frameId = window.requestAnimationFrame(render);
  }

  let pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    const rect = shell.getBoundingClientRect();
    pointer = {
      x: Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)),
      y: Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1))
    };
  };
  shell.addEventListener("pointermove", onPointerMove);

  function updateActivity() {
    const shouldRender = visible && !document.hidden && !disposed;
    if (shouldRender && !frameId) frameId = window.requestAnimationFrame(render);
    if (!shouldRender && frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  }

  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    if (visible) canvasHost.classList.add("is-ready");
    updateActivity();
  }, { threshold: 0.01 });
  visibilityObserver.observe(shell);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(shell);
  document.addEventListener("visibilitychange", updateActivity);
  window.addEventListener("pagehide", teardown, { once: true });
  resize();

  function teardown() {
    if (disposed) return;
    disposed = true;
    window.cancelAnimationFrame(frameId);
    visibilityObserver.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", updateActivity);
    shell.removeEventListener("pointermove", onPointerMove);
    scene.traverse((object) => {
      if (!object.isMesh && !object.isLine) return;
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
    shadowTexture.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }
}

function addBox(parent, width, height, depth, color, y, options = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshLambertMaterial({ color, ...options });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = y;
  parent.add(mesh);
  return mesh;
}

function addGrid(parent) {
  const points = [];
  for (let x = -4.2; x <= 4.2; x += 0.42) points.push([x, 0.255, -4.2, x, 0.255, 4.2]);
  for (let z = -4.2; z <= 4.2; z += 0.42) points.push([-4.2, 0.255, z, 4.2, 0.255, z]);
  const positions = points.flat();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({ color: 0xcfd5e6, transparent: true, opacity: 0.62 });
  parent.add(new THREE.LineSegments(geometry, material));
}

function addTrack(parent) {
  const trackPoints = [new THREE.Vector3(-4.1, 0.29, 0), new THREE.Vector3(4.1, 0.29, 0)];
  const glow = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.LineCurve3(...trackPoints), 64, 0.14, 8, false),
    new THREE.MeshBasicMaterial({ color: 0x2f4bff, transparent: true, opacity: 0.2, depthWrite: false })
  );
  const track = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.LineCurve3(...trackPoints), 64, 0.055, 8, false),
    new THREE.MeshBasicMaterial({ color: 0x2f4bff })
  );
  parent.add(glow, track);
  const dashPoints = [];
  for (let x = -4; x <= 3.9; x += 0.34) {
    dashPoints.push(x, 0.36, 0.13, Math.min(x + 0.16, 4), 0.36, 0.13);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(dashPoints, 3));
  parent.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 })));
}

function addStageShadow(parent, texture) {
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 1.25),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.36, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.29, 0);
  parent.add(shadow);
}

function addSource(parent) {
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.54, 0.8, 32, 1, false),
    new THREE.MeshLambertMaterial({ color: 0x829cff })
  );
  body.position.y = 0.65;
  parent.add(body);
  [0.62, 1.12].forEach((height) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.54, 0.035, 8, 40),
      new THREE.MeshLambertMaterial({ color: 0xffffff })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = height;
    parent.add(ring);
  });
  parent.traverse((object) => {
    if (object.isMesh) object.userData.stageName = "Source";
  });
}

function addMedallionStage(parent, label, color) {
  const stackCount = label === "Bronze" ? 1 : label === "Silver" ? 2 : 3;
  for (let index = 0; index < stackCount; index += 1) {
    const slab = addBox(parent, 1.1, 0.19, 0.88, color, 0.345 + index * 0.24);
    slab.userData.stageName = label;
  }
  parent.traverse((object) => {
    if (object.isMesh) object.userData.stageName = label;
  });
}

function addPowerBi(parent) {
  const block = addBox(parent, 1.1, 0.74, 0.9, 0x2f4bff, 0.62);
  block.userData.stageName = "Power BI";
  [0.34, 0.52, 0.72].forEach((height, index) => {
    const bar = addBox(parent, 0.13, height, 0.13, index === 2 ? 0xffd166 : 0xe9edff, 0.99 + height / 2);
    bar.position.x = -0.27 + index * 0.27;
    bar.position.z = -0.15;
    bar.userData.stageName = "Power BI";
  });
  parent.traverse((object) => {
    if (object.isMesh) object.userData.stageName = "Power BI";
  });
}

function makeShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 62);
  gradient.addColorStop(0, "rgba(22, 32, 75, 0.32)");
  gradient.addColorStop(1, "rgba(22, 32, 75, 0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}
