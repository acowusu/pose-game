import palettes from 'nice-color-palettes';
import * as THREE from 'three';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@mediapipe/pose';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
// eslint-disable-next-line no-unused-vars
import { ShapeInfo, Intersection } from 'kld-intersections';
import Chroma from 'chroma-js';
import level1 from '../assets/level_1.svg';
import level2 from '../assets/level_2.svg';
import level3 from '../assets/level_3.svg';
import level4 from '../assets/level_4.svg';
import level5 from '../assets/level_5.svg';
import level6 from '../assets/level_6.svg';
import level7 from '../assets/level_7.svg';
import level8 from '../assets/level_8.svg';
import level9 from '../assets/level_9.svg';
import level10 from '../assets/level_10.svg';

// import glsl from "glslify"

// import
class Game extends EventTarget {
  saveFiles = false;
  showIntersections = false;
  looping = true;
  colors = null;
  level = 0;
  scene = null;
  camera = null;
  renderer = null;
  shapes = [];
  rawSVGMarkups = [];
  detector = null;
  constructor({ canvas, colors, height, width }) {
    super();
    //setup three js
    this.clock = new THREE.Clock();

    this.levelImages = [
      level1,
      level2,
      level3,
      level4,
      level5,
      level6,
      level7,
      level8,
      level9,
      level10,
    ];

    this.colors = colors || this.oneOf(palettes);
    console.log(this.colors);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas,
    });
    this.renderer.setClearColor(this.colors[0], 1);

    this.renderer.setSize(width, height);
    this.camera.position.set(0, 0.5, 5);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    const light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(-200, 200, -400);
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.scene.add(light);
    this.createFloor();
    this.createCurtain();
    this.createBody();
    //setup pose model
    this.video = document.getElementById('video');

    const model = poseDetection.SupportedModels.BlazePose;
    const detectorConfig = {
      runtime: 'mediapipe',
      modelType: 'lite',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
    };
    this.detector = poseDetection.createDetector(model, detectorConfig);
    // const _size = 10;
    // const _divisions = 10;
    // const axesHelper = new THREE.AxesHelper(5);
    // this.scene.add(axesHelper);
    // const gridHelper = new THREE.GridHelper(_size, _divisions);
    // this.scene.add(gridHelper);
  }
  play() {
    this.clock.start();
  }
  pause() {
    this.clock.stop();
  }
  addShape(shape) {
    this.shapes.push(shape);
    this.scene.add(shape);
  }
  createCurtain() {
    const geometry = new THREE.BoxGeometry();

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /*glsl*/ `
            varying vec3 vPosition;
            void main () {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `,
      fragmentShader: /*glsl*/ `
            varying vec3 vPosition;
            uniform vec3 color;
            uniform vec3 pointColor;
            uniform float u_time;

            void main () {
              
                float scalar = pow( (vPosition.y), 2.0)+pow((vPosition.x), 2.0);
              float inside = smoothstep(-1.0, 1.0 ,sin(-2.0*u_time+30.0*sqrt(scalar)));
              
              vec3 fragColor = mix(color, pointColor, inside);
              
              gl_FragColor = vec4(fragColor, 1.0);
            }
            `,
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.scale.set(7, 7, 50);
    floor.position.set(0, 0, -50);
    this.scene.add(floor);
    return floor;
  }
  createFloor() {
    const geometry = new THREE.BoxGeometry();
    this.uniforms = {
      color: { value: new THREE.Color(this.floorColor()) },
      u_time: { value: 0.0 },

      pointColor: {
        value: new THREE.Color(Chroma(this.floorColor()).darken(0.8).hex()),
      },
    };
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: /*glsl*/ `
            varying vec3 vPosition;
            void main () {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `,
      fragmentShader: /*glsl*/ `
            varying vec3 vPosition;
            uniform vec3 color;
            uniform vec3 pointColor;
            uniform float u_time;

            void main () {
              
        
              float inside = smoothstep(-0.010, 0.010 ,sin(vPosition.z*200.0-2.0*u_time) );
              
              vec3 fragColor = mix(color, pointColor, inside);
              
              gl_FragColor = vec4(fragColor, 1.0);
            }
            `,
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.scale.set(7, 0.01, 50);
    floor.position.set(0, -2.8, 0);
    this.scene.add(floor);
    return floor;
  }

  async loop() {
    // update timer
    this.AnimationFrame = requestAnimationFrame(this.loop.bind(this));

    if (this.clock.running) {
      this.uniforms.u_time.value = 1.5 * this.clock.getElapsedTime();
      //get pose estimation
      const estimationConfig = { enableSmoothing: true };
      const loadedDetector = await this.detector;
      const poses = await loadedDetector.estimatePoses(
        this.video,
        estimationConfig
      );
      //update pose shapes
      const positions = await poses;
      this.updateBody(positions);

      // update frames
      const delta = this.clock.getDelta();
      for (let i = 0; i < this.shapes.length; i++) {
        if (Math.round(this.shapes[i].position.z * 5) / 5 == 0) {
          this.checkIntersection({ wallIndex: i, positions });
        }
        this.shapes[i].position.z += 1.3 * delta;
        if (this.shapes[i].position.z > 5) {
          this.shapes[i].position.z = this.levelImages.length * -30;
          if (this.levelImages.length + 2 > this.level) {
            await this.createSvgShape(this.levelImages[++this.level]);
          } else {
            console.log('finished');
          }

          console.log('created shape ', this.shapes.length);
        }
      }
    }
    this.renderer.render(this.scene, this.camera);
  }
  oneOf = (array) => array[Math.floor(Math.random() * array.length)];
  backgroundColor() {
    return this.colors[0];
  }
  floorColor() {
    return this.colors[1];
  }
  shapeColor() {
    return this.randomColor();
  }
  bodyColor() {
    return this.colors[2];
  }
  randomColor() {
    return this.oneOf(this.colors.slice(3));
  }
  createBody() {
    this.bodyparts = [];
    const geometry = new THREE.SphereGeometry(0.2, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: this.bodyColor(),
      roughness: 1,
      metalness: 0,
    });
    const group = new THREE.Group();

    for (let i = 0; i < 33; i++) {
      const part = new THREE.Mesh(geometry, material);
      group.add(part);
      this.bodyparts.push(part);
    }
    group.rotation.z = Math.PI;
    console.log('[Group position]', group.position);
    this.scene.add(group);
  }
  updateBody(positions) {
    if (positions === undefined || positions[0] === undefined) {
      console.warn('[Cannot find keypoints]');
      return;
    }
    for (let i = 0; i < positions[0].keypoints.length; i++) {
      const position = positions[0].keypoints[i];
      //   this.bodyparts[i].position.set(
      //     ((position.x - 180) * 5) / 360,
      //     ((position.y + -160) * 5) / 270,
      //     position.z * 2
      //   );
      this.bodyparts[i].position.set(
        (position.x - 180) * 0.02,
        (position.y - 160) * 0.02,
        position.z * 2
      );
    }
  }
  async createSvgShape(
    svgMarkup,
    material = new THREE.MeshStandardMaterial({
      color: this.shapeColor(),
      roughness: 1,
      metalness: 0,
    })
  ) {
    const loader = new SVGLoader();
    // if (svgMarkup === undefined) {
    //   return;
    // }
    if (svgMarkup[0] === '/') {
      const response = await fetch(svgMarkup);
      svgMarkup = await response.text();
    }
    this.rawSVGMarkups.push(svgMarkup);

    const svgData = loader.parse(svgMarkup);
    const svgGroup = new THREE.Group();

    svgData.paths.forEach((path) => {
      const shapes = path.toShapes(true);
      // Each path has array of shapes
      shapes.forEach((shape) => {
        // Finally we can take each shape and extrude it
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: 20,
          bevelEnabled: false,
        });

        // Create a mesh and add it to the group
        const mesh = new THREE.Mesh(geometry, material);

        svgGroup.add(mesh);
      });
    });
    this.addShape(svgGroup);
    // svgGroup.scale.x *= -1;
    svgGroup.rotation.z = Math.PI;
    const box = new THREE.Box3().setFromObject(svgGroup);
    const size = new THREE.Vector3();
    box.getSize(size);

    const yOffset = size.y / -2;
    const xOffset = size.x / -2;

    // Offset all of group's elements, to center them
    svgGroup.children.forEach((item) => {
      item.position.x = xOffset;
      item.position.y = yOffset;
    });
    svgGroup.scale.set(0.02, 0.02, 0.02);
    svgGroup.position.z = -10;
    // Add our group to the scene (you'll need to create a scene)
    return svgGroup;
  }
  checkIntersection({ wallIndex, positions }) {
    let hasIntersected = false;
    const wallPaths = getPaths(this.rawSVGMarkups[wallIndex]);
    if (!wallPaths || positions === undefined || positions[0] === undefined) {
      return false;
    }
    let preview = `<?xml version="1.0" standalone="no"?><svg  style="display: block; transform: scale(-1,1)" width="360" height="270" version="1.1" viewBox="0 0 720 540" xmlns="http://www.w3.org/2000/svg">`;
    for (let i = 0; i < wallPaths.length; i++) {
      const pathsrc = wallPaths[i];
      const path = ShapeInfo.path(pathsrc);
      preview += `<path d="${pathsrc}" stroke="#000" stroke-width="1px"/>
      `;
      //   console.log(positions);
      for (let j = 0; j < positions[0].keypoints.length; j++) {
        const position = positions[0].keypoints[j];
        const line = ShapeInfo.circle({
          center: { x: position.x, y: position.y },
          radius: 10,
        });
        const intersections = Intersection.intersect(path, line);
        if (intersections.points.length > 0) {
          preview += `<circle cx="${position.x}" stroke="#ff00ff"  fill="pink" stroke-width="1px" cy="${position.y}" r="10" />`;
          hasIntersected = true;
        } else {
          preview += `<circle cx="${position.x}" stroke="#ff00ff"  fill="yellow" stroke-width="1px" cy="${position.y}" r="10" />`;
        }
        // intersections.points.forEach(console.log);
      }
    }
    preview += `</svg>`;

    if (this.showIntersections)
      document.getElementById('preview').innerHTML += preview;
    saveSvg(preview, 'frame', this.saveFiles);
    if (!hasIntersected) {
      this.dispatchEvent(new Event('point'));
    }
    console.log(hasIntersected);
    return hasIntersected;
  }
  async setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'Browser API navigator.mediaDevices.getUserMedia not available'
      );
    }

    const videoConfig = {
      audio: false,
      video: {
        facingMode: 'user',
        width: 360,
        height: 270,
        frameRate: {
          ideal: 60,
        },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(videoConfig);

    this.video.srcObject = stream;

    await new Promise((resolve) => {
      this.video.onloadedmetadata = () => {
        resolve(this.video);
      };
    });

    this.video.play();

    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    // Must set below two lines, otherwise video element doesn't show.
    this.video.width = videoWidth;
    this.video.height = videoHeight;

    return this.camera;
  }
  async destroy() {
    window.cancelAnimationFrame(this.AnimationFrame);
    const loadedDetector = await this.detector;
    loadedDetector.dispose();
  }
}

function getPaths(svgMarkup) {
  let parser = new DOMParser();
  let doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
  let paths = [];
  for (let node of doc.querySelectorAll('path')) {
    paths.push(node.getAttribute('d'));
  }
  return paths;
}
function saveSvg(svgData, name, saveFiles) {
  if (!saveFiles) return;
  let svgBlob = new Blob([svgData], {
    type: 'image/svg+xml;charset=utf-8',
  });
  let svgUrl = URL.createObjectURL(svgBlob);
  let downloadLink = document.createElement('a');
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
export default Game;
