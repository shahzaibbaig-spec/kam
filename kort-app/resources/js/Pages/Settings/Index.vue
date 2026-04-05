<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import SettingsIndexPage from '@/Pages/Settings/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(SettingsIndexPage);
</script>

<template>
    <Head title="Settings" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
