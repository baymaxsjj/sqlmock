<template>
  <div class="tables">
    <div class="opera">
      <a-button size="large" type="outline" status="warning"
        >运行
        <template #icon>
          <icon-play-arrow-fill />
        </template>
      </a-button>

      <a-button size="large" type="outline"
        >导出<template #icon> <icon-share-external /> </template
      ></a-button>
    </div>
    <a-table
      v-model:selectedKeys="selectedKeys"
      class="list"
      :loading="loading"
      row-key="table_name"
      :pagination="false"
      :row-selection="rowSelection"
      :columns="columns"
      :data="tables.list"
      :scroll="scrollPercent"
      column-resizable
    >
      <template #run>
        <a-button class="oper_btn" type="text" size="large" shape="circle" @click="">
          <template #icon>
            <icon-play-circle-fill class="oper_icon" />
          </template>
        </a-button>
      </template>
      <template #edit="{record}">
        <a-button
          class="oper_btn"
          type="text"
          size="large"
          shape="circle"
          @click="editMock(record.table_name)"
        >
          <template #icon>
            <icon-edit class="oper_icon" />
          </template>
        </a-button>
      </template>
      <template #preview>
        <a-button class="oper_btn" type="text" size="large" shape="circle" @click="">
          <template #icon>
            <icon-code class="oper_icon" />
          </template>
        </a-button>
      </template>
      <template #see_mock>
        <a-button class="oper_btn" type="text" size="large" shape="circle" @click="">
          <template #icon>
            <icon-eye class="oper_icon" />
          </template>
        </a-button>
      </template>
      <template #export>
        <a-button class="oper_btn" type="text" size="large" shape="circle" @click="">
          <template #icon>
            <icon-export class="oper_icon" />
          </template>
        </a-button>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { Message, TableRowSelection } from '@arco-design/web-vue'
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {TableName} from '../db/operation/table-type'
import useProjectStore from '../stores/project'
const route = useRoute()
const projectStore = useProjectStore()
const projectId: string = route.params.projectId as string
console.log('项目id', projectId)
interface tableType {
  list: Array<TableName>
}
const tables: tableType = reactive({
  list: []
})
const router = useRouter()
const loading = ref(true)
const selectedKeys = ref([])
const rowSelection: TableRowSelection = {
  type: 'checkbox',
  showCheckedAll: true
}
const scrollPercent = {
  y: '100%'
}
const columns = [
  {
    title: '表名',
    dataIndex: 'table_name'
  },
  {
    title: '运行',
    slotName: 'run'
  },
  {
    title: '编辑',
    slotName: 'edit'
  },

  {
    title: '预览',
    slotName: 'preview'
  },
  {
    title: '查看',
    slotName: 'see_mock'
  },
  {
    title: '导出',
    slotName: 'export'
  }
]
const getDbAdapter = () => {
  loading.value = true
  const dbAdapter = projectStore.getProjectDbAdapter(projectId)
  dbAdapter
    .getTables()
    .then((res: Array<TableName>) => {
      tables.list = res
      loading.value = false
    })
    .catch((e) => {
      console.error(e)
      Message.error('数据库连接失败')
    })
}
const editMock = (table: string): void => {
  router.push({
    name: 'TableDataMock',
    params: {
      projectId: projectId,
      table: table
    }
  })
}
getDbAdapter()
watch(
  () => route.params.projectId,
  (newVal) => {
    console.log(newVal)
    getDbAdapter()
  }
)
</script>
<style lang="less" scoped>
.tables {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  .opera {
    padding: 10px 0;
    display: flex;
    justify-content: end;
    flex-direction: row-reverse;
    button {
      margin: 0 10px;
    }
  }

  .list {
    flex-grow: 1;
    .oper_btn {
      .oper_icon {
        font-size: 25px;
        color: var(--color-text-4);
      }
      :hover {
        .oper_icon {
          color: rgb(var(--primary-6));
        }
      }
    }
  }
}
</style>
