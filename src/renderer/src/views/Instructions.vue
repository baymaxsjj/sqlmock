<template>
  <div class="instructions">
    <a-typography-title :heading="3">
      如果你觉得改工具好用的话~欢迎给个star
      <a-button
        type="text"
        @click="toLink('https://gitee.com/baymaxsjj/sqlmock')"
        style="margin: 0 15px"
      >
        <template #icon>
          <icon-font type="icon-gitee" :size="25"></icon-font>
        </template>
        Gitee
      </a-button>
      <a-button type="text" @click="toLink('https://github.com/baymaxsjj/sqlmock')">
        <template #icon>
          <icon-font type="icon-github" :size="25"></icon-font>
        </template>
        github
      </a-button>
    </a-typography-title>

    <a-typography-title :heading="3">数据库数据填充使用说明</a-typography-title>
    <a-typography-paragraph>
      支持Mock.js 语法<a-button type="text" @click="toLink('http://mockjs.com/examples.html')"
        >访问-Mock.js官网</a-button
      >
      、支持Js脚本（通过<code v-pre>{{ 表达式 / 函数调用 }}</code
      >）、支持部分字段填充、支持表文档导出。
    </a-typography-paragraph>
    <a-typography-paragraph>
      文档说明：以下@mock 为Mock.js的占位符,需要替换成对应的占位符，如@name、@title等
    </a-typography-paragraph>

    <a-typography-title :heading="4">创建项目、连接数据库</a-typography-title>
    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127195055640.png')" />
    </a-typography-paragraph>

    <a-typography-title :heading="4">选择数据表</a-typography-title>
    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127195114876.png')" />
    </a-typography-paragraph>

    <a-typography-title :heading="4"
      >编写脚本（可选），<code>mockCount</code>运行次数、<code>Mock</code>mock.js
    </a-typography-title>
    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127195420902.png')" />
    </a-typography-paragraph>

    <a-typography-title :heading="4"
      >编写表达式<code v-pre>@mock</code>、<code v-pre>{{ 表达式 }}</code
      >、<code v-pre>{{ Mock.xxx }}</code></a-typography-title
    >
    <a-typography-paragraph>
      注意<code v-pre>@mock</code>和<code v-pre>{{}}</code>一起使用时之间加个空格，要不然<code v-pre
        >@mock</code
      >无法使用</a-typography-paragraph
    >

    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127195900097.png')" />
    </a-typography-paragraph>

    <a-typography-title :heading="4">测试数据是否正常</a-typography-title>
    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127200239231.png')" />
    </a-typography-paragraph>

    <a-typography-title :heading="4">运行</a-typography-title>
    <a-typography-paragraph>
      如果批量插入有问题，请关闭批量 单次插入次数过多有连接问题</a-typography-paragraph
    >

    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127195505435.png')" />
    </a-typography-paragraph>

    <a-typography-title :heading="4">表结构文档导出</a-typography-title>
    <a-typography-paragraph> 选择需要导出的表</a-typography-paragraph>

    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127200356327.png')" />
    </a-typography-paragraph>

    <a-typography-title :heading="4">Word</a-typography-title>
    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127200534761.png')" />
    </a-typography-paragraph>

    <a-typography-title :heading="4">Markdown</a-typography-title>
    <a-typography-paragraph>
      <a-image :src="gatRootFilePath('/image/doc/image-20221127200502866.png')" />
    </a-typography-paragraph>
    <a-typography-title :heading="3"
      >版权说明:未经本人允许禁止用于任何商业用途。仅限个人学习使用</a-typography-title
    >
  </div>
</template>
<script setup lang="ts">
import { gatRootFilePath } from '@renderer/utils/file'
import { toLink } from '@renderer/utils/link'
import IconFont from '../components/IconFont.vue'
</script>
<style lang="less" scoped>
:deep(.arco-image img) {
  width: 100%;
}

.instructions {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}
</style>
