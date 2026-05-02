<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import PharmacyLookupPage from '@/Pages/Pharmacy/Lookup';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(PharmacyLookupPage);
</script>

<template>
    <Head title="Pharmacy Lookup" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>

