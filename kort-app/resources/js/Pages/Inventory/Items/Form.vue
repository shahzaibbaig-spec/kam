<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryItemFormPage from '@/Pages/Inventory/Items/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryItemFormPage);
</script>

<template>
    <Head title="Inventory Item Form" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
