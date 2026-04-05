<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import ConfirmPasswordPage from '@/Pages/Auth/ConfirmPassword';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(ConfirmPasswordPage);
</script>

<template>
    <Head title="Confirm Password" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
