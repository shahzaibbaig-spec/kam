<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import RequisitionShowPage from '@/Pages/Procurement/Requisitions/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(RequisitionShowPage);
</script>

<template>
    <Head :title="(page.props as any).requisition?.requisition_number ?? 'Purchase Requisition'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
