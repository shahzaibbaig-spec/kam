<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import SupplierShowPage from '@/Pages/Procurement/Suppliers/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(SupplierShowPage);
</script>

<template>
    <Head :title="(page.props as any).supplier?.supplier_name ?? 'Supplier'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
