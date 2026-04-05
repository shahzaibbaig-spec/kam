<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetTransferPage from '@/Pages/Assets/Workflow/Transfer';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetTransferPage);
</script>

<template>
    <Head title="Transfer Asset" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
