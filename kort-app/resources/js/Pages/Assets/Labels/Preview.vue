<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetLabelPreviewPage from '@/Pages/Assets/Labels/Preview';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetLabelPreviewPage);
</script>

<template>
    <Head :title="((page.props as any).title ?? 'Asset Label Preview') as string" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
