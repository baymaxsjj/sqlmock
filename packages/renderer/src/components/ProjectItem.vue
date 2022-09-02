<template>
    <ul class="project-list">
        <router-link :to="`/${item.name}/tables`" custom v-for="(item) of projects" :key="item.name" v-slot="{ navigate }">
            <li class="item" @click="navigate" @keypress.enter="navigate" role="link">
                <span class="lable" :title="item?.connInfo?.type">{{ item?.connInfo?.type }}</span>
                <span class="name">{{ item.name }}</span>
            </li>
        </router-link>
    </ul>
</template>
<script lang="ts" setup>
import useProjectStore from "../stores/project";

const projectStore = useProjectStore()
const projects = projectStore.getProjects
</script>
<style lang="less" scoped>
.project-list {
    padding: 0 20px;

    .item {
        height: 40px;
        display: flex;
        align-items: center;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: all .5s;
        color: var(--color-text-2);
        border-radius: 5px;
        padding: 0 10px;
        cursor: pointer;

        &:hover {
            background-color: rgb(var(--primary-4));
        }

        .lable {
            width: 50px;
            text-align: center;
            font-size: 10px;
            border-radius: 4px;
            padding: 4px;
            background-color: rgb(var(--primary-3));
            color: var(--color-text-3);
            margin: 0 5px;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .name {
            font-size: 14px;
            color: var(--color-text-1);
        }
    }
}
</style>