<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import ResetPasswordPage from '@/Pages/Auth/ResetPassword';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

defineProps<{
    email: string;
    token: string;
}>();

const page = usePage();
const component = markRaw(ResetPasswordPage);
</script>

<template>
    <Head title="Reset Password" />
    <ReactPageMount :component="component" :page-props="page.props" :component-props="$props" />
</template>
