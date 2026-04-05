<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';

interface RoleRecord {
    id: number;
    name: string;
    permissions: string[];
}

const props = defineProps<{
    role: RoleRecord | null;
    permissionGroups: Record<string, Record<string, string>>;
}>();

const form = useForm({
    name: props.role?.name ?? '',
    permissions: props.role?.permissions ?? [],
});

const submit = () => {
    if (props.role) {
        form.put(route('admin.roles.update', props.role.id));
        return;
    }

    form.post(route('admin.roles.store'));
};
</script>

<template>
    <Head :title="role ? 'Edit Role' : 'Create Role'" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                :title="role ? 'Edit Role' : 'Create Role'"
                description="Adjust the permission matrix for hospital staff groups and internal controls."
            />
        </template>

        <form class="space-y-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60" @submit.prevent="submit">
            <label class="block space-y-2 text-sm text-slate-700">
                <span class="font-medium">Role Name</span>
                <input v-model="form.name" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                <p v-if="form.errors.name" class="text-xs text-rose-600">{{ form.errors.name }}</p>
            </label>

            <div class="space-y-6">
                <div v-for="(permissions, group) in permissionGroups" :key="group" class="rounded-3xl border border-slate-200 p-5">
                    <h2 class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                        {{ group }}
                    </h2>
                    <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <label
                            v-for="(description, permission) in permissions"
                            :key="permission"
                            class="rounded-2xl border border-slate-200 px-4 py-4"
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div>
                                    <p class="font-medium text-slate-900">{{ permission }}</p>
                                    <p class="mt-1 text-sm text-slate-600">{{ description }}</p>
                                </div>
                                <input v-model="form.permissions" :value="permission" type="checkbox" class="rounded border-slate-300" />
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-end">
                <button type="submit" class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" :disabled="form.processing">
                    {{ role ? 'Update Role' : 'Create Role' }}
                </button>
            </div>
        </form>
    </AuthenticatedLayout>
</template>
