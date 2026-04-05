<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetIndexPage from '@/Pages/Assets/Index';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetIndexPage);
</script>

<template>
    <Head title="Asset Registry" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
