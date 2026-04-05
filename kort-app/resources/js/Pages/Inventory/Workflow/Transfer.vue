<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryTransferPage from '@/Pages/Inventory/Workflow/Transfer';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryTransferPage);
</script>

<template>
    <Head title="Transfer Stock" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
