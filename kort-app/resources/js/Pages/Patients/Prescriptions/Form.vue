<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientPrescriptionFormPage from '@/Pages/Patients/Prescriptions/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientPrescriptionFormPage);
</script>

<template>
    <Head title="Create Prescription" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
