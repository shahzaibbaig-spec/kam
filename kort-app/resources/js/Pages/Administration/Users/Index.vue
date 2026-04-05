<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import PaginationLinks from '@/Components/App/PaginationLinks.vue';
import StatusBadge from '@/Components/App/StatusBadge.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import type { PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive } from 'vue';

interface RoleOption {
    id: number;
    name: string;
}

interface DepartmentOption {
    id: number;
    name: string;
}

interface UserRecord {
    id: number;
    name: string;
    email: string;
    employee_id: string | null;
    department_name: string | null;
    designation: string | null;
    status: string;
    roles: string[];
    last_login_at: string | null;
}

const props = defineProps<{
    users: PaginatedResponse<UserRecord>;
    roles: RoleOption[];
    departments: DepartmentOption[];
    filters: {
        search?: string;
        role?: string;
        department_id?: string;
        status?: string;
    };
}>();

const filters = reactive({
    search: props.filters.search ?? '',
    role: props.filters.role ?? '',
    department_id: props.filters.department_id ?? '',
    status: props.filters.status ?? '',
});

const applyFilters = () => {
    router.get(route('admin.users.index'), filters, {
        preserveState: true,
        replace: true,
    });
};
</script>

<template>
    <Head title="Users" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                title="Users"
                description="Create staff accounts, assign departments, and control role-based access."
                action-label="Add User"
                :action-href="route('admin.users.create')"
            />
        </template>

        <div class="space-y-6">
            <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
                <form class="grid gap-4 md:grid-cols-4" @submit.prevent="applyFilters">
                    <input
                        v-model="filters.search"
                        type="text"
                        placeholder="Search by name, email, or employee ID"
                        class="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                    />
                    <select v-model="filters.role" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                        <option value="">Any role</option>
                        <option v-for="role in roles" :key="role.id" :value="role.name">
                            {{ role.name }}
                        </option>
                    </select>
                    <select v-model="filters.department_id" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                        <option value="">Any department</option>
                        <option v-for="department in departments" :key="department.id" :value="department.id">
                            {{ department.name }}
                        </option>
                    </select>
                    <button type="submit" class="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">
                        Apply Filters
                    </button>
                </form>
            </section>

            <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200 text-sm">
                        <thead>
                            <tr class="text-left text-xs uppercase tracking-[0.25em] text-slate-500">
                                <th class="pb-3">User</th>
                                <th class="pb-3">Department</th>
                                <th class="pb-3">Roles</th>
                                <th class="pb-3">Status</th>
                                <th class="pb-3">Last Login</th>
                                <th class="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="user in users.data" :key="user.id">
                                <td class="py-4">
                                    <p class="font-semibold text-slate-900">{{ user.name }}</p>
                                    <p class="text-xs text-slate-500">
                                        {{ user.email }} · {{ user.employee_id ?? 'No ID' }}
                                    </p>
                                </td>
                                <td class="py-4 text-slate-700">
                                    {{ user.department_name ?? 'Unassigned' }}
                                </td>
                                <td class="py-4">
                                    <div class="flex flex-wrap gap-2">
                                        <StatusBadge v-for="role in user.roles" :key="role" :value="role" />
                                    </div>
                                </td>
                                <td class="py-4"><StatusBadge :value="user.status" /></td>
                                <td class="py-4 text-slate-700">{{ user.last_login_at ?? 'Never' }}</td>
                                <td class="py-4 text-right">
                                    <Link
                                        :href="route('admin.users.edit', user.id)"
                                        class="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
                                    >
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="mt-6">
                    <PaginationLinks :links="users.links" />
                </div>
            </section>
        </div>
    </AuthenticatedLayout>
</template>
