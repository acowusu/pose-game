<template>
  <div class="home">
    <el-card class="box-card">
      <el-button type="primary" round @click="$router.push('Play')"
        >Play the game</el-button
      >

      <div class="about">
        <el-link type="info" @click="$router.push('About')">About</el-link>
      </div>
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
    max-height: 200px
.about
  margin-top: 1em
</style>
