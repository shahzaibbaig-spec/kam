<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import ForgotPasswordPage from '@/Pages/Auth/ForgotPassword';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

defineProps<{
    status?: string;
}>();

const page = usePage();
const component = markRaw(ForgotPasswordPage);
</script>

<template>
    <Head title="Forgot Password" />
    <ReactPageMount :component="component" :page-props="page.props" :component-props="$props" />
</template>
