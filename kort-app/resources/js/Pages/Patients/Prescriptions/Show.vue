<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientPrescriptionShowPage from '@/Pages/Patients/Prescriptions/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientPrescriptionShowPage);
</script>

<template>
    <Head title="Prescription Detail" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
