<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PurchaseOrderShowPage from '@/Pages/Procurement/PurchaseOrders/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PurchaseOrderShowPage);
</script>

<template>
    <Head :title="(page.props as any).purchaseOrder?.po_number ?? 'Purchase Order'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
