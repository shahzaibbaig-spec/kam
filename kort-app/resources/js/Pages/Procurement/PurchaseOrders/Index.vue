<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PurchaseOrderIndexPage from '@/Pages/Procurement/PurchaseOrders/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PurchaseOrderIndexPage);
</script>

<template>
    <Head title="Purchase Orders" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
