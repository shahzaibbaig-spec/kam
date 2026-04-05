<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AuditLogsIndexPage from '@/Pages/Security/AuditLogs/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AuditLogsIndexPage);
</script>

<template>
    <Head title="Audit Logs" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
