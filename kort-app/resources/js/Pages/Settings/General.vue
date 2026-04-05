<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import SettingsGeneralPage from '@/Pages/Settings/General';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(SettingsGeneralPage);
</script>

<template>
    <Head title="General Settings" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
