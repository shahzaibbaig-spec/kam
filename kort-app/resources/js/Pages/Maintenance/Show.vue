<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import MaintenanceShowPage from '@/Pages/Maintenance/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(MaintenanceShowPage);
</script>

<template>
    <Head title="Maintenance Detail" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
