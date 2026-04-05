<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import AssetTagGeneratePage from '@/Pages/Assets/Tags/Generate';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(AssetTagGeneratePage);
</script>

<template>
    <Head title="Generate Asset Tag" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
