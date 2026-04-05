<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import SupplierFormPage from '@/Pages/Procurement/Suppliers/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(SupplierFormPage);
</script>

<template>
    <Head :title="(page.props as any).supplier ? 'Edit Supplier' : 'Add Supplier'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
