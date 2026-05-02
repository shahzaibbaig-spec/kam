<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PharmacyReportsPage from '@/Pages/Pharmacy/Reports/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PharmacyReportsPage);
</script>

<template>
    <Head title="Pharmacy Reports" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>

