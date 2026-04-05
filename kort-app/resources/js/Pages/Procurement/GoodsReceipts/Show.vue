<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import GoodsReceiptShowPage from '@/Pages/Procurement/GoodsReceipts/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(GoodsReceiptShowPage);
</script>

<template>
    <Head :title="(page.props as any).goodsReceipt?.grn_number ?? 'Goods Receipt'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
