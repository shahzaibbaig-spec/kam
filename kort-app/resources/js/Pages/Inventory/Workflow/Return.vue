<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryReturnPage from '@/Pages/Inventory/Workflow/Return';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryReturnPage);
</script>

<template>
    <Head title="Return Stock" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
