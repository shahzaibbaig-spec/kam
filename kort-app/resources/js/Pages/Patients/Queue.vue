<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import DoctorQueuePage from '@/Pages/Patients/Queue';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(DoctorQueuePage);
</script>

<template>
    <Head title="Doctor Queue" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
