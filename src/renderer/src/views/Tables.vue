<template>
  <div class="tables">
    <div id="canvas"></div>
    <a-page-header
      :title="project.name"
      subtitle="数据表"
      class="page-header"
      :show-back="true"
      @back="$router.back()"
    >
      <template #extra>
        <a-button size="large" type="outline" status="warning"
          >运行
          <template #icon>
            <icon-play-arrow-fill />
          </template>
        </a-button>
        <a-dropdown trigger="hover">
          <a-button>
            <template #icon>
              <icon-export />
            </template>
            导出文档
          </a-button>
          <template #content>
            <a-doption @click="exportDoc(item)" v-for="item in docEnum">{{ item }}</a-doption>
          </template>
        </a-dropdown>
      </template>
    </a-page-header>
      <a-table
      v-model:selectedKeys="selectedKeys"
      :loading="loading"
      row-key="table_name"
      :pagination="false"
      :row-selection="rowSelection"
      :columns="columns"
      :data="tables.list"
    >
      <template #table_name="{ record }">
        <a-tag color="cyan">
          {{ record.table_name }}
        </a-tag>
      </template>
      <template #table_comment="{ record }">
        <a-tag color="orange">
          {{ record.table_comment == '' ? '无' : record.table_comment }}
        </a-tag>
      </template>
      <template #create_time="{ record }">
        <a-tag color="gray">
          {{ dayjs(record.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </a-tag>
      </template>
      <template #operate="{ record }">
        <a-button @click="editMock(record.table_name)" type="primary" style="margin: 0 10px">
          <template #icon>
            <icon-edit />
          </template>
          模拟
        </a-button>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup>
import { Message, TableRowSelection } from '@arco-design/web-vue'
import { reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { TableInfo } from '../db/operation/table-type'
import useProjectStore from '../stores/project'
import { IconPlayArrowFill, IconExport, IconEdit } from '@arco-design/web-vue/es/icon'
import { DocExport, DocExportType, TableDocData } from '../db/doc-export/doc-export'
const route = useRoute()
const projectStore = useProjectStore()
const projectId = ref<string>(route.params.projectId as string)
const project = ref(projectStore.getProjectById(projectId.value))
console.log('项目id', projectId.value)
interface tableType {
  list: Array<TableInfo>
}
const docEnum = DocExportType
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
const columns = [
  {
    title: '表名',
    dataIndex: 'table_name',
    slotName: 'table_name'
  },
  {
    title: '描述',
    dataIndex: 'table_comment',
    slotName: 'table_comment'
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    slotName: 'create_time'
  },
  {
    title: '操作',
    slotName: 'operate',
    width: 150
  }
]
const getDbAdapter = () => {
  loading.value = true
  const dbAdapter = projectStore.getProjectDbAdapter(projectId.value)
  dbAdapter
    .getTables()
    .then((res: Array<TableInfo>) => {
      tables.list = res
      loading.value = false
    })
    .catch((e) => {
      console.error(e)
      Message.error('数据库连接失败')
    })
}
const exportDoc = (type: DocExportType) => {
  if (selectedKeys.value.length == 0) {
    Message.info('未选择导出表')
    return
  }
  const msg=Message.loading({
      content:"文档导出中……"
  })
  getTableDocData().then((res) => {
    let exportDoc = new DocExport()
    exportDoc.download(type, project.value.name, res).then(()=>{
      msg.close()
    })
  })
}
const getTableDocData = async (): Promise<Array<TableDocData>> => {
  const data: Array<TableDocData> = []
  const dbAdapter = projectStore.getProjectDbAdapter(projectId.value)
  for (const table_name of selectedKeys.value) {
    for (const table of tables.list) {
      if (table.table_name == table_name) {
        const attributes = await dbAdapter.getTablesAttribute(table_name)
        attributes.forEach((value) => {
          value.Default = value.Default ?? ''
        })
        data.push({
          table_info: table,
          table_attributes: attributes
        })
        continue
      }
    }
  }
  console.log(data)
  return data
}
const editMock = (table: string): void => {
  router.push({
    name: 'TableDataMock',
    params: {
      projectId: projectId.value,
      table: table
    }
  })
}
getDbAdapter()
watch(
  () => route.params.projectId,
  (newVal) => {
    if (route.name != 'Tables' || newVal == projectId.value) {
      return
    }
    console.log(newVal)
    projectId.value = newVal as string
    project.value = projectStore.getProjectById(projectId.value)
    getDbAdapter()
  }
)
</script>
<style lang="less" scoped>
.tables {
  width: 100%;
  position: relative;
  .page-header {
    button {
      margin: 0 10px;
    }
  }
}
</style>
