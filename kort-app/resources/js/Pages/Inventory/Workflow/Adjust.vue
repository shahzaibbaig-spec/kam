<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryAdjustPage from '@/Pages/Inventory/Workflow/Adjust';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryAdjustPage);
</script>

<template>
    <Head title="Adjust Stock" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
