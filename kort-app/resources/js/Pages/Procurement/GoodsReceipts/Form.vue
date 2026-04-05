<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import GoodsReceiptFormPage from '@/Pages/Procurement/GoodsReceipts/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(GoodsReceiptFormPage);
</script>

<template>
    <Head title="Create Goods Receipt" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
