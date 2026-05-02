<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientDiagnosisFormPage from '@/Pages/Patients/Diagnoses/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientDiagnosisFormPage);
</script>

<template>
    <Head title="Create Diagnosis" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
