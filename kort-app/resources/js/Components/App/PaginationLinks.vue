<script setup lang="ts">
import { Link } from '@inertiajs/vue3';

defineProps<{
    links: Array<{ url: string | null; label: string; active: boolean }>;
}>();
</script>

<template>
    <div class="flex flex-wrap items-center gap-2">
        <template v-for="link in links" :key="`${link.label}-${link.url}`">
            <Link
                v-if="link.url"
                :href="link.url"
                preserve-scroll
                class="rounded-full px-4 py-2 text-sm font-medium transition"
                :class="
                    link.active
                        ? 'bg-slate-950 text-white'
                        : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                "
                v-html="link.label"
            />
            <span
                v-else
                class="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
                v-html="link.label"
            />
        </template>
    </div>
</template>
