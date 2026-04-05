<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import MaintenanceSchedulePage from '@/Pages/Maintenance/Schedule';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(MaintenanceSchedulePage);
</script>

<template>
    <Head title="Calibration Schedule" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
