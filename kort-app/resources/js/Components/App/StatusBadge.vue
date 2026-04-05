<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    value: string | boolean | null | undefined;
}>();

const normalized = computed(() => String(props.value ?? '').toLowerCase());
const formattedValue = computed(() => {
    if (props.value === true) {
        return 'Yes';
    }

    if (props.value === false) {
        return 'No';
    }

    return String(props.value ?? '').replaceAll('_', ' ');
});

const classes = computed(() => {
    const success = ['active', 'available', 'excellent', 'received', 'open', 'good', 'returned', 'true', 'approved', 'issued', 'completed', 'fully_ordered', 'fully_received'];
    const warning = ['pending', 'routine', 'general', 'scheduled', 'sterile', 'non_sterile', 'fair', 'in_use', 'under_cleaning', 'under_calibration', 'transferred', 'draft', 'submitted', 'under_review', 'partially_ordered', 'partially_received', 'low', 'normal', 'high', 'urgent'];
    const danger = ['inactive', 'suspended', 'critical', 'expired', 'quarantined', 'false', 'damaged', 'out_of_order', 'lost', 'condemned', 'disposed', 'closed_reassigned', 'rejected', 'cancelled', 'flagged'];

    if (normalized.value === 'under_maintenance') {
        return 'bg-amber-50 text-amber-800 ring-amber-200';
    }

    if (normalized.value === 'in_use') {
        return 'bg-blue-50 text-blue-700 ring-blue-200';
    }

    if (success.includes(normalized.value)) {
        return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    }

    if (danger.includes(normalized.value)) {
        return 'bg-rose-50 text-rose-700 ring-rose-200';
    }

    if (warning.includes(normalized.value)) {
        return 'bg-amber-50 text-amber-700 ring-amber-200';
    }

    return 'bg-slate-100 text-slate-700 ring-slate-200';
});
</script>

<template>
    <span
        :class="classes"
        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset"
    >
        {{ formattedValue }}
    </span>
</template>
