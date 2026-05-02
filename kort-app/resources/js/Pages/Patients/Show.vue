<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientShowPage from '@/Pages/Patients/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientShowPage);
</script>

<template>
    <Head title="Patient Details" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
