<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryReceivePage from '@/Pages/Inventory/Workflow/Receive';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryReceivePage);
</script>

<template>
    <Head title="Receive Stock" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
