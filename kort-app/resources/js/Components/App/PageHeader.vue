<script setup lang="ts">
import { Link } from '@inertiajs/vue3';

defineProps<{
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
}>();
</script>

<template>
    <div
        class="flex flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 p-6 shadow-surface lg:flex-row lg:items-center lg:justify-between"
    >
        <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
                KORT Assest Managment System
            </p>
            <h1 class="text-2xl font-semibold text-slate-950 sm:text-3xl">{{ title }}</h1>
            <p v-if="description" class="max-w-3xl text-sm leading-6 text-slate-600">
                {{ description }}
            </p>
        </div>

        <Link
            v-if="actionLabel && actionHref"
            :href="actionHref"
            class="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-panel transition hover:bg-blue-500"
        >
            {{ actionLabel }}
        </Link>
    </div>
</template>
