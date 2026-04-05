<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import MaintenanceIndexPage from '@/Pages/Maintenance/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(MaintenanceIndexPage);
</script>

<template>
    <Head title="Maintenance Tickets" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
