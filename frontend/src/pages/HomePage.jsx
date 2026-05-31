import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  MdArrowForward,
  MdShoppingCart,
} from "react-icons/md";
import api from "../services/api";
import { isWebGLCapable } from "../utils/formatters";
import MedicalProductCard from "../components/MedicalProductCard";
import SkeletonProductCard from "../components/SkeletonProductCard";

gsap.registerPlugin(ScrollTrigger);

/* ── Static image fallbacks ─────────────────────────────────── */
const imageProducts = [
  {
    name: "Cardiophone Stethoscope",
    image: "/images/Reister cardiophone stethoscope 0.2.jpeg",
    price: "EGP 2,850",
  },
  {
    name: "Risan Blood Pressure Monitor",
    image: "/images/Reister blood pressure monitor (Risan).jpeg",
    price: "EGP 3,950",
  },
  {
    name: "Omega Mesh Nebulizer",
    image: "/images/Omega mesh nebulizer.jpeg",
    price: "EGP 1,780",
  },
];

/* ── Helpers ─────────────────────────────────────────────────── */
function getProductsPayload(res) {
  return res.data?.data?.data || res.data?.data || res.data || [];
}

/* ── Three.js Utilities ─────────────────────────────────────── */
function createTube(points, radius, color, metalness = 0.55) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 80, radius, 14, false);
  const mat = new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness: 0.26,
    emissive: new THREE.Color(color).multiplyScalar(0.04),
  });
  return new THREE.Mesh(geo, mat);
}

function createBox(w, h, d, color) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.18,
    roughness: 0.20,
    clearcoat: 0.65,
  });
  return new THREE.Mesh(geo, mat);
}

function fadeGroup(group, targetOpacity, targetScale) {
  const currentOpacity = group.userData.opacity ?? 1;
  const nextOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.07;
  group.userData.opacity = nextOpacity;

  const currentScale = group.scale.x;
  const nextScale = currentScale + (targetScale - currentScale) * 0.07;
  group.scale.setScalar(nextScale);

  group.traverse((obj) => {
    if (!obj.isMesh) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      m.transparent = nextOpacity < 0.99;
      m.opacity = nextOpacity;
      m.depthWrite = nextOpacity > 0.3;
    });
  });
}

/* ── Device Builders ─────────────────────────────────────────── */
function buildStethoscope() {
  const g = new THREE.Group();
  const tube = createTube(
    [
      new THREE.Vector3(-1.1, 0.8, 0),
      new THREE.Vector3(-0.8, 0.25, 0.14),
      new THREE.Vector3(0, -0.3, 0),
      new THREE.Vector3(0.8, 0.25, -0.14),
      new THREE.Vector3(1.1, 0.8, 0),
    ],
    0.033, "#61d7f8", 0.32,
  );
  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.30, 0.36, 0.11, 56),
    new THREE.MeshPhysicalMaterial({ color: "#eef8ff", metalness: 0.88, roughness: 0.10, clearcoat: 0.9 }),
  );
  chest.rotation.x = Math.PI / 2;
  chest.position.set(0, -0.70, 0);
  const glow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.12, 56),
    new THREE.MeshStandardMaterial({ color: "#9fefff", emissive: "#18bde6", emissiveIntensity: 0.32, metalness: 0.28, roughness: 0.22 }),
  );
  glow.rotation.x = Math.PI / 2;
  glow.position.set(0, -0.70, 0.015);
  const le = createTube([new THREE.Vector3(-1.1, 0.8, 0), new THREE.Vector3(-1.24, 1.20, 0.05)], 0.020, "#d9eef7", 0.80);
  const re = createTube([new THREE.Vector3(1.1, 0.8, 0), new THREE.Vector3(1.24, 1.20, -0.05)], 0.020, "#d9eef7", 0.80);
  g.add(tube, chest, glow, le, re);
  g.position.set(-0.14, -0.08, 0);
  g.rotation.set(-0.07, -0.30, 0.07);
  return g;
}

