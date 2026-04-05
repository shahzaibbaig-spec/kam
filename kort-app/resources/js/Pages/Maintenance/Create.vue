<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import MaintenanceCreatePage from '@/Pages/Maintenance/Create';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(MaintenanceCreatePage);
</script>

<template>
    <Head title="Create Maintenance Ticket" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
