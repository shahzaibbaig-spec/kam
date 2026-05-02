<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientIndexPage from '@/Pages/Patients/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientIndexPage);
</script>

<template>
    <Head title="Patients" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
