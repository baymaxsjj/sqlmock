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
.arco-page-header-main{
  max-width: 250px;
}
.arco-page-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  user-select:none;
}

body,
html {
  height: 100vh;
  overflow: hidden;
}
#app{
  height: 100%;
}

.arco-modal-container {
  top: 40px !important;
}

.main {
  display: flex;
  height: 100%;
  box-sizing: border-box;
  padding-top: 40px !important;

  .router-view {
    flex: 1;
    height: 100%;
    overflow: auto;
    padding: 0 20px;
    box-sizing: border-box;
  }
}
</style>
