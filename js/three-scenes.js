/*
  three-scenes.js — 3D 장면 (Three.js)
  A) 히어로 : NOCT 글자 뒤에서 천천히 회전하는 유리 다면체 + 발광 코어 + 궤도 파티클
  C) 지구본 : 홈 문의 배너의 와이어프레임 지구본 + 서울↔도쿄를 잇는 빛의 호
  Three.js가 로딩되지 않았거나 WebGL이 없으면 조용히 건너뜁니다(사이트는 정상 동작).
*/
(function () {
  if (!window.THREE) return;
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const ACCENT = 0x6f8cff, ACCENT_SOFT = 0xa9b8ff;

  function makeRenderer(canvas) {
    try {
      const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
      r.setPixelRatio(DPR);
      r.setClearColor(0x000000, 0);
      return r;
    } catch (e) { return null; }
  }
  // 캔버스 크기가 바뀌면 렌더러·카메라를 맞춤
  function fit(r, cam, canvas) {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return false;
    if (canvas.width !== Math.round(w * DPR) || canvas.height !== Math.round(h * DPR)) {
      r.setSize(w, h, false);
      cam.aspect = w / h; cam.updateProjectionMatrix();
    }
    return true;
  }
  const isVisible = (el) => !document.hidden && !!el && !el.closest(".view[hidden]");

  // ===== A) 히어로 오브젝트 =====
  function heroObject() {
    const canvas = document.getElementById("hero3d");
    if (!canvas) return;
    const r = makeRenderer(canvas); if (!r) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    cam.position.z = 8;
    const group = new THREE.Group(); scene.add(group);

    // 바깥 와이어프레임 다면체
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.3, 1)),
      new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.5 })
    );
    group.add(wire);
    // 안쪽 반투명 유리 덩어리
    const glass = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.25, 2),
      new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending })
    );
    group.add(glass);
    // 발광 코어 + 글로우
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), new THREE.MeshBasicMaterial({ color: ACCENT_SOFT, transparent: true, opacity: 0.95 }));
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 24), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending }));
    group.add(core, glow);
    // 얇은 궤도 링 두 개
    const ringMat = new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.35 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.3, 0.006, 6, 180), ringMat); ring1.rotation.x = Math.PI / 2.3;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.004, 6, 180), ringMat); ring2.rotation.x = Math.PI / 1.7; ring2.rotation.y = 0.6;
    group.add(ring1, ring2);
    // 궤도 파티클
    const N = 240, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(2.7 + Math.random() * 1.4);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    }
    const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: ACCENT_SOFT, size: 0.035, transparent: true, opacity: 0.8 }));
    group.add(pts);

    // 마우스 위치에 따라 살짝 기울기
    let mx = 0, my = 0;
    window.addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

    let t = 0;
    (function frame() {
      requestAnimationFrame(frame);
      if (!isVisible(canvas) || !fit(r, cam, canvas)) return;
      if (!REDUCED) t += 0.004;
      group.rotation.y = t;
      group.rotation.x = Math.sin(t * 0.7) * 0.22 + my * 0.35;
      group.rotation.z = mx * 0.2;
      wire.rotation.y = -t * 0.5; wire.rotation.x = t * 0.2;
      pts.rotation.y = -t * 0.7;
      ring1.rotation.z = t * 0.6; ring2.rotation.z = -t * 0.4;
      const pulse = 1 + Math.sin(t * 3) * 0.05;
      core.scale.setScalar(pulse); glow.scale.setScalar(1 + Math.sin(t * 3) * 0.18);
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
    cam.position.z = 6.2;
    const group = new THREE.Group(); scene.add(group);
    const R = 2;

    // 위도·경도 → 구 위의 좌표 (경도 0이 카메라 정면 +z)
    const toV3 = (lat, lon, radius = R) => {
      const la = THREE.MathUtils.degToRad(lat), lo = THREE.MathUtils.degToRad(lon);
      return new THREE.Vector3(radius * Math.cos(la) * Math.sin(lo), radius * Math.sin(la), radius * Math.cos(la) * Math.cos(lo));
    };

    // 와이어프레임 지구 + 은은한 내부 구
    group.add(new THREE.Mesh(new THREE.SphereGeometry(R, 40, 26), new THREE.MeshBasicMaterial({ color: 0x2c3556, wireframe: true, transparent: true, opacity: 0.55 })));
    group.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 40, 26), new THREE.MeshBasicMaterial({ color: 0x0f1220, transparent: true, opacity: 0.85 })));

    // 도시 점 + 링
    const cityMat = new THREE.MeshBasicMaterial({ color: ACCENT_SOFT });
    const SEOUL = { lat: 37.57, lon: 126.98 }, TOKYO = { lat: 35.68, lon: 139.69 };
    const rings = [];
    [SEOUL, TOKYO].forEach((c) => {
      const p = toV3(c.lat, c.lon, R * 1.005);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), cityMat); dot.position.copy(p); group.add(dot);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.085, 32), new THREE.MeshBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
      ring.position.copy(p); ring.lookAt(p.clone().multiplyScalar(2)); group.add(ring); rings.push(ring);
    });

    // 서울 → 도쿄 빛의 호 (가운데를 살짝 띄운 곡선)
    const a = toV3(SEOUL.lat, SEOUL.lon), b = toV3(TOKYO.lat, TOKYO.lon);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.28);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const arcPts = curve.getPoints(64);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(arcPts), new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.9 })));
    // 호 위를 오가는 펄스
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    group.add(pulse);

    // 아시아가 정면에 오도록 기준 회전 (경도 133°E)
    const BASE = -THREE.MathUtils.degToRad(133);
    group.rotation.x = 0.35;

    let t = 0;
    (function frame() {
      requestAnimationFrame(frame);
      if (!isVisible(canvas) || !fit(r, cam, canvas)) return;
      if (!REDUCED) t += 0.006;
      group.rotation.y = BASE + Math.sin(t * 0.6) * 0.45; // 완전히 돌지 않고 서울·도쿄가 보이는 범위에서 흔들림
      const k = (Math.sin(t * 1.4) + 1) / 2;               // 0→1→0 왕복
      pulse.position.copy(curve.getPoint(k));
      const s = 1 + Math.sin(t * 2.5) * 0.25; rings.forEach((rg) => rg.scale.setScalar(s));
      r.render(scene, cam);
    })();
  }

  heroObject();
  globe();
})();
