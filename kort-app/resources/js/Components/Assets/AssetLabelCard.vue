<script setup lang="ts">
defineProps<{
    label: {
        asset_name: string;
        tag_number: string | null;
        department_name?: string | null;
        location_name?: string | null;
        barcode_svg?: string | null;
        qr_svg?: string | null;
    };
}>();
</script>

<template>
    <div class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
            KORT Asset Management System
        </p>
        <p class="mt-2 text-sm font-semibold text-slate-950">{{ label.asset_name }}</p>
        <p class="mt-1 text-xs font-medium text-slate-600">{{ label.tag_number }}</p>
        <p v-if="label.department_name || label.location_name" class="mt-2 text-[11px] text-slate-500">
            {{ [label.department_name, label.location_name].filter(Boolean).join(' / ') }}
        </p>
        <div v-if="label.barcode_svg" class="mt-3 overflow-hidden rounded-2xl bg-slate-50 px-2 py-3" v-html="label.barcode_svg" />
        <div v-if="label.qr_svg" class="mt-3 flex justify-center rounded-2xl bg-slate-50 p-3" v-html="label.qr_svg" />
    </div>
</template>
