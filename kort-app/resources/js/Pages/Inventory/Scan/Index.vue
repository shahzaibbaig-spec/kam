<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryScanPage from '@/Pages/Inventory/Scan/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryScanPage);
</script>

<template>
    <Head title="Scan Item" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
