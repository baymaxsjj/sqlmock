<template>
  <a-row class="system-bar">
    <div class="left">
      <a-button style="margin-left: 15px">
        <template #icon>
          <img src="../assets/icon.ico" height="30" />
        </template>
      </a-button>

      <a-tooltip content="Baymax Gitee" position="bottom">
        <a-button @click="toLink('https://gitee.com/baymaxsjj/sqlmock')" style="margin: 0 15px">
          <template #icon>
            <icon-font type="icon-gitee" :size="25"></icon-font>
          </template>
        </a-button>
      </a-tooltip>
      <a-tooltip content="Baymax Gihub" position="bottom">
        <a-button @click="toLink('https://github.com/baymaxsjj/sqlmock')">
          <template #icon>
            <icon-font type="icon-github" :size="25"></icon-font>
          </template>
        </a-button>
      </a-tooltip>
      <a-tooltip content="控制台" position="bottom">
        <a-button style="margin-left: 15px" @click="openConsole">
          <template #icon>
            <icon-font type="icon-window" :size="25"></icon-font>
          </template>
        </a-button>
      </a-tooltip>
    </div>
    <div class="title" style="text-align: center">
      <span>SqlMock</span> | <span style="font-size: 13px; opacity: 0.6">数据库数据填充</span><br />
      <span style="font-size: 10px; opacity: 0.5">Copyright © Baymax 版权所有</span>
    </div>
    <div class="right">
      <a-button @click="toMin()">
        <template #icon>
          <icon-font type="icon-2zuixiaohua-2"></icon-font>
        </template>
      </a-button>
      <a-button @click="toggleMax()">
        <template #icon>
          <icon-font :type="isMax ? 'icon-3zuidahua-3' : 'icon-3zuidahua-1'"></icon-font>
        </template>
      </a-button>
      <a-button class="close" @click="toClose()">
        <template #icon>
          <icon-font type="icon-4guanbi-2" @click="toClose"></icon-font>
        </template>
      </a-button>
    </div>
  </a-row>
</template>
<script lang="ts" setup>
import { ipcRenderer } from 'electron'
import { ref } from 'vue'
import IconFont from './IconFont.vue'
import { toLink } from '@renderer/utils/link'
const isMax = ref(false)

ipcRenderer.on('mainWindowCharge', (_event, arg) => {
  if (arg == 'maximize') {
    isMax.value = true
  } else {
    isMax.value = false
  }
})
const openConsole = () => {
  ipcRenderer.send('open-console')
}

const toMin = () => {
  ipcRenderer.send('min-app')
}
const toggleMax = () => {
  console.log(isMax.value)
  if (isMax.value) {
    ipcRenderer.send('unmax-app')
  } else {
    ipcRenderer.send('max-app')
  }
}
const toClose = () => {
  ipcRenderer.send('close-app')
}
</script>
<style lang="less" scoped>
.system-bar {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  background-color: var(--color-fill-2);
  -webkit-app-region: drag;

  .left {
    -webkit-app-region: none;
  }

  .title {
    span {
      font-weight: bold;
      color: var(--color-text-1);
    }
  }

  .right {
    height: 100%;
    float: right;
    -webkit-app-region: none;

    button {
      height: 100%;
      width: 40px;
    }

    .close {
      &:hover {
        background-color: rgba(var(--red-6));
        color: #fff;
      }
    }
  }
}
</style>
