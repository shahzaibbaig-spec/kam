<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryIssuePage from '@/Pages/Inventory/Workflow/Issue';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryIssuePage);
</script>

<template>
    <Head title="Issue Stock" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
