import { createRouter, createWebHashHistory } from 'vue-router'
const Welcome = () => import('../views/Welcome.vue')
const Instructions = () => import('../views/Instructions.vue')
const Tables = () => import('../views/Tables.vue')
const TableDataMock = () => import('../views/TableDataMock.vue')
const routes = [
  {
    path: '/',
    redirect: '/instructions'
  },
  {
    path: '/instructions',
    component: Instructions,
    name: 'Instructions',
    meta: {
      title: '使用文档'
    }
  },
  {
    path: '/welcome',
    component: Welcome,
    name: 'Welcome',
    meta: {
      title: '欢迎'
    }
  },
  {
    path: '/:projectId/tables',
    component: Tables,
    name: 'Tables',
    meta: {
      title: '表'
    }
  },
  {
    path: '/:projectId/:table/edit_mock',
    component: TableDataMock,
    name: 'TableDataMock',
    meta: {
      title: ''
    }
  }
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
  // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
  history: createWebHashHistory(),
  routes // `routes: routes` 的缩写
})
export default router
