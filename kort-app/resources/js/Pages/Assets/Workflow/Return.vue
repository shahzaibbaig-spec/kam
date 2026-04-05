<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetReturnPage from '@/Pages/Assets/Workflow/Return';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetReturnPage);
</script>

<template>
    <Head title="Return Asset" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
