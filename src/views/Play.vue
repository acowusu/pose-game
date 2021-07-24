<template>
  <div id="game-container">
    <el-row id="game-buttons">
      <el-button icon="el-icon-back" @click="end" circle></el-button>
      <el-button round @click="openModal" icon="el-icon-video-pause"
        >Pause</el-button
      >
    </el-row>
    <div id="high-score">
      <el-card shadow="always" class="score-box">
        <h1>{{ score }}</h1>
      </el-card>
    </div>
    <canvas ref="canvas" id="game-canvas" v-loading="loading"></canvas>
    <video
      id="video"
      playsinline
      style="
        -webkit-transform: scaleX(-1);
        transform: scaleX(-1);
        visibility: hidden;
        width: auto;
        height: auto;
        display: none;
      "
    ></video>
    <div id="preview"></div>
  </div>
</template>

<script>
// import palettes from "nice-color-palettes";
import Game from '../scripts/game';
// import * as THREE from "three";
export default {
  data: () => ({
    game: null,
    colors: null,
    scene: null,
    camera: null,
    renderer: null,
    shapes: [],
    score: 0,
    loading: true,
  }),
  async beforeDestroy() {
    this.game.destroy();
  },
  async mounted() {
    this.$alert('The game is about to begin', 'Get Ready', {
      confirmButtonText: 'OK',
      callback: async () => {
        this.game = await new Game({
          canvas: this.$refs.canvas,
          height: window.innerHeight,
          width: window.innerWidth,
        });

        // this.renderer.setSize(window.innerWidth * 0.99, window.innerHeight * 0.99);

        await this.game.setupCamera();
        const frame = `<svg width="360" height="270" version="1.1" viewBox="0 0 360 270" xmlns="http://www.w3.org/2000/svg">
 <path d="m5 0-5 270 90-5c-50-100-89.326-212.89 51.044-212.79 227.23 0.15482 218.96 82.792 137.8 208.43l81.154 9.3649-5-270-170 5z"/>
 <path d="m223.45 79.777c0.95312 0.4375 1.9961 0.82031 3.1289 1.1484 2.3439 0.62619 4.8466 0.61708 7.0078-0.08203 2.2769-0.81019 3.9524-2.4838 4.7578-4.5234 0.4375-1.1406 0.65625-2.4727 0.65625-3.9961-0.071-5.6872-4.3526-8.9709-9.1524-9.0234-0.99219 0-2.0039 0.12109-3.0352 0.36328-1.0391 0.23438-2.1563 0.63672-3.3516 1.207v2.7539h0.21094c0.24219-0.1875 0.59375-0.43359 1.0547-0.73828s0.91406-0.55859 1.3594-0.76172c0.53907-0.24219 1.1524-0.44141 1.8398-0.59766 4.5379-1.0497 8.5418 3.104 8.6602 6.7266-0.46825 5.746-4.0756 7.6491-8.8711 6.9258-0.75-0.14844-1.4062-0.33984-1.9688-0.57422v-4.2773h4.6758v-2.0391h-6.9726z"/>
 <path d="m207.9 81.066h11.496v-17.449h-11.496v2.0625h9.1758v4.7812h-9.1758v2.0625h9.1758v6.4805h-9.1758z"/>
 <path d="m191.78 65.68h6.2344v15.387h2.3203v-15.387h6.2344v-2.0625h-14.789z"/>
 <path d="m166.56 81.066h3.0117l5.8359-6.9375h3.2695v6.9375h2.3203v-17.449h-4.8867c-1.0547 0-1.9336 0.07031-2.6367 0.21094-0.70313 0.13281-1.3359 0.375-1.8984 0.72656-0.63281 0.39844-1.125 0.90234-1.4766 1.5117-0.79326 1.77-0.66092 3.9782 0.41015 5.4609 0.63281 0.84375 1.5039 1.4805 2.6133 1.9102zm5.6953-13.863c0.17187-0.39062 0.46093-0.71875 0.86718-0.98438 0.33594-0.22656 0.73438-0.38281 1.1953-0.46875 0.46093-0.09375 1.0039-0.14062 1.6289-0.14062h2.7305v6.5859h-2.3438c-0.73437 0-1.375-0.0625-1.9219-0.1875-0.54688-0.13281-1.0117-0.375-1.3945-0.72656-0.35157-0.32812-0.60938-0.70312-0.77344-1.125-0.37679-1.0583-0.24624-1.965 0.0117-2.9531z"/>
 <path d="m152.81 81.066h11.496v-17.449h-11.496v2.0625h9.1758v4.7812h-9.1758v2.0625h9.1758v6.4805h-9.1758z"/>
 <path d="m135.38 81.066h2.4727l1.7109-4.8633h7.5469l1.7109 4.8633h2.3555l-6.3516-17.449h-3.0938zm4.8984-6.8555 3.0586-8.5664 3.0703 8.5664z"/>
 <path d="m119.03 76.672c1.9294 3.4718 5.7184 4.3719 9.293 4.3945h4.4062v-17.449h-4.3594c-7.5811-0.50169-12.679 6.3968-9.3398 13.055zm2.0977-7.8047c2.4791-3.1874 5.7855-3.2578 9.2812-3.2578v13.465h-2.1797c-2.9079-0.11943-5.9003-0.76442-7.1602-3.3516-0.80415-2.2426-0.97122-4.7721 0.0586-6.8555z"/>
 <path d="m102.12 63.617 6.1406 9.7969v7.6523h2.3203v-7.4062l6.1641-10.043h-2.5664l-4.7695 7.8047-4.8164-7.8047z"/>
</svg>

`;
        this.game.createSvgShape(frame);
        this.game.loop();
        this.game.addEventListener('point', () => {
          this.score++;
        });
        this.game.play();
        // this.loading = false;
      },
    });
    // const material = new THREE.MeshBasicMaterial({ color: this.colors[1] });
    // this.shapes.push(new THREE.Mesh(geometry, material));
    // console.log(this.shapes, this.scene);
    // this.shapes.map((shape) => this.scene.add(shape));
  },
  methods: {
    end() {
      // this.game.destroy();
      this.$router.push('/');
    },
    openModal() {
      this.game.pause();

      this.$confirm('', 'Game Paused', {
        confirmButtonText: 'Resume',
        cancelButtonText: 'Restart',
        type: 'info',
        iconClass: 'el-icon-video-pause',
        center: true,
      })
        .then(() => {
          this.game.play();
        })
        .catch(() => {
          // this.game.destroy();
          this.$router.push('/');
        });
    },
  },
};
</script>

<style lang="sass" scoped>
#game-container
  position: fixed
  top: 0
  left: 0
  width: 100vh
  height: 100vh
  #game-canvas
    position: fixed
    top: 0
    left: 0
    z-index: 1

  #game-buttons
    position: fixed
    top: 0
    left: 0
    z-index: 2
    margin: 1em
  #high-score
    position: fixed
    margin: 1em
    right: 0
    top: 0
    z-index: 2

canvas
  height: 100%
  width: 100%
.score-box
  display: flex
  justify-content: center
  align-items: center
  text-align: center
  width: 3.5em
  height: 3.5em
  font-size: 2em
</style>
