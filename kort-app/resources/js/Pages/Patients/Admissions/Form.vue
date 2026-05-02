<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientAdmissionFormPage from '@/Pages/Patients/Admissions/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientAdmissionFormPage);
</script>

<template>
    <Head title="Admit Patient" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
