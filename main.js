import gsap from "gsap";
import "./style.css";
import * as THREE from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";

document.addEventListener("DOMContentLoaded", () => {
  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas"),
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    25,
    window.innerWidth / window.innerHeight,
    0.1,
    70
  );
  camera.position.z = 9;

  // Environment Map
  new RGBELoader().load("./moonlit_golf_1k.hdr", (texture) => {
    texture.mapping = THREE.EquirectangularRefractionMapping;
    scene.environment = texture;
  });

  // Shared Geometry and Materials
  const sphereGeometry = new THREE.SphereGeometry(1.3, 26, 26);
  const textureLoader = new THREE.TextureLoader();

  // Background Stars
  const starTexture = textureLoader.load("./stars.jpg");
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(50, 26, 26),
    new THREE.MeshStandardMaterial({
      map: starTexture,
      side: THREE.BackSide,
    })
  );
  scene.add(star);

  // Spheres
  const orbitRadius = 4.5;
  const textures = [
    "./csilla/color.png",
    "./earth/map.jpg",
    "./venus/map.jpg",
    "./volcanic/color.png",
  ];

  const spheres = new THREE.Group();
  const spheresMesh = textures.map((texturePath, i) => {
    const texture = textureLoader.load(texturePath);
    const material = new THREE.MeshStandardMaterial({ map: texture });

    const sphere = new THREE.Mesh(sphereGeometry, material);
    const angle = (i / 4) * (Math.PI * 2);
    sphere.position.set(
      orbitRadius * Math.cos(angle),
      0,
      orbitRadius * Math.sin(angle)
    );

    spheres.add(sphere);
    return sphere;
  });

  spheres.rotation.x = 0.1;
  spheres.position.y = -0.8;
  scene.add(spheres);

  // Throttled Scroll Handler
  let isThrottling = false;
  const throttleDelay = 2000;
  let scrollCount = 0;

  function throttledWheelHandler(event) {
    if (isThrottling) return;

    isThrottling = true;
    setTimeout(() => (isThrottling = false), throttleDelay);

    scrollCount = (scrollCount + 1) % 4;

    const headings = document.querySelectorAll(".heading");
    gsap.to(headings, {
      duration: 1,
      y: scrollCount === 0 ? "0%" : `-=${100}%`,
      ease: "power2.inOut",
    });

    gsap.to(spheres.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}`,
      ease: "power2.inOut",
    });
  }

  window.addEventListener("wheel", throttledWheelHandler);

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    spheresMesh.forEach((sphere) => {
      sphere.rotation.y = elapsedTime * 0.015;
    });

    renderer.render(scene, camera);
  }

  animate();
});
