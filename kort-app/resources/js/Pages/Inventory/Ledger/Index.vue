<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import InventoryLedgerIndexPage from '@/Pages/Inventory/Ledger/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(InventoryLedgerIndexPage);
</script>

<template>
    <Head title="Inventory Ledger" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
