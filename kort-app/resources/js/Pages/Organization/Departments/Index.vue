<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import PaginationLinks from '@/Components/App/PaginationLinks.vue';
import StatusBadge from '@/Components/App/StatusBadge.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import type { PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive } from 'vue';

interface DepartmentRecord {
    id: number;
    name: string;
    code: string;
    type: string;
    manager_name: string | null;
    is_active: boolean;
    users_count: number;
    locations_count: number;
}

const props = defineProps<{
    departments: PaginatedResponse<DepartmentRecord>;
    filters: {
        search?: string;
        type?: string;
        active?: string;
    };
}>();

const filters = reactive({
    search: props.filters.search ?? '',
    type: props.filters.type ?? '',
    active: props.filters.active ?? '',
});

const applyFilters = () => {
    router.get(route('organization.departments.index'), filters, {
        preserveState: true,
        replace: true,
    });
};
</script>

<template>
    <Head title="Departments" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                title="Departments"
                description="Manage burn center departments, cost centers, and accountability owners."
                action-label="Add Department"
                :action-href="route('organization.departments.create')"
            />
        </template>

        <div class="space-y-6">
            <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
                <form class="grid gap-4 md:grid-cols-4" @submit.prevent="applyFilters">
                    <input
                        v-model="filters.search"
                        type="text"
                        placeholder="Search by name or code"
                        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                    <input
                        v-model="filters.type"
                        type="text"
                        placeholder="Filter by type"
                        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                    <select
                        v-model="filters.active"
                        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    >
                        <option value="">Any status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
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
                                <th class="pb-3">Department</th>
                                <th class="pb-3">Manager</th>
                                <th class="pb-3">Users</th>
                                <th class="pb-3">Locations</th>
                                <th class="pb-3">Status</th>
                                <th class="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="department in departments.data" :key="department.id">
                                <td class="py-4">
                                    <p class="font-semibold text-slate-900">{{ department.name }}</p>
                                    <p class="text-xs text-slate-500">
                                        {{ department.code }} · {{ department.type }}
                                    </p>
                                </td>
                                <td class="py-4 text-slate-700">{{ department.manager_name ?? 'Unassigned' }}</td>
                                <td class="py-4 text-slate-700">{{ department.users_count }}</td>
                                <td class="py-4 text-slate-700">{{ department.locations_count }}</td>
                                <td class="py-4">
                                    <StatusBadge :value="department.is_active ? 'active' : 'inactive'" />
                                </td>
                                <td class="py-4 text-right">
                                    <Link
                                        :href="route('organization.departments.edit', department.id)"
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
                    <PaginationLinks :links="departments.links" />
                </div>
            </section>
        </div>
    </AuthenticatedLayout>
</template>
