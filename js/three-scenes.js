/*
  three-scenes.js — 3D 장면 (Three.js)
  A) 히어로 : 파편으로 이뤄진 유리 다면체 — 스크롤하면 흩어졌다 다시 모이고, 클릭하면 파동이 퍼짐. 마우스 시차.
  B) 별먼지 필드 : 홈 전체 뒤에 깔리는 깊이감 있는 입자 — 스크롤에 따라 카메라가 천천히 이동.
  C) 지구본 : 대기 글로우 + SEOUL·TOKYO 라벨 + 드래그 회전 + 궤도 위성, 서울↔도쿄 빛의 호.
  Three.js가 로딩되지 않았거나 WebGL이 없으면 조용히 건너뜁니다(사이트는 정상 동작).
  화면 밖·다른 탭에서는 렌더를 멈추고, 동작 줄이기(reduced motion) 설정이면 애니메이션을 최소화합니다.
*/
(function () {
  if (!window.THREE) return;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const ACCENT = 0x6f8cff, ACCENT_SOFT = 0xa9b8ff;
  const lerp = (a, b, t) => a + (b - a) * t;

  function makeRenderer(canvas, dpr = DPR) {
    try {
      const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
      r.setPixelRatio(dpr);
      r.setClearColor(0x000000, 0);
      return r;
    } catch (e) { return null; }
  }
  // 캔버스 크기가 바뀌면 렌더러·카메라를 맞춤
  function fit(r, cam, canvas) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    if (canvas.width !== Math.round(w * r.getPixelRatio()) || canvas.height !== Math.round(h * r.getPixelRatio())) {
      r.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    return true;
  }
  const isVisible = (el) => {
    if (document.hidden || !el || el.hidden || el.closest(".view[hidden]")) return false;
    const b = el.getBoundingClientRect();
    return b.bottom > 0 && b.top < innerHeight;
  };

  // 둥근 점 텍스처 (PointsMaterial 기본은 네모라서 부드러운 원으로)
  const dotTexture = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.4, "rgba(255,255,255,.8)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); return t;
  })();

  // 마우스 위치(-0.5~0.5)는 여러 장면이 공유
  let mx = 0, my = 0;
  window.addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

  // ===== A) 히어로 오브젝트 : 파편 다면체 =====
  function heroObject() {
    const canvas = document.getElementById("hero3d");
    if (!canvas) return;
    const r = makeRenderer(canvas); if (!r) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    cam.position.z = 8;
    const group = new THREE.Group(); scene.add(group);

    // 다면체를 삼각형 파편으로 쪼갬 : 파편마다 바깥 방향(중심에서의 방향)을 기억해 두고 흩어질 때 그 방향으로 밀어냄
    const base = new THREE.IcosahedronGeometry(2.3, 1).toNonIndexed();
    const pos = base.attributes.position;
    const shards = [];
    const shardMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.08, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const edgeMat = new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.55 });
    for (let i = 0; i < pos.count; i += 3) {
      const a = new THREE.Vector3().fromBufferAttribute(pos, i);
      const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
      const c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
      const center = a.clone().add(b).add(c).multiplyScalar(1 / 3);
      const g = new THREE.BufferGeometry().setFromPoints([a.clone().sub(center), b.clone().sub(center), c.clone().sub(center)]);
      const mesh = new THREE.Mesh(g, shardMat);
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat));
      mesh.position.copy(center);
      mesh.userData = {
        home: center.clone(), dir: center.clone().normalize(),
        spin: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2.4),
        seed: Math.random() * Math.PI * 2,
      };
      group.add(mesh); shards.push(mesh);
    }
    // 안쪽 반투명 유리 덩어리 + 발광 코어 + 글로우
    const glass = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 2), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false }));
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), new THREE.MeshBasicMaterial({ color: ACCENT_SOFT, transparent: true, opacity: 0.95 }));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 24), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false }));
    group.add(glass, core, glow);
    // 얇은 궤도 링 두 개
    const ringMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.006, 6, 180), ringMat); ring1.rotation.x = Math.PI / 2.3;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.004, 6, 180), ringMat); ring2.rotation.x = Math.PI / 1.7; ring2.rotation.y = 0.6;
    group.add(ring1, ring2);
    // 궤도 파티클
    const N = 240, pp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(2.7 + Math.random() * 1.4);
      pp[i * 3] = v.x; pp[i * 3 + 1] = v.y; pp[i * 3 + 2] = v.z;
    }
    const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: ACCENT_SOFT, size: 0.06, map: dotTexture, transparent: true, opacity: 0.9, depthWrite: false }));
    group.add(pts);

    // 클릭 파동 : 화면(히어로) 어디를 눌러도 코어에서 링이 퍼져 나가고 파편이 잠깐 밀려남
    const ripples = [];
    const rippleGeo = new THREE.RingGeometry(0.98, 1, 96);
    let shock = 0;
    const hero = canvas.closest(".hero") || canvas;
    hero.addEventListener("pointerdown", (e) => {
      if (e.target.closest("a, button")) return;
      const m = new THREE.Mesh(rippleGeo, new THREE.MeshBasicMaterial({ color: ACCENT_SOFT, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
      m.userData = { t: 0 };
      scene.add(m); ripples.push(m);
      shock = 1;
    });

    // 스크롤 진행도(0~1) : 히어로가 화면 밖으로 나가는 동안 파편이 흩어졌다가(중간) 다시 모임(끝)
    let scrollP = 0;
    const onScroll = () => { scrollP = Math.max(0, Math.min(1, scrollY / (hero.offsetHeight || innerHeight))); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

    let t = 0, rx = 0, ry = 0, rz = 0;
    (function frame() {
      requestAnimationFrame(frame);
      if (!isVisible(canvas) || !fit(r, cam, canvas)) return;
      if (!REDUCED) t += 0.004;
      group.scale.setScalar(cam.aspect < 0.8 ? 0.72 : 1); // 세로 화면(모바일)에서는 글자를 덜 가리도록 작게
      // 흩어짐 정도 : 스크롤 중간에 최대 + 느린 호흡 + 클릭 충격
      const breathe = REDUCED ? 0 : (Math.sin(t * 1.6) + 1) * 0.08;
      const scatter = Math.sin(scrollP * Math.PI) * 1.6 + breathe + shock * 0.9;
      shock = Math.max(0, shock - 0.02);
      shards.forEach((s) => {
        const u = s.userData;
        const wobble = REDUCED ? 0 : Math.sin(t * 3 + u.seed) * 0.05;
        s.position.copy(u.home).addScaledVector(u.dir, scatter + wobble);
        const k = scatter * 0.9;
        s.rotation.set(u.spin.x * k, u.spin.y * k, u.spin.z * k);
      });
      // 마우스 시차(부드럽게 따라감)
      rx = lerp(rx, Math.sin(t * 0.7) * 0.22 + my * 0.6, 0.06);
      ry = lerp(ry, t + mx * 0.9, 0.08);
      rz = lerp(rz, mx * 0.25, 0.06);
      group.rotation.set(rx, ry, rz);
      pts.rotation.y = -t * 0.7;
      ring1.rotation.z = t * 0.6; ring2.rotation.z = -t * 0.4;
      const pulse = 1 + Math.sin(t * 3) * 0.05 + shock * 0.4;
      core.scale.setScalar(pulse); glow.scale.setScalar(1 + Math.sin(t * 3) * 0.18 + shock * 0.8);
      // 파동 링 진행
      for (let i = ripples.length - 1; i >= 0; i--) {
        const m = ripples[i]; m.userData.t += 0.02;
        const k = m.userData.t;
        m.scale.setScalar(0.4 + k * 5.5);
        m.material.opacity = 0.9 * (1 - k);
        m.lookAt(cam.position);
        if (k >= 1) { scene.remove(m); m.material.dispose(); ripples.splice(i, 1); }
      }
      r.render(scene, cam);
    })();
  }

  // ===== B) 홈 전체 별먼지 필드 =====
  function starField() {
    const canvas = document.getElementById("field3d");
    if (!canvas) return;
    const r = makeRenderer(canvas, Math.min(DPR, 1.5)); if (!r) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 120);
    const N = 900, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    const c1 = new THREE.Color(ACCENT_SOFT), c2 = new THREE.Color(0xffffff);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
      pos[i * 3 + 2] = -Math.random() * 60;
      const c = Math.random() < 0.35 ? c1 : c2;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const near = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.26, map: dotTexture, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true, depthWrite: false }));
    scene.add(near);
    // 뒤쪽에 더 작고 흐린 층 하나 (깊이감)
    const far = near.clone(); far.material = near.material.clone(); far.material.size = 0.14; far.material.opacity = 0.45;
    far.position.z = -25; far.rotation.z = 1.2; scene.add(far);
    // 성긴 연결선(노드 네트워크) — 앞쪽 몇 개만
    const lines = [], lp = [];
    for (let i = 0; i < 60; i++) {
      const a = Math.floor(Math.random() * N), b = Math.floor(Math.random() * N);
      const va = new THREE.Vector3(pos[a * 3], pos[a * 3 + 1], pos[a * 3 + 2]), vb = new THREE.Vector3(pos[b * 3], pos[b * 3 + 1], pos[b * 3 + 2]);
      if (va.distanceTo(vb) < 9) lp.push(va, vb);
    }
    if (lp.length) scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.14 })));

    let t = 0, cy = 0;
    (function frame() {
      requestAnimationFrame(frame);
      if (!isVisible(canvas) || !fit(r, cam, canvas)) return;
      if (!REDUCED) t += 0.0015;
      // 스크롤에 따라 카메라가 아래로 (콘텐츠보다 느리게 → 시차)
      const target = -(scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) * 40;
      cy = lerp(cy, target, 0.05);
      cam.position.set(mx * 1.5, cy - my * 1.0, 8);
      near.rotation.z = t; far.rotation.z = 1.2 - t * 0.6;
      r.render(scene, cam);
    })();
  }

  // ===== C) 서울 ↔ 도쿄 지구본 =====
  function globe() {
    const canvas = document.getElementById("globe3d");
    if (!canvas) return;
    const r = makeRenderer(canvas); if (!r) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    cam.position.z = 11; // 대기 글로우·위성 궤도(반지름 3.4)까지 캔버스 안에 들어오도록
    const group = new THREE.Group(); scene.add(group);
    const R = 2;

    const toV3 = (lat, lon, radius = R) => {
      const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
      return new THREE.Vector3(radius * Math.cos(la) * Math.sin(lo), radius * Math.sin(la), radius * Math.cos(la) * Math.cos(lo));
    };

    // 와이어프레임 지구 + 내부 구
    group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 40, 26), new THREE.MeshBasicMaterial({ color: 0x2c3556, wireframe: true, transparent: true, opacity: 0.55 })));
    group.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 40, 26), new THREE.MeshBasicMaterial({ color: 0x0f1220, transparent: true, opacity: 0.85 })));
    // 대기 글로우 : 가장자리에서 밝아지는 프레넬 셰이더 (뒷면만 그려 테두리 빛처럼 보이게)
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 48, 32), new THREE.ShaderMaterial({
      uniforms: { c: { value: new THREE.Color(ACCENT) } },
      vertexShader: "varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vP = (modelViewMatrix * vec4(position,1.0)).xyz; gl_Position = projectionMatrix * vec4(vP,1.0); }",
      fragmentShader: "uniform vec3 c; varying vec3 vN; varying vec3 vP; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(-vP))), 2.2); gl_FragColor = vec4(c, f * 0.7); }",
      transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    scene.add(atmo);

    // 도시 점 + 링 + 라벨
    const cityMat = new THREE.MeshBasicMaterial({ color: ACCENT_SOFT });
    const SEOUL = { lat: 37.57, lon: 126.98, name: "SEOUL" }, TOKYO = { lat: 35.68, lon: 139.69, name: "TOKYO" };
    const rings = [];
    const label = (text) => {
      const c = document.createElement("canvas"); c.width = 256; c.height = 64;
      const x = c.getContext("2d");
      x.font = "500 30px 'Space Grotesk', sans-serif"; x.fillStyle = "#ecebe6"; x.textAlign = "left"; x.textBaseline = "middle";
      x.letterSpacing = "6px"; x.fillText(text, 8, 32);
      const tex = new THREE.CanvasTexture(c); tex.minFilter = THREE.LinearFilter;
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.95, depthTest: false }));
      s.scale.set(1.1, 0.275, 1); s.center.set(0, 0.5);
      return s;
    };
    [SEOUL, TOKYO].forEach((c) => {
      const p = toV3(c.lat, c.lon, R * 1.005);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), cityMat); dot.position.copy(p); group.add(dot);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.085, 32), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
      ring.position.copy(p); ring.lookAt(p.clone().multiplyScalar(2)); group.add(ring); rings.push(ring);
      const lb = label(c.name); lb.position.copy(toV3(c.lat, c.lon, R * 1.09)).add(new THREE.Vector3(0.08, 0.06, 0)); group.add(lb);
    });

    // 서울 → 도쿄 빛의 호 + 왕복 펄스
    const a = toV3(SEOUL.lat, SEOUL.lon), b = toV3(TOKYO.lat, TOKYO.lon);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.28);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)), new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 })));
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    group.add(pulse);

    // 궤도 위성 두 개 (기울어진 얇은 궤도 링 위를 돎)
    const sats = [];
    [[R * 1.45, 0.9, 0.2], [R * 1.7, -0.6, 1.1]].forEach(([rad, tiltX, tiltY], i) => {
      const orbit = new THREE.Group(); orbit.rotation.set(tiltX, tiltY, 0);
      orbit.add(new THREE.Mesh(new THREE.TorusGeometry(rad, 0.004, 6, 160), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.22 })));
      const sat = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      orbit.add(sat); scene.add(orbit);
      sats.push({ sat, rad, speed: 0.9 - i * 0.35, phase: i * 2 });
    });

    // 드래그로 돌리기 (놓으면 천천히 제자리로)
    const BASE = -THREE.MathUtils.degToRad(133);
    let dragX = 0, dragY = 0, vx = 0, dragging = false, lx = 0, ly = 0;
    canvas.style.pointerEvents = "auto"; canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
    canvas.addEventListener("pointermove", (e) => { if (!dragging) return; vx = (e.clientX - lx) * 0.01; dragX += vx; dragY = Math.max(-0.6, Math.min(0.6, dragY + (e.clientY - ly) * 0.005)); lx = e.clientX; ly = e.clientY; });
    const release = () => { dragging = false; canvas.style.cursor = "grab"; };
    canvas.addEventListener("pointerup", release); canvas.addEventListener("pointercancel", release);

    let t = 0;
    (function frame() {
      requestAnimationFrame(frame);
      if (!isVisible(canvas) || !fit(r, cam, canvas)) return;
      if (!REDUCED) t += 0.006;
      if (!dragging) { dragX = lerp(dragX + vx, 0, 0.02); vx *= 0.9; dragY = lerp(dragY, 0, 0.03); }
      group.rotation.y = BASE + Math.sin(t * 0.6) * 0.45 + dragX;
      group.rotation.x = 0.35 + dragY;
      const k = (Math.sin(t * 1.4) + 1) / 2;
      pulse.position.copy(curve.getPoint(k));
      const s = 1 + Math.sin(t * 2.5) * 0.25; rings.forEach((rg) => rg.scale.setScalar(s));
      sats.forEach((o) => { const ang = t * o.speed + o.phase; o.sat.position.set(Math.cos(ang) * o.rad, Math.sin(ang) * o.rad, 0); });
      r.render(scene, cam);
    })();
  }

  heroObject();
  starField();
  globe();
})();
