<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientHistoryPage from '@/Pages/Patients/History';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientHistoryPage);
</script>

<template>
    <Head title="Patient History" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
