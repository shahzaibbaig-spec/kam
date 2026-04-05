<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import LoginPage from '@/Pages/Auth/Login';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

defineProps<{
    canResetPassword?: boolean;
    status?: string;
}>();

const page = usePage();
const component = markRaw(LoginPage);
</script>

<template>
    <Head title="Log in" />
    <ReactPageMount :component="component" :page-props="page.props" :component-props="$props" />
</template>
