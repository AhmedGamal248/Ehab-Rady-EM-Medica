import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  MdArrowForward,
  MdAutoAwesome,
  MdHealthAndSafety,
  MdMonitorHeart,
  MdOutlineVerified,
  MdSensors,
  MdShoppingCart,
} from "react-icons/md";
import api from "../services/api";
import MedicalProductCard from "../components/MedicalProductCard";

gsap.registerPlugin(ScrollTrigger);

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

function getProductsPayload(response) {
  return response.data?.data?.data || response.data?.data || response.data || [];
}

function createTube(points, radius, color, metalness = 0.55) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, 96, radius, 18, false);
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness: 0.24,
    emissive: new THREE.Color(color).multiplyScalar(0.05),
  });
  return new THREE.Mesh(geometry, material);
}

function createRoundedBox(width, height, depth, color) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 4, 4, 4);
  const material = new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.18,
    roughness: 0.2,
    clearcoat: 0.7,
    transmission: 0.02,
  });
  return new THREE.Mesh(geometry, material);
}

function setGroupPresentation(group, opacity, scale) {
  group.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.08);
  group.userData.presentationOpacity =
    (group.userData.presentationOpacity ?? 1) + (opacity - (group.userData.presentationOpacity ?? 1)) * 0.08;
  group.traverse((object) => {
    if (!object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      material.transparent = opacity < 1;
      material.opacity = group.userData.presentationOpacity;
      material.depthWrite = group.userData.presentationOpacity > 0.35;
    });
  });
}

function buildStethoscope() {
  const group = new THREE.Group();
  const tubing = createTube(
    [
      new THREE.Vector3(-1.1, 0.8, 0),
      new THREE.Vector3(-0.8, 0.25, 0.16),
      new THREE.Vector3(0, -0.3, 0),
      new THREE.Vector3(0.8, 0.25, -0.16),
      new THREE.Vector3(1.1, 0.8, 0),
    ],
    0.035,
    "#61d7f8",
    0.35,
  );
  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.38, 0.12, 64),
    new THREE.MeshPhysicalMaterial({
      color: "#eef8ff",
      metalness: 0.86,
      roughness: 0.12,
      clearcoat: 0.9,
    }),
  );
  chest.rotation.x = Math.PI / 2;
  chest.position.set(0, -0.72, 0);
  const diaphragm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.13, 64),
    new THREE.MeshStandardMaterial({
      color: "#9fefff",
      emissive: "#18bde6",
      emissiveIntensity: 0.35,
      metalness: 0.3,
      roughness: 0.22,
    }),
  );
  diaphragm.rotation.x = Math.PI / 2;
  diaphragm.position.set(0, -0.71, 0.02);
  const leftEar = createTube(
    [new THREE.Vector3(-1.1, 0.8, 0), new THREE.Vector3(-1.25, 1.22, 0.06)],
    0.022,
    "#d9eef7",
    0.82,
  );
  const rightEar = createTube(
    [new THREE.Vector3(1.1, 0.8, 0), new THREE.Vector3(1.25, 1.22, -0.06)],
    0.022,
    "#d9eef7",
    0.82,
  );
  group.add(tubing, chest, diaphragm, leftEar, rightEar);
  group.position.set(-0.15, -0.08, 0);
  group.rotation.set(-0.08, -0.32, 0.08);
  return group;
}

