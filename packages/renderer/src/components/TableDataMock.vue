<template>
  <div class="data-mock">
    <div class="opera">
      <a-button size="large" type="outline" status="warning" @click="saveProTab">保存
        <template #icon>
          <icon-save />
        </template>
      </a-button>
      <a-button size="large" type="outline" status="warning" @click="runMock">运行
        <template #icon>
          <icon-play-arrow-fill />
        </template>
      </a-button>
      <a-button size="large" type="outline">测试<template #icon>
          <icon-record />
        </template></a-button>

      <a-button size="large" type="outline" @click="editVisible=true">Js(Ts)<template #icon>
          <icon-code />
        </template></a-button>

    </div>
    <a-table class="data-table" :columns="columns" :data="tableAttr.content" :loading="loading" :pagination="false"
      :scroll="scrollPercent" column-resizable>
      <template #Remove="{ record, rowIndex }">
        <a-button class="oper_btn" type="text" size="large" shape="circle"
          :disabled="!record.Null && (record.Default == null)" @click="removeField(record.Field)">
          <template #icon>
            <icon-close />

          </template>
        </a-button>
      </template>
      <template #Mock="{ record, rowIndex }">
        <a-trigger trigger="focus" style="{min-width:500px}">
          <a-input placeholder="Focus on me" v-model="tableAttr.content[rowIndex].Mock" />
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
      <template #title>
        运行脚本
      </template>
      <codemirror
        v-model="tableAttr.runJs"
        placeholder="Code gose here..."
        :extensions="extensions"
        :style="{ height: '400px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tabSize="2"
      />
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { Message, TableColumnData, TableData } from "@arco-design/web-vue";
import { reactive, ref } from "vue-demi";
import { useRoute } from "vue-router";
import dbmock from "../db/operation";
import MockFactory from "../db/mock/MockFactory"
import baseDbAdapter, { dbConnectInfo } from "../db/operation/baseDb";
import { TableAttributes } from "../db/operation/tableType";
import useProjectStore, { ProjectTable } from "../stores/project";

const route = useRoute();
const loading = ref(true);
const tableName: string = route.params.table as string;
const projectName:string =route.params.name as string;
const projectStore = useProjectStore();
const project=projectStore.getProjectByName(projectName)
const tableMock=project.tableMock[tableName]
const tableAttr: ProjectTable = reactive({
  name:tableName,
  content:tableMock?.content,
  runJs: "",
  runCount:10,
  delay:10
});

let dbAdapter:baseDbAdapter
const runMock = () => {
  const mock = new MockFactory(tableAttr);
  mock.then((res: any) => {
    console.log("then", res)
    dbAdapter.insert(tableName,res.data).then((res=>{
      console.log(res)
    }))
  }).catch((err: any) => {
    // mock.stopRunMock()
    console.log("catch", err)
  }).startMock()
}
const removeField = (field: string) => {
  console.log(field)
  for (let i = 0, len = tableAttr.content.length; i < len; i++) {
    if (tableAttr.content[i].Field == field) {
      tableAttr.content[i].Hidden = true
      break;
    }
  }
}
//保存项目
const saveProTab=()=>{
  project.tableMock[tableName]=tableAttr
  projectStore.updatedProject(project)
  Message.success("保存成功")
}
const extensions = [javascript(), oneDark]
const scrollPercent = {
  y: "100%"
};
const editVisible = ref(false)
const columns: Array<TableColumnData> = [
  {
    title: "移除",
    slotName: "Remove",
    filterable: {
      filters: [{
        text: '填充字段',
        value: '0',
      }, {
        text: '移除字段',
        value: '1',
      },
      {
        text: '显示全部',
        value: '2',
      }
      ],
      defaultFilteredValue: ['0'],
      filter: (value: string, record: TableData) => {
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
    title: "字段",
    dataIndex: "Field",
  },
  {
    title: "类型",
    dataIndex: "Type",
  },
  {
    title: "Mock",
    slotName: "Mock",
    width:250
  },
  {
    title: "索引",
    dataIndex: "Key",
  },

  {
    title: "描述",
    dataIndex: "Comment",
  },
  {
    title: "空",
    slotName: "Null",
  },
  {
    title: "默认值",
    dataIndex: "Default",
  },
];
const getDbAdapter = () => {
  const name: string = route.params.name as string;
  loading.value = true;
  dbAdapter =projectStore.getProjectDbAdapter(name)
  dbAdapter
    .getTablesAttribute(tableName)
    .then((res: Array<TableAttributes>) => {
      tableAttr.content = res;
      loading.value = false;
    })
    .catch((e) => {
      Message.error("数据库连接失败");
    });
};
getDbAdapter();
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

    button {
      margin: 0 10px;
    }
  }

  .data-table {
    flex-grow: 1;
  }
}
</style>