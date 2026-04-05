<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import RequisitionIndexPage from '@/Pages/Procurement/Requisitions/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(RequisitionIndexPage);
</script>

<template>
    <Head title="Purchase Requisitions" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
