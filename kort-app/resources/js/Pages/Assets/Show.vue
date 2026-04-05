<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetShowPage from '@/Pages/Assets/Show';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetShowPage);
</script>

<template>
    <Head :title="(page.props as any).asset?.asset_name ?? 'Asset Detail'" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
