<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetIssuePage from '@/Pages/Assets/Workflow/Issue';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetIssuePage);
</script>

<template>
    <Head title="Issue Asset" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
