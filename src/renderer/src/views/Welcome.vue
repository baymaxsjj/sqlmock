<template>
  <ul class="welcome">
    <li class="item">
      <icon-plus />
      创建项目
    </li>
    <li class="item">
      <icon-plus />
      历史
    </li>
    <li class="item">
      <icon-plus />
      查看文档
    </li>
  </ul>
</template>
<style lang="less" scoped>
.welcome{
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: auto;
  height: 100%;
  .item{
    border: 2px solid rgba(var(--primary-6));
    border-radius: 5px;
    padding: 50px;
    margin: 20px;
  }
}
</style>