function buildBloodPressure() {
  const g = new THREE.Group();
  const mon = createBox(1.1, 0.76, 0.17, "#f7fbff");
  mon.position.set(0.72, -0.10, 0);
  const scr = createBox(0.66, 0.30, 0.025, "#17324a");
  scr.position.set(0.72, -0.02, 0.105);
  const cuff = createBox(0.70, 0.92, 0.24, "#b8d7e6");
  cuff.position.set(1.90, 0.02, -0.02);
  cuff.rotation.z = -0.20;
  const hose = createTube(
    [new THREE.Vector3(1.24, -0.27, 0.02), new THREE.Vector3(1.48, -0.58, 0.14), new THREE.Vector3(1.93, -0.46, 0.02)],
    0.024, "#43c7e8", 0.28,
  );
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.50, 0.040),
    new THREE.MeshBasicMaterial({ color: "#66e7ff", transparent: true, opacity: 0.82 }),
  );
  glow.position.set(0.72, -0.02, 0.122);
  g.add(mon, scr, cuff, hose, glow);
  g.position.set(-0.80, -0.12, 0.05);
  g.rotation.set(0.07, 0.26, -0.04);
  return g;
}

function buildThermometer() {
  const g = new THREE.Group();
  const body = createTube(
    [new THREE.Vector3(-0.72, -0.95, 0), new THREE.Vector3(0.62, -0.95, 0)],
    0.065, "#eef8ff", 0.28,
  );
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.090, 28, 14),
    new THREE.MeshStandardMaterial({ color: "#7ce6ff", emissive: "#1abede", emissiveIntensity: 0.38, metalness: 0.18, roughness: 0.17 }),
  );
  tip.position.set(0.72, -0.95, 0);
  const disp = createBox(0.34, 0.10, 0.025, "#1a445d");
  disp.position.set(-0.12, -0.95, 0.072);
  g.add(body, tip, disp);
  g.position.set(-0.14, 0.28, 0);
  g.rotation.set(0.17, -0.32, -0.17);
  return g;
}

function buildDiagnostic() {
  const g = new THREE.Group();
  const handle = createTube(
    [new THREE.Vector3(-1.40, -0.20, 0), new THREE.Vector3(-1.40, -1.12, 0)],
    0.076, "#eaf6fb", 0.70,
  );
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 44, 22),
    new THREE.MeshPhysicalMaterial({ color: "#f8fcff", metalness: 0.68, roughness: 0.14, clearcoat: 0.78 }),
  );
  head.position.set(-1.40, -0.08, 0);
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.11, 38),
    new THREE.MeshBasicMaterial({ color: "#76eeff", transparent: true, opacity: 0.88 }),
  );
  lens.position.set(-1.40, -0.06, 0.212);
  g.add(handle, head, lens);
  g.position.set(1.08, 0.24, 0);
  g.rotation.set(0.14, -0.26, 0.17);
  return g;
}

