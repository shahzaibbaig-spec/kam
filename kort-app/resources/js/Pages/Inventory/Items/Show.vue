<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryItemShowPage from '@/Pages/Inventory/Items/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryItemShowPage);
</script>

<template>
    <Head title="Inventory Item Details" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
