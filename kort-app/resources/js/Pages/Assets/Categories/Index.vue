<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import PaginationLinks from '@/Components/App/PaginationLinks.vue';
import StatusBadge from '@/Components/App/StatusBadge.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import type { PaginatedResponse } from '@/types';
import { Head, Link, router } from '@inertiajs/vue3';
import { reactive } from 'vue';

interface CategoryRecord {
    id: number;
    name: string;
    code: string;
    description: string | null;
    parent_id: number | null;
    parent_name: string | null;
    is_active: boolean;
    assets_count: number;
}

interface ParentOption {
    id: number;
    name: string;
}

const props = defineProps<{
    categories: PaginatedResponse<CategoryRecord>;
    filters: {
        search?: string;
        active?: string;
        parent_id?: string;
    };
    parents: ParentOption[];
}>();

const filters = reactive({
    search: props.filters.search ?? '',
    active: props.filters.active ?? '',
    parent_id: props.filters.parent_id ?? '',
});

const applyFilters = () => {
    router.get(route('assets.categories.index'), filters, {
        preserveState: true,
        replace: true,
    });
};
</script>

<template>
    <Head title="Asset Categories" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                title="Asset Categories"
                description="Define the fixed asset classes used across burn ICU, wards, procedure rooms, and support departments."
                action-label="Add Category"
                :action-href="route('assets.categories.create')"
            />
        </template>

        <div class="space-y-6">
            <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
                <form class="grid gap-4 md:grid-cols-4" @submit.prevent="applyFilters">
                    <input
                        v-model="filters.search"
                        type="text"
                        placeholder="Search name, code, or description"
                        class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                    <select v-model="filters.parent_id" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                        <option value="">Any parent category</option>
                        <option v-for="parent in parents" :key="parent.id" :value="parent.id">
                            {{ parent.name }}
                        </option>
                    </select>
                    <select v-model="filters.active" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
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
                                <th class="pb-3">Category</th>
                                <th class="pb-3">Parent</th>
                                <th class="pb-3">Assets</th>
                                <th class="pb-3">Status</th>
                                <th class="pb-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="category in categories.data" :key="category.id">
                                <td class="py-4">
                                    <p class="font-semibold text-slate-900">{{ category.name }}</p>
                                    <p class="text-xs text-slate-500">{{ category.code }}</p>
                                    <p v-if="category.description" class="mt-1 text-xs text-slate-500">
                                        {{ category.description }}
                                    </p>
                                </td>
                                <td class="py-4 text-slate-700">{{ category.parent_name ?? 'Top level' }}</td>
                                <td class="py-4 text-slate-700">{{ category.assets_count }}</td>
                                <td class="py-4">
                                    <StatusBadge :value="category.is_active ? 'active' : 'inactive'" />
                                </td>
                                <td class="py-4 text-right">
                                    <Link
                                        :href="route('assets.categories.edit', category.id)"
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
                    <PaginationLinks :links="categories.links" />
                </div>
            </section>
        </div>
    </AuthenticatedLayout>
</template>
