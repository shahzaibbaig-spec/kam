<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import DashboardIndexPage from '@/Pages/Dashboard/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(DashboardIndexPage);
</script>

<template>
    <Head title="Dashboard" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
