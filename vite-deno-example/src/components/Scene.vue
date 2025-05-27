<script setup lang="ts">

import { onMounted, onUnmounted, ref } from "vue";
import * as THREE from "npm:three";

const canvasRef = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let cube: THREE.Mesh;
let animationFrameId: number;

onMounted(() => {
  if (!canvasRef.value) return;

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x00FF00)
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  
  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Geometry
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  camera.position.z = 5;

  // Animation
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);
    
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
  };
  
  animate();

  // Handle window resize
  window.addEventListener('resize', onWindowResize);
});

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  cancelAnimationFrame(animationFrameId);
});
</script>

<template>
  <canvas id="canvas" ref="canvasRef"></canvas>
</template>

<style scoped>
#canvas{
position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
