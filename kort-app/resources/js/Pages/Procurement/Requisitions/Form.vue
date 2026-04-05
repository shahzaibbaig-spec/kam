<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import RequisitionFormPage from '@/Pages/Procurement/Requisitions/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(RequisitionFormPage);
</script>

<template>
    <Head :title="(page.props as any).requisition ? 'Edit Requisition' : 'Create Requisition'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
