import './style.css';
import * as THREE from 'three';
import { GLTFExporter } from '../node_modules/three/examples/jsm/exporters/GLTFExporter';

// Canvas

const canvasMain = document.querySelector('canvas.webgl')

// Scene

const scene = new THREE.Scene()

// Size - Fixed to make sure PNG exports look decent.

const sizes = {
    width: 800,
    height: 800 
}

// Renderer

const renderer = new THREE.WebGLRenderer({
    canvas: canvasMain,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor( 0xffffff, 0);

// Base camera 

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 2000)
camera.lookAt(0,0,0);

// Objects & Global Vars

let shape = new THREE.Object3D();
const cube = new THREE.BoxGeometry( 1,1,1 );
var shapeLength = 0;
var shapeDNA = [];
var dnaList = [];
let lights = new THREE.Object3D();
var outputReady = false;

// Materials

var image = new Image();
image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gIIBBcNz4Z5RwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEkklEQVR42u3X0QmAMBBEwV2x/5bPGgwIIc5UEDYfj2uSCQC8dJkAAAEBQEAAEBAABAQABAQAAQFAQAAQEAAEBAAEBAABAUBAABAQAAQEAAQEAAEBQEAAEBAABAQABAQAAQFAQAAQEAAEBAAEBAABAUBAABAQAAQEAAQEAAEBQEAAEBAABAQABAQAAQFAQAAQEABI7t0fODN+Cfilti4QAM4jIAAICAACAoCAACAgACAgAAgIAAICgIAAICAAICAACAgAAgKAgAAgIAAgIAAICAACAoCAACAgACAgAAgIAAICgIAAICAAICAACAgAAgKAgAAgIAAgIAAICAACAoCAACAgACAgAAgIAAICgIAAgIAAICAACAgAAgKAgACAgAAgIAAICAACAoCAAICAACAgAAgIAAICgIAAgIAAICAACAgAAgKAgACAgAAgIAAICAACAoCAAICAACAgAAgIAAICgIAAgIAAICAACAgAAgKAgJgAAAEBQEAAEBAABAQABAQAAQFAQAAQEAAEBAAEBAABAUBAABAQAAQEAAQEAAEBQEAAEBAABAQABAQAAQFAQAAQEAAEBAAEBAABAUBAABAQAAQEAAQEAAEBQEAAEBAABAQABAQAAQFAQAAQEAAQEAAEBAABAUBAABAQABAQAAQEAAEBQEAAEBAAEBAABAQAAQFAQAAQEAAQEAAEBAABAUBAABAQABAQAAQEAAEBQEAAEBAAEBAABAQAAQFAQAAQEAAQEAAEBAABAUBAABAQABAQAAQEAAEBQEAAQEAAEBAABAQAAQFAQABAQAAQEAAEBAABAUBAAEBAABAQAAQEAAEBQEAAQEAAEBAABAQAAQFAQABAQAAQEAAEBAABAUBAAEBAABAQAAQEAAEBQEAAQEAAEBAABAQAAQEAAQFAQAAQEAAEBAABAQABAUBAABAQAAQEAAEBAAEBQEAAEBAABAQAAQEAAQFAQAAQEAAEBAABAQABAUBAABAQAAQEAAEBAAEBQEAAEBAABAQAAQEAAQFAQAAQEAAEBAABAQABAUBAABAQAAQEAAQEAAEBQEAAEBAABAQABAQAAQFAQAAQEAAEBAAEBAABAUBAABAQAAQEAAQEAAEBQEAAEBAABAQABAQAAQFAQAAQEAAEBAAEBAABAUBAABAQAAQEAAQEAAEBQEAAEBAAEBAABAQAAQFAQAAQEAAQEAAEBAABAUBAABAQABAQAAQEAAEBQEAAEBAAEBAABAQAAQFAQAAQEAAQEAAEBAABAUBAABAQABAQAAQEAAEBQEAAEBAAEBAABAQAAQFAQAAQEAAQEAAEBAABAUBAAEBAABAQAAQEAAEBQEAAQEAAEBAABAQAAQFAQABAQAAQEAAEBAABAUBAAEBAABAQAAQEAAEBQEAAQEAA+EKTjBkAcIEAICAACAgAAgIAAgKAgAAgIAAICAACAgACAoCAACAgAAgIAAICAAICgIAAICAACAgAAgIAAgKAgAAgIAAICAACAgACAoCAACAgAAgIAAICAAICgIAAICAACAgAAgIAAgKAgAAgIAAICAACAgALHlmBCB9nvDEtAAAAAElFTkSuQmCC';

const cubeTexture = new THREE.Texture()
cubeTexture.image = image;
image.onload = function() {
    cubeTexture.needsUpdate = true;
}

const material = new THREE.MeshStandardMaterial( { color: 0xffffff, map: cubeTexture, wireframe: false } );

// Shape Creation

function createShape() {

    let [x,y,z] = [0,0,0]

    // Creates a lazily random configuration of blocks
    while (shapeLength < 12) {
        addCube(x,y,z);
        // Drops the 0,0,0 from the beginning of every shape
        if( x+y+z != 0) {
            shapeDNA.push(([x,y,z]));
        }
        let rand = Math.random();
        if(rand > .6666) {
            x++;
        } else if(rand > .3333) {
            y++;
        } else {
            z++;
        }
    }

    if (isDnaUnique(dnaList,shapeDNA)) {
        dnaList.push(shapeDNA);
    } else {
        resetShape();
    }

    // Moving shape components so that they are centered

    let [shapeX, shapeY, shapeZ] = [((x)/2.0),((y)/2.0),((z)/2.0)];
    shape.children.forEach(child => {
        child.translateX(-shapeX);
        child.translateY(-shapeY);
        child.translateZ(-shapeZ);
    });

    scene.add(shape);

    // Calculating distance for Lights and Camera
    let radius = Math.sqrt(shapeX**2 + shapeZ**2);

    // Lights
    addLights(0xffffff, radius, shapeY);

    // Camera
    addCamera(radius, shapeY);

    // Action
    outputReady = true;

}

// Adds a Cube to the Shape

function addCube(x, y, z){
    let nextCube = new THREE.Mesh(cube, material);
    nextCube.position.set(x,y,z);
    shape.add(nextCube)
    shapeLength++;
}

// Checks if unique - Not really used, as list is reset on load.  Would only be useful if a DNA List was maintained. Credit Hashlips

const isDnaUnique = (_DnaList = [], _dna = []) => {
    let foundDna = _DnaList.find((i) => i.join("") === _dna.join(""));
    return foundDna == undefined ? true : false;
};

// Clearing Objects and resetting for another object

function resetShape() {
    scene.clear();
    shape.clear();
    lights.clear();
    shapeLength = 0;
    shapeDNA = [];
    outputReady = false;
}

// Positions and adds lights to scene based on object dimensions, includes color option, but currently isn't used.
function addLights(color, radius, height) { // Intensity calcs are somewhat frivolous.
    let lightColor = color;
    let lightIntensity = 0.05 * Math.abs( 12 - radius  );
    let lightX = 1 + radius;
    let lightY = 1 + ( height / 2 );
    let lightZ = 1 + radius;
    let topLightColor = color;
    let topLightIntensity = 0.05 * Math.abs( 12 - height ) ;
    let topLightY = 2 + height;

    let pointLight1 = new THREE.PointLight(lightColor, lightIntensity);
    pointLight1.position.set(lightX, lightY, lightZ);
    let pointLight2 = new THREE.PointLight(lightColor, lightIntensity);
    pointLight2.position.set(-lightX, lightY, -lightZ);
    let pointLight3 = new THREE.PointLight(lightColor, lightIntensity);
    pointLight3.position.set(lightX, lightY, -lightZ);
    let pointLight4 = new THREE.PointLight(lightColor, lightIntensity);
    pointLight4.position.set(-lightX, lightY, lightZ);

    let topLight = new THREE.PointLight(topLightColor, topLightIntensity);
    topLight.position.set(0, topLightY,0);

    lights.add(pointLight1);
    lights.add(pointLight2);
    lights.add(pointLight3);
    lights.add(pointLight4);
    lights.add(topLight);

    scene.add(lights);
}

// Positions and adds camera
function addCamera(radius, height) {
    camera.position.set(0,( 4 + ( height / 12 ) ),( 8 + radius ));
    camera.lookAt(0,0,0);
    scene.add(camera);
}

// Controls - HTML hookups

const resetShapeButton = document.getElementById('resetShape')
resetShapeButton.addEventListener('click', e => resetShape() )

const glbDownloadButton = document.getElementById('downloadGLB')
glbDownloadButton.addEventListener('click', e => glbDownload() )

const pngDownloadButton = document.getElementById('downloadPNG')
pngDownloadButton.addEventListener('click', e => pngDownload() )

// Download GLB

function glbDownload() {
    const exporter = new GLTFExporter();
    exporter.parse(
        scene,
        function(result) {
            saveArrayBuffer(result, `Shape-${shapeDNA.toString()}.glb`)
        },
        {
            binary: true
        }
    )
}

const link = document.createElement( 'a' );
link.style.display = 'none';
document.body.appendChild( link );

function saveArrayBuffer(buffer, fileName) {
    save(new Blob([buffer], {type: 'application/octet-stream'}), fileName);
}

function save(blob, fileName) {
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

// Download PNG

function pngDownload() {

    renderer.render(scene, camera);
    renderer.domElement.toBlob(function(blob){
    	var a = document.createElement('a');
      var url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `Shape-${shapeDNA.toString()}.png`;
      a.click();
    }, 'image/png', 1.0);
}

// Animate

const clock = new THREE.Clock();

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime();

    // Create New Shape if there isn't one, 

    if( shapeLength == 0 && !outputReady ) {
        // console.log('attempting shape creation');
        createShape();
    } 

    // Update objects

    shape.rotation.y = .5 * elapsedTime;

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();