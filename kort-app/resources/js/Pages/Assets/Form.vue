<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetFormPage from '@/Pages/Assets/Form';
import { Head, usePage } from '@inertiajs/vue3';
import { computed, markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetFormPage);
const title = computed(() => ((page.props as any).asset ? 'Edit Asset' : 'Create Asset'));
</script>

<template>
    <Head :title="title" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
