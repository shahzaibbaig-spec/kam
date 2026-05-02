<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientSearchPage from '@/Pages/Patients/Search';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientSearchPage);
</script>

<template>
    <Head title="Patient Search" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
