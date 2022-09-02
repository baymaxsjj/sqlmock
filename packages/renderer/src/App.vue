<script setup lang="ts">
import ProjectNavVue from "./components/ProjectNav.vue";
</script>

<template>
  <div class="main">
    <ProjectNavVue></ProjectNavVue>
    <div class="router-view">
      <router-view></router-view>
    </div>
  </div>
</template>

<style lang="less" scoped>
.main{
  display: flex;
  height: 100vh;
  overflow: hidden;
  .router-view{
    flex: 1;
    height: 100%;
  }
}

</style>

