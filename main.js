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
  const sphereGeometry = new THREE.SphereGeometry(1.3, 45, 45);
  const cloudGeometry = new THREE.SphereGeometry(1.314, 45, 45);
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

  // Cloud Spheres with different textures for Earth and Scilla
  const earthCloudTexture = textureLoader.load("./earth/clouds.jpg"); // Cloud texture for Earth
  const scillaCloudTexture = textureLoader.load("./csilla/clouds.png"); // Cloud texture for Scilla

  // Cloud sphere for Earth
  const earthCloudMaterial = new THREE.MeshStandardMaterial({
    map: earthCloudTexture,
    transparent: true,
    opacity: 0.2, // Adjust opacity for transparency
  });

  const earthCloudSphere = new THREE.Mesh(cloudGeometry, earthCloudMaterial);
  const earthAngle = (1 / 4) * (Math.PI * 2); // Same position as Earth
  earthCloudSphere.position.set(orbitRadius * Math.cos(earthAngle), 0, orbitRadius * Math.sin(earthAngle));

  // Cloud sphere for Scilla
  const scillaCloudMaterial = new THREE.MeshStandardMaterial({
    map: scillaCloudTexture,
    transparent: true,
    opacity: 0.8, // Adjust opacity for transparency
  });

  const scillaCloudSphere = new THREE.Mesh(cloudGeometry, scillaCloudMaterial);
  const scillaAngle = (0 / 4) * (Math.PI * 2);
  scillaCloudSphere.position.set(orbitRadius * Math.cos(scillaAngle), 0, orbitRadius * Math.sin(scillaAngle));

  // Rotating clouds effect
  let cloudRotationSpeed = 0.001;

  spheres.rotation.x = 0.1;
  spheres.position.y = -0.8;
  scene.add(spheres);

  const clouds = new THREE.Group();
  clouds.add(earthCloudSphere);
  clouds.add(scillaCloudSphere);
  clouds.rotation.x = 0.1;
  clouds.position.y = -0.8;
  clouds.position.z = 0.01;
  scene.add(clouds);


  // Throttled Scroll Handler
  let isThrottling = false;
  const throttleDelay = 2000; // 2 seconds throttle delay
  let scrollCount = 0;

  // Handle scroll event for both desktop and mobile
  let lastTouchY = 0;

  function throttledEffect() {
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
    gsap.to(clouds.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}`,
      ease: "power2.inOut",
    });


  }

  // Throttled wheel or touch scroll handler
  function throttledWheelHandler(event) {
    if (isThrottling) return;

    isThrottling = true;
    setTimeout(() => (isThrottling = false), throttleDelay);

    throttledEffect();
  }

  // Mouse wheel event (desktop)
  window.addEventListener("wheel", throttledWheelHandler);

  // Touch event handler for mobile devices
  window.addEventListener("touchstart", (event) => {
    lastTouchY = event.touches[0].clientY;
  });

  window.addEventListener("touchmove", (event) => {
    const deltaY = event.touches[0].clientY - lastTouchY;

    // Only trigger the scroll effect if swiping vertically
    if (Math.abs(deltaY) > 50) {
      throttledWheelHandler();
      lastTouchY = event.touches[0].clientY;
    }
  });

  // Resize handling for responsiveness
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Continuous rotation of individual spheres
    spheresMesh.forEach((sphere) => {
      sphere.rotation.y = elapsedTime * 0.015;
    });

    // Rotate cloud spheres to simulate cloud movement
    earthCloudSphere.rotation.y += cloudRotationSpeed;
    scillaCloudSphere.rotation.y += cloudRotationSpeed;
    renderer.render(scene, camera);
  }

  animate();
});
