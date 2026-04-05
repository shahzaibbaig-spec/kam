<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import StatusBadge from '@/Components/App/StatusBadge.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';

interface OptionRecord {
    value?: string;
    label?: string;
}

interface AssetRecord {
    id: number;
    asset_name: string;
    asset_code: string;
    asset_status: string;
    condition_status: string;
    department_name: string | null;
    location_name: string | null;
}

const props = defineProps<{
    asset: AssetRecord;
    options: {
        assetStatuses: OptionRecord[];
        conditionStatuses: OptionRecord[];
    };
}>();

const form = useForm({
    asset_status: props.asset.asset_status,
    condition_status: props.asset.condition_status,
    reason: '',
});

const submit = () => {
    form.post(route('assets.status.store', props.asset.id));
};
</script>

<template>
    <Head title="Change Asset Status" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                title="Change Asset Status"
                description="Apply controlled status and condition transitions with a mandatory operational reason."
            />
        </template>

        <div class="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
                <h2 class="text-lg font-semibold text-slate-950">Current State</h2>
                <div class="mt-5 space-y-3 text-sm text-slate-700">
                    <p><span class="font-medium text-slate-900">Asset:</span> {{ asset.asset_name }}</p>
                    <p><span class="font-medium text-slate-900">Code:</span> {{ asset.asset_code }}</p>
                    <p><span class="font-medium text-slate-900">Location:</span> {{ [asset.department_name, asset.location_name].filter(Boolean).join(' / ') || 'Not mapped' }}</p>
                    <div class="flex flex-wrap gap-2 pt-2">
                        <StatusBadge :value="asset.asset_status" />
                        <StatusBadge :value="asset.condition_status" />
                    </div>
                </div>
            </section>

            <form class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60" @submit.prevent="submit">
                <div class="grid gap-5 md:grid-cols-2">
                    <label class="space-y-2 text-sm text-slate-700">
                        <span class="font-medium">New Asset Status</span>
                        <select v-model="form.asset_status" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                            <option v-for="status in options.assetStatuses" :key="status.value" :value="status.value">
                                {{ status.label }}
                            </option>
                        </select>
                    </label>

                    <label class="space-y-2 text-sm text-slate-700">
                        <span class="font-medium">New Condition</span>
                        <select v-model="form.condition_status" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                            <option v-for="status in options.conditionStatuses" :key="status.value" :value="status.value">
                                {{ status.label }}
                            </option>
                        </select>
                    </label>

                    <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
                        <span class="font-medium">Reason</span>
                        <textarea v-model="form.reason" rows="5" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                        <p v-if="form.errors.reason" class="text-xs text-rose-600">{{ form.errors.reason }}</p>
                    </label>
                </div>

                <div class="mt-8 flex justify-end">
                    <button type="submit" class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" :disabled="form.processing">
                        Update Status
                    </button>
                </div>
            </form>
        </div>
    </AuthenticatedLayout>
</template>
