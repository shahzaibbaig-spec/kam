<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import StatusBadge from '@/Components/App/StatusBadge.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';

interface UserRecord {
    id: number;
    department_id: number | null;
    default_location_id: number | null;
    name: string;
    email: string;
    employee_id: string | null;
    phone: string | null;
    designation: string | null;
    status: string;
    two_factor_required: boolean;
    roles: string[];
}

interface RoleOption {
    id: number;
    name: string;
}

interface DepartmentOption {
    id: number;
    name: string;
}

interface LocationOption {
    id: number;
    department_id: number;
    name: string;
}

const props = defineProps<{
    user: UserRecord | null;
    roles: RoleOption[];
    departments: DepartmentOption[];
    locations: LocationOption[];
}>();

const form = useForm({
    department_id: props.user?.department_id ?? '',
    default_location_id: props.user?.default_location_id ?? '',
    name: props.user?.name ?? '',
    email: props.user?.email ?? '',
    employee_id: props.user?.employee_id ?? '',
    phone: props.user?.phone ?? '',
    designation: props.user?.designation ?? '',
    status: props.user?.status ?? 'active',
    password: '',
    password_confirmation: '',
    role_names: props.user?.roles ?? [],
    two_factor_required: props.user?.two_factor_required ?? false,
});

const submit = () => {
    if (props.user) {
        form.put(route('admin.users.update', props.user.id));
        return;
    }

    form.post(route('admin.users.store'));
};
</script>

<template>
    <Head :title="user ? 'Edit User' : 'Create User'" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                :title="user ? 'Edit User' : 'Create User'"
                description="Assign staff to departments, define operational roles, and enforce secure access control."
            />
        </template>

        <form class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60" @submit.prevent="submit">
            <div class="grid gap-5 md:grid-cols-2">
                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Full Name</span>
                    <input v-model="form.name" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Email</span>
                    <input v-model="form.email" type="email" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Employee ID</span>
                    <input v-model="form.employee_id" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Phone</span>
                    <input v-model="form.phone" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Designation</span>
                    <input v-model="form.designation" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Status</span>
                    <select v-model="form.status" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </label>

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
                    <span class="font-medium">Default Location</span>
                    <select v-model="form.default_location_id" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="">Select location</option>
                        <option v-for="location in locations" :key="location.id" :value="location.id">
                            {{ location.name }}
                        </option>
                    </select>
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Password</span>
                    <input v-model="form.password" type="password" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Confirm Password</span>
                    <input v-model="form.password_confirmation" type="password" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                </label>
            </div>

            <div class="mt-8 space-y-4">
                <div>
                    <h2 class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Assigned Roles</h2>
                    <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <label
                            v-for="role in roles"
                            :key="role.id"
                            class="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
                        >
                            <span class="text-sm font-medium text-slate-700">{{ role.name }}</span>
                            <input v-model="form.role_names" :value="role.name" type="checkbox" class="rounded border-slate-300" />
                        </label>
                    </div>
                </div>

                <div class="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                    <input v-model="form.two_factor_required" type="checkbox" class="rounded border-slate-300" />
                    <span class="text-sm font-medium text-slate-700">Require two-factor readiness for this account</span>
                    <StatusBadge :value="form.two_factor_required ? 'enabled' : 'optional'" />
                </div>
            </div>

            <div class="mt-8 flex items-center justify-end">
                <button type="submit" class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" :disabled="form.processing">
                    {{ user ? 'Update User' : 'Create User' }}
                </button>
            </div>
        </form>
    </AuthenticatedLayout>
</template>
