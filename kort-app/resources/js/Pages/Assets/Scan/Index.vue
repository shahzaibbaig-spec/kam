<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetScanPage from '@/Pages/Assets/Scan/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetScanPage);
</script>

<template>
    <Head title="Scan Asset" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
