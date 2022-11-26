<script setup lang="ts">
import ProjectNavVue from './components/ProjectNav.vue'
</script>

<template>
  <div class="main">
    <ProjectNavVue></ProjectNavVue>
    <div class="router-view">
      <router-view></router-view>
    </div>
  </div>
</template>
<style>

</style>
<style lang="less" >
.arco-page-header-wrapper{
  padding: 0!important;
}
body,
html {
  height: 100vh;
  overflow: hidden;
}

.main {
  display: flex;
  height: 100vh;
  overflow: hidden;

  .router-view {
    flex: 1;
    height: 100%;
    padding: 0 5px;
    box-sizing: border-box;
  }
}
</style>