function buildBloodPressureMonitor() {
  const group = new THREE.Group();
  const monitor = createRoundedBox(1.1, 0.78, 0.18, "#f7fbff");
  monitor.position.set(0.72, -0.1, 0);
  const screen = createRoundedBox(0.68, 0.32, 0.03, "#17324a");
  screen.position.set(0.72, -0.02, 0.105);
  const cuff = createRoundedBox(0.72, 0.95, 0.25, "#b8d7e6");
  cuff.position.set(1.92, 0.02, -0.02);
  cuff.rotation.z = -0.22;
  const hose = createTube(
    [
      new THREE.Vector3(1.25, -0.28, 0.02),
      new THREE.Vector3(1.5, -0.6, 0.15),
      new THREE.Vector3(1.95, -0.48, 0.02),
    ],
    0.025,
    "#43c7e8",
    0.3,
  );
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.045),
    new THREE.MeshBasicMaterial({ color: "#66e7ff", transparent: true, opacity: 0.85 }),
  );
  glow.position.set(0.72, -0.02, 0.124);
  group.add(monitor, screen, cuff, hose, glow);
  group.position.set(-0.8, -0.12, 0.05);
  group.rotation.set(0.08, 0.28, -0.04);
  return group;
}

function buildThermometer() {
  const group = new THREE.Group();
  const body = createTube(
    [new THREE.Vector3(-0.75, -0.95, 0), new THREE.Vector3(0.65, -0.95, 0)],
    0.07,
    "#eef8ff",
    0.3,
  );
  const tip = new THREE.Mesh(
    new THREE.SphereGeometry(0.095, 32, 16),
    new THREE.MeshStandardMaterial({
      color: "#7ce6ff",
      emissive: "#1abede",
      emissiveIntensity: 0.4,
      metalness: 0.2,
      roughness: 0.18,
    }),
  );
  tip.position.set(0.75, -0.95, 0);
  const display = createRoundedBox(0.36, 0.11, 0.03, "#1a445d");
  display.position.set(-0.12, -0.95, 0.075);
  group.add(body, tip, display);
  group.position.set(-0.15, 0.28, 0);
  group.rotation.set(0.18, -0.34, -0.18);
  return group;
}

function buildDiagnosticTool() {
  const group = new THREE.Group();
  const handle = createTube(
    [new THREE.Vector3(-1.42, -0.2, 0), new THREE.Vector3(-1.42, -1.15, 0)],
    0.08,
    "#eaf6fb",
    0.72,
  );
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 48, 24),
    new THREE.MeshPhysicalMaterial({
      color: "#f8fcff",
      metalness: 0.7,
      roughness: 0.16,
      clearcoat: 0.8,
    }),
  );
  head.position.set(-1.42, -0.08, 0);
  const lens = new THREE.Mesh(
    new THREE.CircleGeometry(0.12, 42),
    new THREE.MeshBasicMaterial({ color: "#76eeff", transparent: true, opacity: 0.9 }),
  );
  lens.position.set(-1.42, -0.06, 0.215);
  group.add(handle, head, lens);
  group.position.set(1.1, 0.25, 0);
  group.rotation.set(0.15, -0.28, 0.18);
  return group;
}

function MedicalScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCompactViewport = window.matchMedia("(max-width: 760px)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, canvas });
    const pointer = new THREE.Vector2();
    const productRig = new THREE.Group();
    const glowRig = new THREE.Group();
    let activeDeviceIndex = 0;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactViewport ? 1.25 : 1.6));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    camera.position.set(0, 0.05, 6.2);

    const keyLight = new THREE.DirectionalLight("#f9fdff", 4.4);
    keyLight.position.set(2.8, 3.8, 4.4);
    const cyanLight = new THREE.PointLight("#58e5ff", 32, 10);
    cyanLight.position.set(-2.7, 1.6, 2.2);
    const silverLight = new THREE.PointLight("#dcebf4", 8, 8);
    silverLight.position.set(2.8, -1.8, 2.8);
    scene.add(new THREE.AmbientLight("#dceef8", 1.7), keyLight, cyanLight, silverLight);

    const devices = [
      buildStethoscope(),
      buildBloodPressureMonitor(),
      buildThermometer(),
      buildDiagnosticTool(),
    ];
    const deviceLabels = ["stethoscope", "blood-pressure-monitor", "thermometer", "diagnostic-tool"];
    devices.forEach((device, index) => {
      device.userData.baseRotation = device.rotation.clone();
      device.userData.floatOffset = index * 0.75;
      productRig.add(device);
    });
    scene.add(productRig);

    const particles = new THREE.BufferGeometry();
    const particleCount = isCompactViewport ? 72 : 150;
    const positions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 8;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[index * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleSystem = new THREE.Points(
      particles,
      new THREE.PointsMaterial({
        color: "#6cecff",
        size: 0.018,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    scene.add(particleSystem);

    [1.35, 1.85, 2.35].forEach((radius, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.004, 12, 160),
        new THREE.MeshBasicMaterial({ color: "#7deeff", transparent: true, opacity: 0.16 - index * 0.035 }),
      );
      ring.rotation.x = Math.PI / 2.4 + index * 0.14;
      ring.rotation.y = index * 0.4;
      glowRig.add(ring);
    });
    scene.add(glowRig);

    const cameraTween = gsap.timeline({
      scrollTrigger: {
        trigger: ".med-story",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.1,
      },
    });
    if (!reducedMotion) {
      cameraTween
        .to(camera.position, { x: -0.55, y: 0.2, z: 5.1, ease: "power2.inOut" })
        .to(camera.position, { x: 0.78, y: -0.05, z: 4.65, ease: "power2.inOut" })
        .to(camera.position, { x: 0.15, y: 0.35, z: 5.35, ease: "power2.inOut" });
      cameraTween.to(productRig.rotation, { y: Math.PI * 1.9, x: 0.16, ease: "power2.inOut" }, 0);
    }

    const chapterTriggers = gsap.utils.toArray(".chapter-card").map((element, index) =>
      ScrollTrigger.create({
        trigger: element,
        start: "top 62%",
        end: "bottom 42%",
        onEnter: () => {
          activeDeviceIndex = index;
        },
        onEnterBack: () => {
          activeDeviceIndex = index;
        },
      }),
    );

    const handlePointer = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("pointermove", handlePointer);
    window.addEventListener("resize", handleResize);

    let animationFrame = 0;
    let renderFrames = 0;
    const render = () => {
      const elapsed = performance.now() * 0.001;
      if (!document.hidden && !reducedMotion) {
        productRig.rotation.y += 0.0025;
        productRig.rotation.x += (pointer.y * 0.08 - productRig.rotation.x) * 0.035;
        productRig.position.x += (pointer.x * 0.18 - productRig.position.x) * 0.035;
        glowRig.rotation.z = elapsed * 0.08;
        particleSystem.rotation.y = elapsed * 0.025;
        cyanLight.intensity = 24 + Math.sin(elapsed * 1.5) * 5;
        devices.forEach((device, index) => {
          const isActive = index === activeDeviceIndex;
          const targetOpacity = isActive ? 1 : 0;
          const targetScale = isActive ? 1.18 : 0.72;
          device.visible = isActive || (device.userData.presentationOpacity ?? 1) > 0.03;
          device.rotation.x =
            device.userData.baseRotation.x + Math.sin(elapsed * 0.8 + device.userData.floatOffset) * 0.025;
          device.rotation.z =
            device.userData.baseRotation.z + Math.cos(elapsed * 0.65 + device.userData.floatOffset) * 0.018;
          setGroupPresentation(device, targetOpacity, targetScale);
        });
      }
      renderer.render(scene, camera);
      renderFrames += 1;
      if (renderFrames === 1 || renderFrames % 30 === 0) {
        canvas.dataset.renderFrames = String(renderFrames);
        canvas.dataset.webgl = "active";
        canvas.dataset.activeDevice = deviceLabels[activeDeviceIndex];
      }
      animationFrame = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", handlePointer);
      window.removeEventListener("resize", handleResize);
      cameraTween.kill();
      chapterTriggers.forEach((trigger) => trigger.kill());
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return <canvas aria-label="Realtime 3D medical product visualization" className="medical-webgl" ref={canvasRef} />;
}

export default function HomePage() {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const productChapters = t("premiumHome.productChapters", { returnObjects: true });
  const metrics = t("premiumHome.metrics", { returnObjects: true });
  const signals = t("premiumHome.signals", { returnObjects: true });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reducedMotion
      ? null
      : new Lenis({
          duration: 1,
          easing: (time) => Math.min(1, 1.001 - 2 ** (-10 * time)),
          smoothWheel: true,
          wheelMultiplier: 0.9,
        });
    let animationFrame = 0;
    const raf = (time) => {
      lenis?.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      animationFrame = requestAnimationFrame(raf);
    }

    api
      .get("/products")
      .then((res) => setFeaturedProducts(getProductsPayload(res).slice(0, 3)))
      .catch(() => {});

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".med-hero__copy > *, .reveal-up, .chapter-card", {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });
        return;
      }

      gsap.from(".med-hero__copy > *", {
        autoAlpha: 0,
        y: 34,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.11,
      });
      gsap.utils.toArray(".reveal-up").forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 54,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
          },
        });
      });
      gsap.utils.toArray(".chapter-card").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0.35, y: 90, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 76%",
              end: "bottom 38%",
              scrub: 0.8,
            },
          },
        );
      });
      gsap.to(".dashboard-float--left", {
        yPercent: -28,
        ease: "none",
        scrollTrigger: {
          trigger: ".med-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
      gsap.to(".dashboard-float--right", {
        yPercent: 35,
        ease: "none",
        scrollTrigger: {
          trigger: ".med-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });

    return () => {
      ctx.revert();
      if (animationFrame) cancelAnimationFrame(animationFrame);
      lenis?.destroy();
    };
  }, []);

  const productsToShow = featuredProducts.length > 0 ? featuredProducts : imageProducts;

  return (
    <div className="page med-page">
      <MedicalScene />

      <section className="med-hero">
        <div className="container med-hero__inner">
          <div className="med-hero__copy">
            
            <h1>EM Medica</h1>
            <div className="med-hero__actions">
              <Link className="button button--secondary button--large med-button" to="/products">
                {t("premiumHome.exploreDevices")}
                <MdArrowForward className="flow-arrow" size={18} />
              </Link>
              <Link className="button button--secondary button--large med-button med-button--glass" to="/cart">
                {t("premiumHome.procurementCart")}
                <MdShoppingCart size={18} />
              </Link>
            </div>
          </div>

          <div className="dashboard-float dashboard-float--left" data-depth="1.2">
            <span>{t("premiumHome.pulseTelemetry")}</span>
            <strong>{t("premiumHome.pulseValue")}</strong>
            <div className="ecg-line" />
          </div>

          <div className="dashboard-float dashboard-float--right" data-depth="1.8">
            <span>{t("premiumHome.deviceReadiness")}</span>
            <strong>{t("premiumHome.deviceReadinessValue")}</strong>
            <div className="radial-meter">
              <i />
            </div>
          </div>
        </div>
      </section>

      <section className="med-metrics reveal-up">
        <div className="container med-metrics__grid">
          {metrics.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="med-story">
        <div className="container med-story__grid">
          <div className="story-sticky reveal-up">
            
          </div>
          <div className="chapter-stack">
            {productChapters.map((chapter) => (
              <article className="chapter-card" key={chapter.title}>
                <span>{chapter.label}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.body}</p>
                <strong>{chapter.metric}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      

      <section className="container med-products reveal-up">
        <div className="section-heading section-heading--inline med-heading">
         
          <Link className="button button--secondary med-button med-button--glass" to="/products">
            {t("premiumHome.viewAllProducts")}
            <MdArrowForward className="flow-arrow" size={18} />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="product-grid product-grid--featured">
            {featuredProducts.map((product) => (
              <MedicalProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="showcase-grid">
            {productsToShow.map((product) => (
              <Link className="showcase-card" key={product.name} to="/products">
                <img alt={product.name} src={product.image} />
                <div>
                  <span>{t("premiumHome.readyToShip")}</span>
                  <strong>{product.name}</strong>
                  <small>{product.price}</small>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    
    </div>
  );
}
