<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PurchaseOrderFormPage from '@/Pages/Procurement/PurchaseOrders/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PurchaseOrderFormPage);
</script>

<template>
    <Head :title="(page.props as any).purchaseOrder ? 'Edit Purchase Order' : 'Create Purchase Order'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
