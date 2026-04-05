<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import SupplierIndexPage from '@/Pages/Procurement/Suppliers/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(SupplierIndexPage);
</script>

<template>
    <Head title="Suppliers" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
