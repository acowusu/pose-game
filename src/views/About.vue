<template>
  <div class="home">
    <el-card class="box-card">
      <h1>Pose Game</h1>
      <p>
        This game was built in a couple of days during the
        <el-link type="danger" href="https://frosthack.devpost.com/"
          >FrostHack</el-link
        >
        hackathon
      </p>
      <h3>I used these technologies:</h3>
      <ul class="technologies">
        <li>
          <a href="https://github.com/"
            ><img class="thumb" src="../assets/Github.svg" alt="github logo"
          /></a>
        </li>
        <li>
          <a href="https://js.tensorflow.org/"
            ><img
              class="thumb"
              src="../assets/Tensorflow.svg"
              alt="Tensorflow logo"
          /></a>
        </li>
        <!-- <li>
          <a href="https://teachablemachine.withgoogle.com/"
            ><img
              class="thumb"
              src="../assets/TeachableMachine.png"
              alt="TeachableMachine logo"
          /></a>
        </li>
        <li>
          <a href="https://www.sashido.io/en/"
            ><img class="thumb" src="../assets/sashido.png" alt="sashido logo"
          /></a>
        </li> -->
        <li>
          <a href="https://threejs.org/"
            ><img class="thumb" src="../assets/three.png" alt="threejs logo"
          /></a>
        </li>
      </ul>
      <el-button type="primary" round @click="$router.push('Play')"
        >Play the game</el-button
      >
    </el-card>
  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'Home',
  components: {},
};
</script>
<style lang="sass" scoped>
.home
  min-height: 100vh
  min-width: 100%
  display: flex
  justify-content: center
  align-items: center
  background: linear-gradient(to right, #b3ffab, #12fff7)
  .box-card
    // max-height: 200px
.about
  margin-top: 1em
.technologies
  padding-left: 0
  list-style: none
  display: flex
  justify-content: center
  li
    margin: 1em
.thumb
  width: 5em
</style>
