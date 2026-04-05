<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import SettingsLabelsPage from '@/Pages/Settings/Labels';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(SettingsLabelsPage);
</script>

<template>
    <Head title="Label Settings" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
