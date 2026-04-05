<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';

interface DepartmentOption {
    id: number;
    name: string;
}

interface ParentOption {
    id: number;
    name: string;
}

interface LocationRecord {
    id: number;
    department_id: number;
    parent_id: number | null;
    name: string;
    code: string;
    building: string | null;
    floor: string | null;
    room: string | null;
    storage_type: string;
    description: string | null;
    barcode: string | null;
    is_active: boolean;
    is_isolation: boolean;
    is_emergency_reserve: boolean;
    is_sterile_storage: boolean;
}

const props = defineProps<{
    location: LocationRecord | null;
    departments: DepartmentOption[];
    parents: ParentOption[];
}>();

const form = useForm({
    department_id: props.location?.department_id ?? '',
    parent_id: props.location?.parent_id ?? '',
    name: props.location?.name ?? '',
    code: props.location?.code ?? '',
    building: props.location?.building ?? 'Burn Center',
    floor: props.location?.floor ?? '',
    room: props.location?.room ?? '',
    storage_type: props.location?.storage_type ?? 'general',
    description: props.location?.description ?? '',
    barcode: props.location?.barcode ?? '',
    is_active: props.location?.is_active ?? true,
    is_isolation: props.location?.is_isolation ?? false,
    is_emergency_reserve: props.location?.is_emergency_reserve ?? false,
    is_sterile_storage: props.location?.is_sterile_storage ?? false,
});

const submit = () => {
    if (props.location) {
        form.put(route('organization.locations.update', props.location.id));
        return;
    }

    form.post(route('organization.locations.store'));
};
</script>

<template>
    <Head :title="location ? 'Edit Location' : 'Create Location'" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                :title="location ? 'Edit Location' : 'Create Location'"
                description="Track sterile separation, emergency reserve stock points, and isolation mapping across the burn center."
            />
        </template>

        <form class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60" @submit.prevent="submit">
            <div class="grid gap-5 md:grid-cols-2">
                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Department</span>
                    <select v-model="form.department_id" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="">Select department</option>
                        <option v-for="department in departments" :key="department.id" :value="department.id">
                            {{ department.name }}
                        </option>
                    </select>
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Parent Location</span>
                    <select v-model="form.parent_id" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="">No parent location</option>
                        <option v-for="parent in parents" :key="parent.id" :value="parent.id">
                            {{ parent.name }}
                        </option>
                    </select>
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Location Name</span>
                    <input v-model="form.name" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Code</span>
                    <input v-model="form.code" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3 uppercase" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Building</span>
                    <input v-model="form.building" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Floor</span>
                    <input v-model="form.floor" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Room</span>
                    <input v-model="form.room" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Storage Type</span>
                    <select v-model="form.storage_type" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="general">General</option>
                        <option value="sterile">Sterile</option>
                        <option value="non_sterile">Non-Sterile</option>
                        <option value="isolation">Isolation</option>
                        <option value="emergency_reserve">Emergency Reserve</option>
                    </select>
                </label>

                <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
                    <span class="font-medium">Barcode</span>
                    <input v-model="form.barcode" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
                    <span class="font-medium">Description</span>
                    <textarea v-model="form.description" rows="4" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
            </div>

            <div class="mt-6 flex flex-wrap gap-6">
                <label class="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input v-model="form.is_active" type="checkbox" class="rounded border-slate-300" />
                    Active
                </label>
                <label class="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input v-model="form.is_isolation" type="checkbox" class="rounded border-slate-300" />
                    Isolation location
                </label>
                <label class="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input v-model="form.is_emergency_reserve" type="checkbox" class="rounded border-slate-300" />
                    Emergency reserve
                </label>
                <label class="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input v-model="form.is_sterile_storage" type="checkbox" class="rounded border-slate-300" />
                    Sterile storage
                </label>
            </div>

            <div class="mt-8 flex items-center justify-end">
                <button type="submit" class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" :disabled="form.processing">
                    {{ location ? 'Update Location' : 'Create Location' }}
                </button>
            </div>
        </form>
    </AuthenticatedLayout>
</template>
