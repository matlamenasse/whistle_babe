import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,200,700)
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('canvas');
const controls = new OrbitControls(camera, canvas);
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,

    antialias: true,

    // &é"lpha: true
});


renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );

window.addEventListener('resize', () => {
    // Update the camera
    camera.aspect =  window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update the renderer
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
}); 


//floor
const geometryboard = new THREE.BoxGeometry( 10000, 1, 10000 ); 
const materialboard = new THREE.MeshStandardMaterial( {color: 0xffffff} ); 
const floor = new THREE.Mesh( geometryboard, materialboard ); 
scene.add( floor );
floor.position.set(0,-10,0);
    
// Load the STL file
let mesh;
const loader = new STLLoader();
loader.load('AG.STL', function (geometry) {
    // Create a mesh using the loaded geometry
    const material = new THREE.MeshStandardMaterial({color: 0xe00b72}); // You can use other materials as well
    mesh = new THREE.Mesh(geometry, material);
    // Add the mesh to the scene
    scene.add(mesh);
    mesh.position.set(-1000,-20,0);
    mesh.scale.set(0.1, 0.1, 0.1);
    mesh.rotateY(Math.PI);
    //mesh.rotation.set(0,Math.PI / 2)
});

// Load the GLTF model (moving flamingo)
let flamingoGLTF;
let fmesh;
const loaderGLTF = new GLTFLoader();
loaderGLTF.load('Flamingo.glb', function (gltf) {
    fmesh = gltf.scene.children[0];
    const s = 0.35;
    fmesh.scale.set(s, s, s);
    fmesh.position.y = 15;
    fmesh.rotation.y = -1;
    scene.add(fmesh);

    // Create AnimationMixer and add animation
    const mixer = new THREE.AnimationMixer(fmesh);
    const clip = gltf.animations[0];
    const action = mixer.clipAction(clip);
    action.play();

    flamingoGLTF = { fmesh, mixer };
    fmesh.rotateY(-Math.PI/6);
    fmesh.position.set(1000,0,-100);
    fmesh.visible = false;
});

//load the whistle baby meme and add it on a box as a texture
var loader1 = new THREE.TextureLoader();
var texture = loader1.load('wbm.webp');
var geometry = new THREE.PlaneGeometry(400, 320); // Adjust the size as needed
var material = new THREE.MeshBasicMaterial({ map: texture });
var plane = new THREE.Mesh(geometry, material);
scene.add(plane);
plane.position.y+=100;
plane.visible=false;
let whistle=true;
let wcount;

//load sound 

var sound = new Howl({
    src: ['wb.mp3'],
    loop: true,
    volume: 0.5,
  });


let fdown;
document.addEventListener('keydown', (event) => {
    if (event.key === 'f') {
        fdown = true;
    }
});

//lights
for(let i=-1000; i<1000;i=i+100){
    const light = new THREE.PointLight( 0xffffff, 1.0, 0, 0.01 );
    scene.add( light );
    light.position.set( i, 0, 100);
}

//Background
const textureLoader = new THREE.TextureLoader();
let textureEquirec = textureLoader.load( 'HDRIElement004_1K-TONEMAPPED - Copy.jpg' );
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
textureEquirec.colorSpace = THREE.SRGBColorSpace;
scene.background = textureEquirec;


let move = false;

//Bloom
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 
    0.2
);
const outputPass = new OutputPass();

composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(outputPass);

const animate = () => {
    // mesh.rotation.y = rotation;
    // console.log(mesh);
    if (whistle&&wcount>0)
    {
        wcount-=1;
        plane.visible=true;
    }
    else
    {
        whistle=false;
        wcount=0;
        plane.visible=false;
        sound.stop();
    }
    console.log(move);
    if (fdown) {
        if (fmesh && mesh) {
            fmesh.visible = true;
            move = true;
        }
    }

    // Check if agricycle 
    if (mesh && fmesh) {
        // console.log(mesh.rotation)
        if (mesh.position.x < 1000) {
            mesh.position.x += 2;
        } else {
            mesh.position.x = -1100;
        }
    }

    if (fmesh && mesh && move==true) {

        // Adjust the condition for making fmesh invisible and resetting its position
        if (fmesh.position.x - mesh.position.x >8 ) {
            fmesh.position.x -= 4;
        } 
        else {
            plane.position.x=mesh.position.x;
            sound.play();
            fmesh.visible = false;
            fmesh.position.x = 1000;
            mesh.position.x=-1500;
            console.log(-1000);
            move = false;
            fdown = false;
            whistle=true;
            wcount=400;  
        }
    }

    // Update GLTF Flamingo animation mixer
    if (flamingoGLTF) {
        flamingoGLTF.mixer.update(0.1);
    }

    requestAnimationFrame(animate);
    controls.update();
    composer.render();
    
};

animate();