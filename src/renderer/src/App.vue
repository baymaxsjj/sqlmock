<template>
  <SystemBar />
  <div class="main">
    <ProjectNavVue></ProjectNavVue>
    <div class="router-view">
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component :is="Component" :key="route.meta.usePathKey ? route.path : undefined" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>
<script setup lang="ts">
import SystemBar from './components/SystemBar.vue'
import ProjectNavVue from './components/ProjectNav.vue'
</script>
<style lang="less">
.arco-page-header-wrapper {
  padding: 0 !important;
}

body,
html {
  height: 100vh;
  overflow: hidden;
}

.arco-modal-container {
  top: 40px !important;
}

.main {
  display: flex;
  height: 100%;
  height: 100vh;
  box-sizing: border-box;
  padding-top: 40px !important;
  box-sizing: border-box;

  .router-view {
    flex: 1;
    height: 100%;
    padding: 0 5px;
  }
}
</style>
