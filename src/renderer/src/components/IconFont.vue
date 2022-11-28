<template>
  <icon-font :type="props.type" :size="props.size" :spin="props.spin" :rotate="props.rotate" />
</template>
<script setup lang="ts">
import { Icon } from '@arco-design/web-vue'
import { gatRootFilePath } from '@renderer/utils/file'
const props = defineProps({
  type: String,
  size: {
    type: Number,
    default: 16
  },
  rotate: {
    type: Number,
    default: 0
  },
  spin: {
    type: Boolean,
    default: false
  }
})

const IconFont = Icon.addFromIconFontCn({ src: gatRootFilePath('/iconfont.js') })
</script>
