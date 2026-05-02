<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientAdmissionShowPage from '@/Pages/Patients/Admissions/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientAdmissionShowPage);
</script>

<template>
    <Head title="Admission Detail" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
