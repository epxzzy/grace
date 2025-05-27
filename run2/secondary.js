import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

let mixer;
let isAnimating = false;
let animationStartTime;

const ANIMATION_DURATION = 3500; 

const cameraPathPoints = [
  new THREE.Vector3(0, 30, -40),  // tippy top
  new THREE.Vector3(0, 20, -30),  // tippy top
  new THREE.Vector3(0, 10, -20),  // tippy top
  new THREE.Vector3(0, 7, -15),  // front
  new THREE.Vector3(0, 4, -10),  // front
  new THREE.Vector3(0, 2, -7),  // front
  new THREE.Vector3(0, 0.5, -3), // end 

];

const targetPosition = new THREE.Vector3(0, 0.5, 4);  

let currentSegment = 0;

const clock = new THREE.Clock();
const container = document.getElementById( 'container' );

const stats = new Stats();
container.appendChild( stats.dom );

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

const pmremGenerator = new THREE.PMREMGenerator( renderer );

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0xbfe3dd );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment(), 0.04 ).texture;

const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 100 );
camera.position.set( 0, 0, 0 );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0.5, 0 );
controls.update();
controls.enablePan = true;
controls.enableDamping = true;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './gltf/' );

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );
loader.load( './assets/buildings.glb', function ( gltf ) {

  const model = gltf.scene;
  //model.position.set( 1, 1, 0 );
  //model.scale.set( 0.01, 0.01, 0.01 );
  scene.add( model );

  //mixer = new THREE.AnimationMixer( model );
  //mixer.clipAction( gltf.animations[ 0 ] ).play();

  renderer.setAnimationLoop( animate );

}, undefined, function ( e ) {

    console.error( e );

  } );


document.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'c' && !isAnimating) {
    isAnimating = true;
    animationStartTime = Date.now();
    controls.enabled = false;
    currentSegment = 0;
    camera.position.copy(cameraPathPoints[0]);
  }
});
 

window.onresize = function () {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

};

function animate() {
  if (isAnimating) {
    const elapsed = Date.now() - animationStartTime;
    const totalProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
    
   const easedProgress = easeInOutExpo(totalProgress)// ease-in-cubic 
    
    const currentPosition = new THREE.Vector3();
    const pathLength = cameraPathPoints.length;
    
    let totalDistance = 0;
    const segmentDistances = [];
    for (let i = 1; i < pathLength; i++) {
      const distance = cameraPathPoints[i-1].distanceTo(cameraPathPoints[i]);
      segmentDistances.push(distance);
      totalDistance += distance;
    }
    
    let accumulated = 0;
    let currentSegment = 0;
    let segmentProgress = 0;
    
    const targetDistance = easedProgress * totalDistance;
    
    for (let i = 0; i < segmentDistances.length; i++) {
      if (accumulated + segmentDistances[i] >= targetDistance) {
        currentSegment = i;
        segmentProgress = (targetDistance - accumulated) / segmentDistances[i];
        break;
      }
      accumulated += segmentDistances[i];
    }
    
    const startPoint = cameraPathPoints[currentSegment];
    const endPoint = cameraPathPoints[currentSegment + 1];
    
    camera.position.lerpVectors(startPoint, endPoint, segmentProgress);
    
    camera.lookAt(targetPosition);

    if (totalProgress >= 1) {
      isAnimating = false;
      controls.enabled = true;
    }
  } else {
    controls.update();
  }

  renderer.render(scene, camera);
}

function sawtoothWave(t, period, amplitude) {
    return (2 * amplitude / Math.PI) * Math.atan(Math.tan(Math.PI * (t / period)));
}

function easeInOutExpo(x){
return x === 0
  ? 0
  : x === 1
  ? 1
  : x < 0.5 ? Math.pow(3, 20 * x - 10) / 2
  : (2 - Math.pow(2, -20 * x + 10)) / 2;

}
