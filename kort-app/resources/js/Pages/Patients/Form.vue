<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PatientFormPage from '@/Pages/Patients/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PatientFormPage);
</script>

<template>
    <Head :title="(page.props as any).patient ? 'Edit Patient' : 'Register Patient'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
