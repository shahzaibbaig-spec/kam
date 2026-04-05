<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import MaintenanceEditPage from '@/Pages/Maintenance/Edit';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(MaintenanceEditPage);
</script>

<template>
    <Head title="Edit Maintenance Ticket" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
