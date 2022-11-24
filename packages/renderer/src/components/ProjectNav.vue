<template>
  <!-- <a-button type="primary" @click="visible = true" long size="large">
        <template #icon>
          <icon-plus />
        </template>
        创建项目
      </a-button> -->
  <a-menu class="project" mode="pop" show-collapse-button breakpoint="xl">
    <a-menu-item @click="visible = true">
      <template #icon>
          <icon-plus />
        </template>
        创建项目
    </a-menu-item>
    <template v-for="item of projects" :key="item.url">
      <router-link :to="`/${item.name}/tables`">
        <a-menu-item>
          <template #icon>
            <icon-code-sandbox />
          </template>
          {{ item.name }}
        </a-menu-item>
      </router-link>
    </template>
  </a-menu>
  <a-modal v-model:visible="visible" @ok="addProject">
    <template #title> 创建项目 </template>
    <a-form :model="form">
      <a-form-item field="name" label="项目名称">
        <a-input v-model="form.name" placeholder="输入项目名称" />
      </a-form-item>
      <a-divider />
      <a-form-item field="name" label="选择数据库">
        <a-select @input-value-change="dbChange" v-model="form.type" placeholder="选择数据库类型">
          <a-option v-for="(item, key) of dbTypeList" :value="key" :label="item" />
        </a-select>
      </a-form-item>
      <a-form-item field="name" label="主机地址">
        <a-input v-model="form.host" placeholder="输入主机地址" />
      </a-form-item>
      <a-form-item field="name" label="端口">
        <a-input-number v-model="form.port" placeholder="输入主机端口" />
      </a-form-item>
      <a-form-item field="name" label="用户名">
        <a-input v-model="form.username" placeholder="输入用户名" />
      </a-form-item>
      <a-form-item field="name" label="密码">
        <a-input v-model="form.password" placeholder="输入密码" />
      </a-form-item>
      <a-form-item field="name" label="数据库">
        <a-input v-model="form.database" placeholder="输入连接的数据库名" />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button @click="testConn" :disabled="form.type == ''">测试连接</a-button>
      <a-button @click="visible = !visible">取消</a-button>
      <a-button @click="addProject" type="primary" :disabled="form.type == ''">添加项目</a-button>
    </template>
  </a-modal>
</template>
<script lang="ts" setup>
import { Message, Modal, Notification } from "@arco-design/web-vue";
import { reactive, ref } from "vue";
import baseDbAdapter, { dbConnectInfo } from '../db/operation/baseDb'
import ProjectItemVue from "./ProjectItem.vue";
import dbmock from "../db/operation/index";
import dbMocke from "../db/operation/index";
import useProjectStore from "../stores/project";


let dbAdapter: baseDbAdapter
const form = reactive({
  name: "",
  type: "",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "123456",
  database: "blog",
})
const dbTypeList = dbMocke.getAdapterType();
console.log(dbTypeList)
const visible = ref(false);
const dbChange = () => {

}
const projectStore = useProjectStore()
const projects = projectStore.getProjects

//添加项目
const addProject = (): void => {
  const hasProject = projectStore.getProjectByName(form.name);
  console.log(hasProject)
  if (hasProject) {
    Modal.confirm({
      title: '温馨提示',
      content: '该项目已存在，是否覆盖！',
      simple: true,
      onOk() {
        console.log("6666")
        projectStore.addProject(form.name, form.type, getConnInfo())
        visible.value = false
        Message.success("创建成功")
      }
    });
  } else {
    projectStore.addProject(form.name, form.type, getConnInfo())
    visible.value = false
    Message.success("创建成功")
  }
};
const getConnInfo = (): dbConnectInfo => {
  const connnInfo: dbConnectInfo = {
    type: form.type,
    port: form.port,
    host: form.host,
    username: form.username,
    password: form.password,
    database: form.database
  }
  return connnInfo;
}
// 测试连接
const testConn = () => {
  dbAdapter = dbmock.getAdapterByUuid(form.type, getConnInfo());
  dbAdapter.testConn().then(res => {
    Message.success("数据库连接成功")
    console.log(res)
  }).catch(err => {
    Notification.error("连接失败" + err)
  })
}
</script>
<style lang="less" scoped>
.project {
  height: 100%;
  overflow-y: auto;
  max-width: 200px;
}
</style>