<script setup lang="ts">
import ReactPageMount from '@/Bridge/ReactPageMount.vue';
import SettingsNotificationsPage from '@/Pages/Settings/Notifications';
import { Head, usePage } from '@inertiajs/vue3';
import { markRaw } from 'vue';

const page = usePage();
const component = markRaw(SettingsNotificationsPage);
</script>

<template>
    <Head title="Notification Settings" />
    <ReactPageMount :component="component" :page-props="page.props" />
</template>
