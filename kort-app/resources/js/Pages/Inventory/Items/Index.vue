<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryItemsIndexPage from '@/Pages/Inventory/Items/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryItemsIndexPage);
</script>

<template>
    <Head title="Inventory Items" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
