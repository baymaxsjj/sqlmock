<template>
  <!-- <a-button type="primary" @click="visible = true" long size="large">
        <template #icon>
          <icon-plus />
        </template>
        创建项目
      </a-button> -->
  <a-menu class="project" mode="pop" show-collapse-button breakpoint="xl" v-model:collapsed="collapsed">
    <a-menu-item @click="create">
      <template #icon>
        <icon-plus />
      </template>
      创建项目
    </a-menu-item>
    <template v-for="item of projects" :key="item.url">
      <router-link :to="`/${item.id}/tables`">
        <a-menu-item class="project-menu">
          <template #icon>
            <icon-code-sandbox :style="{ color: item.adapter ? 'cyan' : '' }" />
          </template>
          <div style="display: flex; align-items: center">
            <span style="flex-grow: 1;text-overflow: ellipsis;overflow: hidden;"> {{ item.name }}</span>
            <a-dropdown trigger="hover">
              <a-button shape="circle" v-show="!collapsed">
                <icon-more style="margin-right: 0" />
              </a-button>
              <template #content>
                <a-doption @click="closeDb(item)" v-show="item.adapter">关闭数据库</a-doption>
                <a-doption @click="updateProject(item)">修改项目</a-doption>
                <a-doption @click="updateProject(item)">导出项目</a-doption>
                <a-doption @click="deleteProject(item)">删除项目</a-doption>
              </template>
            </a-dropdown>
          </div>
        </a-menu-item>
      </router-link>
    </template>
    <a-empty class="empty" v-if="projects.length == 0 && !collapsed" />
  </a-menu>
  <a-modal v-model:visible="visible" :footer="false">
    <template #title> 创建项目 </template>
    <a-form :model="form" @submit-success="addProject">
      <a-form-item field="name" label="项目名称" :rules="formRules">
        <a-input v-model="form.name" placeholder="输入项目名称" />
      </a-form-item>
      <a-divider />
      <a-form-item field="type" label="数据库类型" :rules="formRules">
        <a-select v-model="form.type" placeholder="选择数据库类型" @input-value-change="dbChange">
          <a-option v-for="(item, key) of dbTypeList" :value="key" :label="item" />
        </a-select>
      </a-form-item>
      <a-form-item field="host" label="主机地址" :rules="formRules">
        <a-input v-model="form.host" placeholder="输入主机地址" />
      </a-form-item>
      <a-form-item field="port" label="端口" :rules="formRules">
        <a-input-number v-model="form.port" placeholder="输入主机端口" />
      </a-form-item>
      <a-form-item field="username" label="用户名" :rules="formRules">
        <a-input v-model="form.username" placeholder="输入用户名" />
      </a-form-item>
      <a-form-item field="name" label="密码">
        <a-input-password v-model="form.password" placeholder="输入密码" />
      </a-form-item>
      <a-form-item field="database" label="数据库" :rules="formRules">
        <a-input v-model="form.database" placeholder="输入连接的数据库名" />
      </a-form-item>
      <div style="display: flex;justify-content: end;">
          <a-button  :disabled="form.type == ''" @click="testConn">测试连接</a-button>
          <a-button  @click="visible = !visible" style="margin: 0 10px;">取消</a-button>
          <a-button html-type="submit"  type="primary">添加项目</a-button>
      </div>
    </a-form>
  </a-modal>
</template>
<script lang="ts" setup>
import { Message, Notification } from '@arco-design/web-vue'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import baseDbAdapter, { dbConnectInfo } from '../db/operation/base-db'
import dbMocke from '../db/operation/index'
import useProjectStore, { Project } from '../stores/project'

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)
let dbAdapter: baseDbAdapter
const form = reactive({
  id: '',
  name: '',
  type: '',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: ''
})
const dbTypeList = dbMocke.getAdapterType()
console.log(dbTypeList)
const visible = ref(false)
const dbChange = (): void => { }
const projectStore = useProjectStore()
const projects = projectStore.getProjects
const formRules = [{ required: true, message: '必填项' }]
const create = (): void => {
  form.id = ''
  visible.value = true
}

const closeDb = (project: Project): void => {
  if (project.adapter) {
    project.adapter.close()
    project.adapter = undefined
    Message.success('关闭成功~')
    isToHome(project.id!)
  }
}
const deleteProject = (project: Project): void => {
  projectStore.delProjectById(project.id!)
  Message.success('删除成功~')
  isToHome(project.id!)
}
const isToHome = (projectId: string) => {
  const id = route.params['projectId']
  if (id == projectId) {
    router.push('/')
  }

}
const updateProject = (project: Project): void => {
  Object.assign(form, project.connInfo)
  form.name = project.name
  form.id = project.id!
  form.type = project.adpterUUID
  visible.value = true
}
//添加项目
const addProject = (): void => {
  if (form.id != '') {
    const project: Project = {
      id: form.id,
      name: form.name,
      connInfo: getConnInfo(),
      tableMock: {},
      adpterUUID: form.type
    }
    projectStore.updatedProjectById(project)
    visible.value = false
    Message.success('修改成功')
  } else {
    projectStore.addProject(form.name, form.type, getConnInfo())
    visible.value = false
    Message.success('创建成功')
  }
}
const getConnInfo = (): dbConnectInfo => {
  const connnInfo: dbConnectInfo = {
    type: form.type,
    port: form.port,
    host: form.host,
    username: form.username,
    password: form.password,
    database: form.database
  }
  return connnInfo
}
// 测试连接
const testConn = (): void => {
  dbAdapter = dbMocke.getAdapterByUuid(form.type, getConnInfo())
  dbAdapter
    .testConn()
    .then((res) => {
      Message.success('数据库连接成功')
      console.log(res)
    })
    .catch((err) => {
      Notification.error('连接失败' + err)
    })
}
</script>
<style lang="less" scoped>
.project {
  height: 100%;
  overflow-y: auto;
  max-width: 250px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  user-select: none;
}

.arco-menu-collapsed {

  .menu-more,
  .empty {
    display: none !important;
  }
}
</style>
