<template>
  <div class="data-mock">
    <div class="opera">
      <a-button size="large" type="outline" status="warning" @click="saveProTab"
        >保存
        <template #icon>
          <icon-save />
        </template>
      </a-button>
      <a-button size="large" type="outline" status="warning" @click="runMock(false)"
        >运行
        <template #icon>
          <icon-play-arrow-fill />
        </template>
      </a-button>
      <a-button size="large" type="outline" @click="runMock(true)"
        >测试<template #icon>
          <icon-record />
        </template>
      </a-button>

      <a-button size="large" type="outline" @click="editVisible = true"
        >Js(Ts)<template #icon> <icon-code /> </template
      ></a-button>
      <a-input-number
        v-model="tableAttr.runCount"
        style="width: 160px; margin: 0 10px"
        placeholder="运行次数"
        mode="button"
        size="large"
        class="input-demo"
      />
      <a-input-number
        v-model="tableAttr.delay"
        :disabled="tableAttr.isBatch"
        style="width: 160px"
        placeholder="运行延迟"
        mode="button"
        size="large"
        class="input-demo"
      />
      <a-switch v-model="tableAttr.isBatch">
        <template #checked> 批量 </template>
        <template #unchecked> 单次 </template>
      </a-switch>
    </div>
    <a-table
      class="data-table"
      :columns="columns"
      :data="tableAttr.content"
      :loading="loading"
      :pagination="false"
      :scroll="scrollPercent"
      column-resizable
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
        <a-trigger
          trigger="focus"
          style="
             {
              min-width: 500px;
            }
          "
        >
          <a-input v-model="record.Mock" placeholder="Focus on me" />
          <template #content>
            <div class="demo-basic">
              <!-- {{record}} -->
            </div>
          </template>
        </a-trigger>
      </template>
      <template #Null="{ record }">
        <a-checkbox v-model="record.Null" disabled />
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
      <a-table :data="mockResult" :columns="getTableColumn"> </a-table>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

import { Message, TableColumnData, TableData, Notification } from '@arco-design/web-vue'
import { reactive, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import MockFactory from '../db/mock/mock-factory'
import baseDbAdapter from '../db/operation/base-db'
import { TableAttributes } from '../db/operation/table-type'
import useProjectStore, { ProjectTable } from '../stores/project'

const route = useRoute()
const loading = ref(true)
const tableName: string = route.params.table as string
const projectId: string = route.params.projectId as string
const projectStore = useProjectStore()
const project = projectStore.getProjectById(projectId)
const tableMock = project.tableMock[tableName]
const editVisible = ref(false)
const mockResult = ref<Array<Record<string, unknown>>>([])
const extensions = [javascript(), oneDark]

const resultVisible = ref(false)

const tableAttr: ProjectTable = reactive({
  name: tableName,
  content: tableMock?.content,
  runJs: tableMock?.runJs ?? '',
  runCount: tableMock?.runCount ?? 10,
  delay: tableMock?.delay ?? 10,
  isBatch: tableMock?.isBatch ?? true
})
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
    dataIndex: 'mockresult'
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
          await dbAdapter.insert(tableName, mockData)
        } catch (error) {
          errInfo = error
          console.log(error)
        }
      }
      mockData.forEach((value) => {
        if (errInfo) {
          value['mockresult'] = errInfo
        } else {
          value['mockresult'] = '成功'
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
// 合并字段
const mergeFields = (): void => {
  const tableContent = tableMock?.content
  if (tableContent) {
    let row
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
  project.tableMock[tableName] = tableAttr
  projectStore.updatedProjectById(project)
  Message.success('保存成功')
}
const scrollPercent = {
  y: '100%'
}
const columns: Array<TableColumnData> = [
  {
    title: '移除',
    slotName: 'Remove',
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
    dataIndex: 'Field'
  },
  {
    title: '类型',
    dataIndex: 'Type'
  },
  {
    title: 'Mock',
    slotName: 'Mock',
    width: 250
  },
  {
    title: '索引',
    dataIndex: 'Key'
  },

  {
    title: '描述',
    dataIndex: 'Comment'
  },
  {
    title: '空',
    slotName: 'Null'
  },
  {
    title: '默认值',
    dataIndex: 'Default'
  }
]
const getDbAdapter = (): void => {
  loading.value = true
  dbAdapter = projectStore.getProjectDbAdapter(projectId)
  dbAdapter
    .getTablesAttribute(tableName)
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
</script>
<style lang="less" scoped>
.data-mock {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;

  .opera {
    padding: 10px 0;
    display: flex;
    justify-content: end;
    flex-direction: row-reverse;
    align-items: center;

    button {
      margin: 0 10px;
    }
  }

  .data-table {
    flex-grow: 1;
  }
}
</style>
