<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    label: string;
    value: number | string;
    accent?: string;
}>();

const accentClasses = computed(() => {
    const palette: Record<string, string> = {
        slate: 'from-slate-900 to-slate-700',
        teal: 'from-blue-700 to-blue-500',
        amber: 'from-amber-600 to-orange-500',
        rose: 'from-rose-600 to-pink-500',
        cyan: 'from-cyan-700 to-sky-500',
        emerald: 'from-emerald-700 to-green-500',
    };

    return palette[props.accent ?? 'slate'] ?? palette.slate;
});
</script>

<template>
    <div class="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/95 p-5 shadow-surface transition duration-200 hover:-translate-y-0.5">
        <div class="flex items-start justify-between gap-4">
            <div>
                <p class="text-sm font-medium text-slate-500">{{ label }}</p>
                <p class="mt-3 text-3xl font-semibold text-slate-950">{{ value }}</p>
            </div>
            <div :class="['h-3 w-20 rounded-full bg-gradient-to-r shadow-sm', accentClasses]" />
        </div>
    </div>
</template>
