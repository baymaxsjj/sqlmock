<template>
  <div class="data-mock">
    <a-page-header
      :title="tableName"
      subtitle="数据模拟"
      class="page-header"
      :show-back="true"
      @back="$router.back()"
    >
      <template #extra>
        <div class="operate">
          <a-tooltip content="插入模式">
            <a-switch v-model="tableAttr.isBatch">
              <template #checked> 批量 </template>
              <template #unchecked> 单次 </template>
            </a-switch>
          </a-tooltip>
          <a-tooltip content="运行延迟">
            <a-input-number
              v-model="tableAttr.delay"
              :disabled="tableAttr.isBatch"
              style="width: 130px; margin: 0 5px"
              placeholder="运行延迟"
              mode="button"
              size="large"
              class="input-demo"
            />
          </a-tooltip>
          <a-tooltip content="运行次数">
            <a-input-number
              v-model="tableAttr.runCount"
              style="width: 130px; margin: 0 5px"
              placeholder="运行次数"
              mode="button"
              size="large"
              class="input-demo"
            />
          </a-tooltip>
          <a-button-group>
            <a-button size="large" status="danger" @click="geneMock"
              >一键Mock<template #icon>
                <icon-translate /> </template
            ></a-button>
            <a-button size="large" status="danger" @click="editVisible = true"
              >脚本<template #icon>
                <icon-code-block /></template
            ></a-button>
            <a-button size="large" status="warning" @click="runMock(true)"
              >测试<template #icon>
                <icon-record />
              </template>
            </a-button>
            <a-button size="large" status="success" @click="runMock(false)"
              >运行
              <template #icon>
                <icon-play-arrow-fill />
              </template>
            </a-button>
            <a-button size="large" type="primary" @click="saveProTab"
              >保存
              <template #icon>
                <icon-save />
              </template>
            </a-button>
          </a-button-group>
        </div>
      </template>
    </a-page-header>
    <a-table
      class="data-table"
      :columns="columns"
      :data="tableAttr.content"
      :loading="loading"
      :pagination="false"
    >
      <template #Remove="{ record }">
        <a-button
          class="oper_btn"
          type="text"
          size="large"
          shape="circle"
          :disabled="getIsRemove(record)"
          @click="record.Hidden = !record.Hidden"
        >
          <template #icon>
            <icon-check v-if="record.Hidden" />
            <icon-close v-else />
          </template>
        </a-button>
      </template>
      <template #Mock="{ record }">
        <codemirror v-model="record.Mock" placeholder="支持Mock语法和{{}}表达式" :tab-size="2" />
      </template>
      <template #Null="{ record }">
        <a-checkbox v-model="record.Null" disabled />
      </template>
      <template #Field="{ record }">
        <a-tag color="cyan">{{ record.Field }}</a-tag>
      </template>
      <template #Type="{ record }">
        <a-tag color="orange">{{ record.Type }}</a-tag>
      </template>
      <template #Key="{ record }">
        <a-tag color="gray">{{ record.Key }}</a-tag>
      </template>
      <template #Comment="{ record }">
        <a-tag color="magenta">{{ record.Comment }}</a-tag>
      </template>
      <template #Default="{ record }">
        <a-tag color="gray">{{ record.Default }}</a-tag>
      </template>
    </a-table>
    <a-modal v-model:visible="editVisible">
      <template #title> 运行脚本 </template>
      <codemirror
        v-model="tableAttr.runJs"
        placeholder="Code gose here..."
        :extensions="extensions"
        :style="{ height: '400px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
      />
    </a-modal>
    <a-modal v-model:visible="resultVisible" title="模拟结果" fullscreen>
      <a-table :data="mockResult" :columns="getTableColumn">
        <template #mockResult="{record}">
            <a-tag color="magenta">{{record.mockResult}}</a-tag>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
// import { oneDark } from '@codemirror/theme-one-dark'