/* ── WebGL Scene ─────────────────────────────────────────────── */
function MedicalScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCompact = window.innerWidth < 760;

    /* Scene setup */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.05, 6.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isCompact, canvas, powerPreference: "default" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompact ? 1.2 : 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    /* Lights */
    const keyLight = new THREE.DirectionalLight("#f9fdff", 4.2);
    keyLight.position.set(2.8, 3.8, 4.4);
    const cyanLight = new THREE.PointLight("#58e5ff", 28, 10);
    cyanLight.position.set(-2.7, 1.6, 2.2);
    const fillLight = new THREE.PointLight("#dcebf4", 7, 8);
    fillLight.position.set(2.8, -1.8, 2.8);
    scene.add(new THREE.AmbientLight("#dceef8", 1.6), keyLight, cyanLight, fillLight);

    /* Devices */
    const productRig = new THREE.Group();
    const devices = [buildStethoscope(), buildBloodPressure(), buildThermometer(), buildDiagnostic()];
    devices.forEach((d, i) => {
      d.userData.baseRot = d.rotation.clone();
      d.userData.floatOffset = i * 0.75;
      d.userData.opacity = i === 0 ? 1 : 0;
      if (i !== 0) d.scale.setScalar(0.72);
      productRig.add(d);
    });
    scene.add(productRig);

    /* Particles — fewer on mobile */
    const count = isCompact ? 60 : 130;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: "#6cecff", size: 0.016, transparent: true, opacity: 0.50, depthWrite: false }),
    );
    scene.add(particles);

    /* Rings */
    const glowRig = new THREE.Group();
    [1.35, 1.85, 2.35].forEach((r, i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.003, 10, 140),
        new THREE.MeshBasicMaterial({ color: "#7deeff", transparent: true, opacity: 0.14 - i * 0.03 }),
      );
      ring.rotation.x = Math.PI / 2.4 + i * 0.13;
      ring.rotation.y = i * 0.38;
      glowRig.add(ring);
    });
    scene.add(glowRig);

    /* Camera scroll animation */
    let cameraTween;
    if (!reducedMotion) {
      cameraTween = gsap.timeline({
        scrollTrigger: {
          trigger: ".med-story",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        },
      });
      cameraTween
        .to(camera.position, { x: -0.52, y: 0.18, z: 5.1, ease: "power2.inOut" })
        .to(camera.position, { x: 0.75, y: -0.05, z: 4.70, ease: "power2.inOut" })
        .to(camera.position, { x: 0.14, y: 0.32, z: 5.38, ease: "power2.inOut" });
      cameraTween.to(productRig.rotation, { y: Math.PI * 1.9, x: 0.15, ease: "power2.inOut" }, 0);
    }

    /* Active device tracking */
    let activeIndex = 0;
    const chapterTriggers = gsap.utils.toArray(".chapter-card").map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 64%",
        end: "bottom 40%",
        onEnter:     () => { activeIndex = i; },
        onEnterBack: () => { activeIndex = i; },
      }),
    );

    /* Pointer */
    const pointer = new THREE.Vector2();
    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    /* Resize */
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize, { passive: true });

    /* Render loop */
    let raf = 0;
    let frame = 0;

    const tick = () => {
      if (!document.hidden && !reducedMotion) {
        const t = performance.now() * 0.001;
        productRig.rotation.y += 0.0020;
        productRig.rotation.x += (pointer.y * 0.07 - productRig.rotation.x) * 0.030;
        productRig.position.x += (pointer.x * 0.16 - productRig.position.x) * 0.030;
        glowRig.rotation.z = t * 0.07;
        particles.rotation.y = t * 0.022;
        cyanLight.intensity = 22 + Math.sin(t * 1.4) * 4;

        devices.forEach((d, i) => {
          const active = i === activeIndex;
          fadeGroup(d, active ? 1 : 0, active ? 1.18 : 0.72);
          d.visible = d.userData.opacity > 0.02;
          if (d.visible) {
            d.rotation.x = d.userData.baseRot.x + Math.sin(t * 0.78 + d.userData.floatOffset) * 0.022;
            d.rotation.z = d.userData.baseRot.z + Math.cos(t * 0.62 + d.userData.floatOffset) * 0.016;
          }
        });
      }

      renderer.render(scene, camera);
      frame++;
      if (frame === 1 || frame % 60 === 0) {
        canvas.dataset.webgl = "active";
        canvas.dataset.frame = String(frame);
      }
      raf = window.requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      cameraTween?.kill();
      chapterTriggers.forEach((t) => t.kill());
      /* Dispose all geometries & materials */
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          (Array.isArray(obj.material) ? obj.material : [obj.material])
            .forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      aria-label="Real-time 3D medical product visualization"
      aria-hidden="true"
      className="medical-webgl"
      ref={canvasRef}
    />
  );
}

