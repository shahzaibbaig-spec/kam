<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import PaginationLinks from '@/Components/App/PaginationLinks.vue';
import StatusBadge from '@/Components/App/StatusBadge.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import type { PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive } from 'vue';

interface DepartmentOption {
    id: number;
    name: string;
}

interface LocationRecord {
    id: number;
    department_name: string | null;
    name: string;
    code: string;
    storage_type: string;
    is_active: boolean;
    is_isolation: boolean;
    is_emergency_reserve: boolean;
    is_sterile_storage: boolean;
}

const props = defineProps<{
    locations: PaginatedResponse<LocationRecord>;
    departments: DepartmentOption[];
    filters: {
        search?: string;
        department_id?: string;
        storage_type?: string;
        active?: string;
    };
}>();

const filters = reactive({
    search: props.filters.search ?? '',
    department_id: props.filters.department_id ?? '',
    storage_type: props.filters.storage_type ?? '',
    active: props.filters.active ?? '',
});

const applyFilters = () => {
    router.get(route('organization.locations.index'), filters, {
        preserveState: true,
        replace: true,
    });
};
</script>

<template>
    <Head title="Locations" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                title="Locations"
                description="Map wards, sterile zones, isolation rooms, emergency reserve points, and support spaces."
                action-label="Add Location"
                :action-href="route('organization.locations.create')"
            />
        </template>

        <div class="space-y-6">
            <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
                <form class="grid gap-4 md:grid-cols-4" @submit.prevent="applyFilters">
                    <input
                        v-model="filters.search"
                        type="text"
                        placeholder="Search by name or code"
                        class="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                    />
                    <select v-model="filters.department_id" class="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                        <option value="">Any department</option>
                        <option v-for="department in departments" :key="department.id" :value="department.id">
                            {{ department.name }}
                        </option>
                    </select>
                    <input
                        v-model="filters.storage_type"
                        type="text"
                        placeholder="Filter by storage type"
                        class="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                    />
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
                                <th class="pb-3">Location</th>
                                <th class="pb-3">Department</th>
                                <th class="pb-3">Storage</th>
                                <th class="pb-3">Flags</th>
                                <th class="pb-3">Status</th>
                                <th class="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="location in locations.data" :key="location.id">
                                <td class="py-4">
                                    <p class="font-semibold text-slate-900">{{ location.name }}</p>
                                    <p class="text-xs text-slate-500">{{ location.code }}</p>
                                </td>
                                <td class="py-4 text-slate-700">{{ location.department_name ?? 'N/A' }}</td>
                                <td class="py-4"><StatusBadge :value="location.storage_type" /></td>
                                <td class="py-4">
                                    <div class="flex flex-wrap gap-2">
                                        <StatusBadge v-if="location.is_isolation" value="Isolation" />
                                        <StatusBadge v-if="location.is_emergency_reserve" value="Reserve" />
                                        <StatusBadge v-if="location.is_sterile_storage" value="Sterile" />
                                    </div>
                                </td>
                                <td class="py-4">
                                    <StatusBadge :value="location.is_active ? 'active' : 'inactive'" />
                                </td>
                                <td class="py-4 text-right">
                                    <Link
                                        :href="route('organization.locations.edit', location.id)"
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
                    <PaginationLinks :links="locations.links" />
                </div>
            </section>
        </div>
    </AuthenticatedLayout>
</template>