import { Message, TableColumnData, TableData, Notification } from '@arco-design/web-vue'
import { reactive, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import MockFactory, { generateMock } from '../db/mock/mock-factory'
import baseDbAdapter from '../db/operation/base-db'
import { TableAttributes } from '../db/operation/table-type'
import useProjectStore, { ProjectTable } from '../stores/project'

const route = useRoute()
const loading = ref(true)

const tableName = ref()
const projectId = ref()
const projectStore = useProjectStore()
const project = ref()
const tableMock = ref()

const editVisible = ref(false)
const mockResult = ref<Array<Record<string, unknown>>>([])
const extensions = [javascript()]

const resultVisible = ref(false)

const tableAttr: ProjectTable = reactive({
  name: tableName,
  content: [],
  runJs: '',
  runCount: 10,
  delay: 10,
  isBatch: true
})

const initData = () => {
  tableName.value = route.params.table as string
  projectId.value = route.params.projectId as string
  project.value = projectStore.getProjectById(projectId.value)
  tableMock.value = project.value.tableMock[tableName.value]
  Object.assign(tableAttr, tableMock.value)
}

initData()

const getTableColumn = computed(() => {
  const columns: Array<TableColumnData> = []
  tableAttr?.content?.forEach((value) => {
    if (!value.Hidden) {
      columns.push({
        title: value.Field,
        dataIndex: value.Field
      })
    }
  })
  columns.push({
    title: '结果',
    dataIndex: 'mockResult',
    slotName: 'mockResult',
  })
  return columns
})

let dbAdapter: baseDbAdapter
const runMock = (isTest = false): void => {
  const mockConfig = { ...tableAttr }
  if (isTest) {
    mockConfig.isBatch = true
  }
  const mock = new MockFactory(mockConfig)
  resultVisible.value = true
  mockResult.value = []
  mock
    .then(async (data: Record<string, any> | Array<Record<string, any>>) => {
      let errInfo: unknown
      let mockData: Array<Record<string, unknown>>
      if (data instanceof Array) {
        mockData = data
      } else {
        mockData = [data.data]
      }
      if (!isTest) {
        try {
          await dbAdapter.insert(tableName.value, mockData)
        } catch (error) {
          errInfo = error
          console.log(error)
        }
      }
      mockData.forEach((value) => {
        if (errInfo) {
          value['mockResult'] = errInfo
        } else {
          value['mockResult'] = '成功'
        }
      })
      mockResult.value = [...mockResult.value, ...mockData]
    })
    .catch((err: any) => {
      // mock.stopRunMock()
      console.log('catch', err)
      Notification.error(err)
    })
    .startMock()
}
const getIsRemove = (record: TableAttributes): boolean => {
  if (record.Extra == 'auto_increment') {
    return false
  } else if (record.Default != null) {
    return false
  } else if (record.Null) {
    return false
  }
  return true
}
const geneMock=()=>{
  tableAttr?.content?.forEach((value) => {
    value.Mock=value.Mock??""
    if (!value.Hidden&&value.Mock=="") {
      value.Mock=generateMock(value.Field,value.Type)
    }
  })
}
// 合并字段
const mergeFields = (): void => {
  const tableContent = tableMock.value?.content
  if (tableContent) {
    let row: TableAttributes
    tableAttr.content.forEach((value) => {
      for (let i = 0; i < tableContent.length; i++) {
        row = tableContent[i]
        if (value.Field == row.Field) {
          value.Mock = row.Mock
          value.Hidden = row.Hidden
          break
        }
      }
    })
  }
}
//保存项目
const saveProTab = (): void => {
  project.value.tableMock[tableName.value] = tableAttr
  projectStore.updatedProjectById(project.value)
  Message.success('保存成功')
}
const columns: Array<TableColumnData> = [
  {
    title: '移除',
    slotName: 'Remove',
    width: 65,
    filterable: {
      filters: [
        {
          text: '填充字段',
          value: '0'
        },
        {
          text: '移除字段',
          value: '1'
        },
        {
          text: '显示全部',
          value: '2'
        }
      ],
      defaultFilteredValue: ['0'],
      filter: (filteredValue: string[], record: TableData): boolean => {
        const value = filteredValue[0]
        if (value == '2') {
          return true
        } else if (record.Hidden && value == '1') {
          return true
        } else if (!record.Hidden && value == '0') {
          return true
        }
        return false
      },
      multiple: false
    }
  },
  {
    title: '字段',
    dataIndex: 'Field',
    slotName: 'Field'
  },
  {
    title: '类型',
    slotName: 'Type',
    dataIndex: 'Type'
  },
  {
    title: 'Mock',
    slotName: 'Mock',
    width: 300
  },
  {
    title: '索引',
    slotName: 'Key',
    dataIndex: 'Key',
    width: 60
  },

  {
    title: '描述',
    slotName: 'Comment',
    dataIndex: 'Comment'
  },
  {
    title: '空',
    slotName: 'Null'
  },
  {
    title: '默认值',
    slotName: 'Default',
    dataIndex: 'Default'
  }
]
const getDbAdapter = (): void => {
  loading.value = true
  dbAdapter = projectStore.getProjectDbAdapter(projectId.value)
  dbAdapter
    .getTablesAttribute(tableName.value)
    .then((res: Array<TableAttributes>) => {
      tableAttr.content = res
      mergeFields()
      loading.value = false
    })
    .catch(() => {
      Message.error('数据库连接失败')
    })
}
getDbAdapter()
watch([() => route.params.table, () => route.params.projectId], ([tName, pId]) => {
  if (route.name != 'TableDataMock' || (tName == tableName.value && projectId.value == pId)) {
    return
  }
  getDbAdapter()
  initData()
})
</script>
<style lang="less" scoped>
.data-mock {
  height: 100%;
  box-sizing: border-box;
  .operate {
    display: flex;
    justify-content: end;
    align-items: center;
  }

}
</style>
