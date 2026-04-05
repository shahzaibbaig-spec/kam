<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import StatusBadge from '@/Components/App/StatusBadge.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';

interface RoleRecord {
    id: number;
    name: string;
    permissions: string[];
    permissions_count: number;
    users_count: number;
}

defineProps<{
    roles: { data: RoleRecord[] };
    permissionGroups: Record<string, Record<string, string>>;
}>();
</script>

<template>
    <Head title="Roles" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                title="Roles and Permissions"
                description="Review the seeded hospital role matrix and adjust permission coverage for operational teams."
                action-label="Create Role"
                :action-href="route('admin.roles.create')"
            />
        </template>

        <div class="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
                <div class="space-y-4">
                    <div
                        v-for="role in roles.data"
                        :key="role.id"
                        class="rounded-3xl border border-slate-200 p-5"
                    >
                        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h2 class="text-lg font-semibold text-slate-950">{{ role.name }}</h2>
                                <p class="mt-1 text-sm text-slate-600">
                                    {{ role.users_count }} assigned users · {{ role.permissions_count }} permissions
                                </p>
                            </div>

                            <Link
                                :href="route('admin.roles.edit', role.id)"
                                class="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
                            >
                                Edit Role
                            </Link>
                        </div>

                        <div class="mt-4 flex flex-wrap gap-2">
                            <StatusBadge v-for="permission in role.permissions.slice(0, 10)" :key="permission" :value="permission" />
                            <span
                                v-if="role.permissions.length > 10"
                                class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                            >
                                +{{ role.permissions.length - 10 }} more
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60">
                <h2 class="text-lg font-semibold text-slate-950">Permission Groups</h2>
                <div class="mt-5 space-y-5">
                    <div v-for="(permissions, group) in permissionGroups" :key="group">
                        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                            {{ group }}
                        </p>
                        <div class="mt-3 flex flex-wrap gap-2">
                            <StatusBadge v-for="description in Object.keys(permissions)" :key="description" :value="description" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </AuthenticatedLayout>
</template>
