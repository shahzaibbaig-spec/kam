<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import VerifyEmailPage from '@/Pages/Auth/VerifyEmail';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

defineProps<{
    status?: string;
}>();

const page = usePage();
const component = markRaw(VerifyEmailPage);
</script>

<template>
    <Head title="Email Verification" />
    <ReactPageMount :component="component" :page-props="page.props" :component-props="$props" />
</template>
