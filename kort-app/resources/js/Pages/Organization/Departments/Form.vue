<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';

interface ManagerOption {
    id: number;
    name: string;
}

interface DepartmentRecord {
    id: number;
    name: string;
    code: string;
    type: string;
    cost_center: string | null;
    description: string | null;
    phone: string | null;
    email: string | null;
    manager_user_id: number | null;
    is_active: boolean;
    is_clinical: boolean;
}

const props = defineProps<{
    department: DepartmentRecord | null;
    managers: ManagerOption[];
}>();

const form = useForm({
    name: props.department?.name ?? '',
    code: props.department?.code ?? '',
    type: props.department?.type ?? 'burn_clinical',
    cost_center: props.department?.cost_center ?? '',
    description: props.department?.description ?? '',
    phone: props.department?.phone ?? '',
    email: props.department?.email ?? '',
    manager_user_id: props.department?.manager_user_id ?? '',
    is_active: props.department?.is_active ?? true,
    is_clinical: props.department?.is_clinical ?? true,
});

const submit = () => {
    if (props.department) {
        form.put(route('organization.departments.update', props.department.id));
        return;
    }

    form.post(route('organization.departments.store'));
};
</script>

<template>
    <Head :title="department ? 'Edit Department' : 'Create Department'" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                :title="department ? 'Edit Department' : 'Create Department'"
                description="Capture department structure, cost ownership, and clinical context for burn center operations."
            />
        </template>

        <form class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60" @submit.prevent="submit">
            <div class="grid gap-5 md:grid-cols-2">
                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Department Name</span>
                    <input v-model="form.name" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                    <p v-if="form.errors.name" class="text-xs text-rose-600">{{ form.errors.name }}</p>
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Code</span>
                    <input v-model="form.code" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3 uppercase" />
                    <p v-if="form.errors.code" class="text-xs text-rose-600">{{ form.errors.code }}</p>
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Type</span>
                    <select v-model="form.type" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="burn_clinical">Burn Clinical</option>
                        <option value="biomedical">Biomedical</option>
                        <option value="stores">Stores</option>
                        <option value="pharmacy">Pharmacy</option>
                        <option value="procurement">Procurement</option>
                        <option value="finance">Finance</option>
                        <option value="administration">Administration</option>
                        <option value="support">Support</option>
                    </select>
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Cost Center</span>
                    <input v-model="form.cost_center" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Phone</span>
                    <input v-model="form.phone" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Email</span>
                    <input v-model="form.email" type="email" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
                    <span class="font-medium">Manager</span>
                    <select v-model="form.manager_user_id" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="">Select manager</option>
                        <option v-for="manager in managers" :key="manager.id" :value="manager.id">
                            {{ manager.name }}
                        </option>
                    </select>
                </label>

                <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
                    <span class="font-medium">Description</span>
                    <textarea v-model="form.description" rows="4" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
            </div>

            <div class="mt-6 flex flex-wrap gap-6">
                <label class="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input v-model="form.is_active" type="checkbox" class="rounded border-slate-300 text-slate-900" />
                    Active department
                </label>
                <label class="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input v-model="form.is_clinical" type="checkbox" class="rounded border-slate-300 text-slate-900" />
                    Clinical department
                </label>
            </div>

            <div class="mt-8 flex items-center justify-end gap-3">
                <button type="submit" class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" :disabled="form.processing">
                    {{ department ? 'Update Department' : 'Create Department' }}
                </button>
            </div>
        </form>
    </AuthenticatedLayout>
</template>
