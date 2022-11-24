<template>
  <div class="data-mock">
    <div class="opera">
      <a-button size="large" type="outline" status="warning" @click="saveProTab">保存
        <template #icon>
          <icon-save />
        </template>
      </a-button>
      <a-button size="large" type="outline" status="warning" @click="runMock(false)">运行
        <template #icon>
          <icon-play-arrow-fill />
        </template>
      </a-button>
      <a-button size="large" type="outline" @click="runMock(true)">测试<template #icon>
          <icon-record />
        </template>
      </a-button>

      <a-button size="large" type="outline" @click="editVisible = true">Js(Ts)<template #icon>
          <icon-code />
        </template></a-button>
        <a-input-number style="width:160px;margin: 0 10px;" v-model="tableAttr.runCount" placeholder="运行次数" mode="button" size="large" class="input-demo" />
        <a-input-number style="width:160px;" v-model="tableAttr.delay" placeholder="运行延迟" mode="button" size="large" class="input-demo" />

    </div>
    <a-table class="data-table" :columns="columns" :data="tableAttr.content" :loading="loading" :pagination="false"
      :scroll="scrollPercent" column-resizable>
      <template #Remove="{ record, rowIndex }">
        <a-button class="oper_btn" type="text" size="large" shape="circle"
          :disabled="getIsRemove(record)" @click="record.Hidden=!record.Hidden">
          <template #icon>
            <icon-check v-if="record.Hidden"/>
            <icon-close v-else="record.Hidden"/>
          </template>
        </a-button>
      </template>
      <template #Mock="{ record, rowIndex }">
        <a-trigger trigger="focus" style="{min-width:500px}">
          <a-input placeholder="Focus on me" v-model="record.Mock" />
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
      <codemirror v-model="tableAttr.runJs" placeholder="Code gose here..." :extensions="extensions"
        :style="{ height: '400px' }" :autofocus="true" :indent-with-tab="true" :tabSize="2" />
    </a-modal>
    <a-modal v-model:visible="resultVisible" title="模拟结果" fullscreen>
      <a-table :data="mockResult" :columns="getTableColumn">
      </a-table>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import { Message, TableColumnData, TableData ,Notification} from "@arco-design/web-vue";
import { reactive, ref,computed } from "vue";
import { useRoute } from "vue-router";
import dbmock from "../db/operation";
import MockFactory from "../db/mock/MockFactory"
import baseDbAdapter, { dbConnectInfo } from "../db/operation/baseDb";
import { TableAttributes } from "../db/operation/tableType";
import useProjectStore, { ProjectTable } from "../stores/project";

const route = useRoute();
const loading = ref(true);
const tableName: string = route.params.table as string;
const projectName: string = route.params.name as string;
const projectStore = useProjectStore();
const project = projectStore.getProjectByName(projectName)
const tableMock = project.tableMock[tableName]
const editVisible = ref(false)
const mockResult=ref<Array<Object>>([])

const resultVisible=ref(false)

const tableAttr: ProjectTable = reactive({
  name: tableName,
  content: tableMock?.content,
  runJs: tableMock?.runJs??"",
  runCount: tableMock?.runCount??10,
  delay: tableMock?.delay??10
});
const getTableColumn=computed(()=>{
  const columns:Array<TableColumnData>=[]
  tableAttr.content.forEach((value)=>{
    if(!value.Hidden){
      columns.push({
        title:value.Field,
        dataIndex:value.Field
      })
    }
  })
  columns.push({
    title:'结果',
    dataIndex:'insert-result'
  })
  return columns;
})

let dbAdapter: baseDbAdapter
const runMock = (isTest=false) => {
  const mock = new MockFactory(tableAttr);
  resultVisible.value=true
  mockResult.value=[]
  mock.then((data: any) => {
    const mockDate=data.data;
    if(isTest){
      mockDate['insert-result']='测试'
      mockResult.value.push(mockDate)
    }else{
      dbAdapter.insert(tableName, mockDate).then((res => {
        mockDate['insert-result']='成功'
        mockResult.value.push(mockDate)
      })).catch((err)=>{
        mockDate['insert-result']='失败：'+err
        mockResult.value.push(mockDate)
      })
    }
    
  }).catch((err: any) => {
    // mock.stopRunMock()
    console.log("catch", err)
    Notification.error(err)
  }).startMock()
}
const getIsRemove = (record:any) => {
  if( record.Extra=='auto_increment'){
    return false
  }else if(record.Default != null){
    return false;
  }else if(record.Null){
    return false;
  }
  return true;
}
// 合并字段
const mergeFields=()=>{
  const tableContent=tableMock?.content;
  if(tableContent){
    let row;
    tableAttr.content.forEach((value,index)=>{
      for(let i=0;i<tableContent.length;i++){
        row=tableContent[i];
        if(value.Field==row.Field){
          value.Mock=row.Mock;
          value.Hidden=row.Hidden;
          break
        }
      }
    })
  }
}
//保存项目
const saveProTab = () => {
  project.tableMock[tableName] = tableAttr
  projectStore.updatedProject(project)
  Message.success("保存成功")
}
const extensions = [javascript(), oneDark]
const scrollPercent = {
  y: "100%"
};
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
      filter: (filteredValue: string[], record: TableData) => {
        console.log(record)
        const value=filteredValue[0]
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
    width: 250
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
  dbAdapter = projectStore.getProjectDbAdapter(name)
  dbAdapter
    .getTablesAttribute(tableName)
    .then((res: Array<TableAttributes>) => {
      tableAttr.content = res;
      mergeFields()
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