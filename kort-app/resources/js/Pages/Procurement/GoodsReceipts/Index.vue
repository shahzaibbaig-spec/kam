<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import GoodsReceiptIndexPage from '@/Pages/Procurement/GoodsReceipts/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(GoodsReceiptIndexPage);
</script>

<template>
    <Head title="Goods Receipts" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