/* ── Home Page ─────────────────────────────────────────────────── */
export default function HomePage() {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const productChapters = t("premiumHome.productChapters", { returnObjects: true });
  const metrics = t("premiumHome.metrics", { returnObjects: true });
  const signals = t("premiumHome.signals", { returnObjects: true });

  /* Smooth scroll + API fetch */
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Lenis smooth scroll — properly integrated with GSAP */
    let lenis = null;
    let lenisRaf = null;
    let rafId = 0;

    if (!reducedMotion) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.88,
        touchMultiplier: 1.4,
      });

      /* Sync Lenis RAF with GSAP's ticker — store ref for cleanup */
      lenisRaf = (time) => { lenis.raf(time * 1000); };
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);
    }

    /* Products */
    api.get("/products")
      .then((res) => setFeaturedProducts(getProductsPayload(res).slice(0, 3)))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));

    /* GSAP animations */
    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".med-hero__copy > *, .reveal-up, .chapter-card", {
          autoAlpha: 1, y: 0, scale: 1,
        });
        return;
      }

      /* Hero entrance — staggered */
      gsap.from(".med-hero__copy > *", {
        autoAlpha: 0,
        y: 32,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.10,
        delay: 0.15,
      });

      /* Dashboard floats entrance */
      gsap.from(".dashboard-float", {
        autoAlpha: 0,
        y: 24,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.15,
        delay: 0.5,
      });

      /* Reveal on scroll */
      gsap.utils.toArray(".reveal-up").forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 50,
          duration: 0.88,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 83%" },
        });
      });

      /* Chapter cards */
      gsap.utils.toArray(".chapter-card").forEach((el) => {
        gsap.fromTo(el,
          { autoAlpha: 0.30, y: 80, scale: 0.97 },
          {
            autoAlpha: 1, y: 0, scale: 1,
            duration: 0.92, ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 77%",
              end: "bottom 36%",
              scrub: 0.9,
            },
          },
        );
      });

      /* Parallax floats */
      gsap.to(".dashboard-float--left", {
        yPercent: -26,
        ease: "none",
        scrollTrigger: {
          trigger: ".med-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.1,
        },
      });
      gsap.to(".dashboard-float--right", {
        yPercent: 32,
        ease: "none",
        scrollTrigger: {
          trigger: ".med-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.1,
        },
      });
    });

    return () => {
      ctx.revert();
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) {
        if (lenisRaf) gsap.ticker.remove(lenisRaf);
        lenis.destroy();
      }
    };
  }, []);

  const productsToShow = featuredProducts.length > 0 ? featuredProducts : imageProducts;

  return (
    <div className="page med-page">
      {isWebGLCapable() && <MedicalScene />}

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="med-hero" aria-label="Hero">
        <div className="container med-hero__inner">
          <div className="med-hero__copy">
            <h1>EM<br />Medica</h1>
            <div className="med-hero__actions">
              <Link
                className="button button--secondary button--large med-button"
                to="/products"
              >
                {t("premiumHome.exploreDevices")}
                <MdArrowForward className="flow-arrow" size={18} aria-hidden="true" />
              </Link>
              <Link
                className="button button--secondary button--large med-button med-button--glass"
                to="/cart"
              >
                {t("premiumHome.procurementCart")}
                <MdShoppingCart size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div
            className="dashboard-float dashboard-float--left"
            aria-hidden="true"
            data-depth="1.2"
          >
            <span>{t("premiumHome.pulseTelemetry")}</span>
            <strong>{t("premiumHome.pulseValue")}</strong>
            <div className="ecg-line" />
          </div>

          <div
            className="dashboard-float dashboard-float--right"
            aria-hidden="true"
            data-depth="1.8"
          >
            <span>{t("premiumHome.deviceReadiness")}</span>
            <strong>{t("premiumHome.deviceReadinessValue")}</strong>
            <div className="radial-meter"><i /></div>
          </div>
        </div>
      </section>

      {/* ── Metrics ─────────────────────────────────────────── */}
      <section className="med-metrics reveal-up" aria-label="Key metrics">
        <div className="container med-metrics__grid">
          {Array.isArray(metrics) && metrics.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      {/* ── Story / Scroll ────────────────────────────────────── */}
      <section className="med-story" aria-label="Product showcase">
        <div className="container med-story__grid">
          <div className="story-sticky reveal-up" aria-hidden="true" />
          <div className="chapter-stack">
            {Array.isArray(productChapters) && productChapters.map((ch) => (
              <article className="chapter-card" key={ch.title}>
                <span>{ch.label}</span>
                <h3>{ch.title}</h3>
                <strong>{ch.metric}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────── */}
      <section className="container med-products reveal-up" aria-label={t("premiumHome.featuredTitle")}>
        <div className="section-heading section-heading--inline med-heading">
          <div>
            <span className="eyebrow eyebrow--solid">{t("premiumHome.featuredCatalog")}</span>
          </div>
          <Link
            className="button button--secondary med-button med-button--glass"
            to="/products"
          >
            {t("premiumHome.viewAllProducts")}
            <MdArrowForward className="flow-arrow" size={18} aria-hidden="true" />
          </Link>
        </div>

        {loadingProducts ? (
          <div className="product-grid product-grid--featured">
            {[1, 2, 3].map((i) => <SkeletonProductCard key={i} />)}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="product-grid product-grid--featured">
            {featuredProducts.map((p) => (
              <MedicalProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="showcase-grid">
            {imageProducts.map((p) => (
              <Link className="showcase-card" key={p.name} to="/products">
                <img alt={p.name} src={p.image} loading="lazy" />
                <div>
                  <span>{t("premiumHome.readyToShip")}</span>
                  <strong>{p.name}</strong>
                  <small>{p.price}</small>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}