<script setup lang="ts">
import PageHeader from '@/Components/App/PageHeader.vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';

interface CategoryRecord {
    id: number;
    name: string;
    code: string;
    description: string | null;
    parent_id: number | null;
    is_active: boolean;
}

interface ParentOption {
    id: number;
    name: string;
}

const props = defineProps<{
    category: CategoryRecord | null;
    parents: ParentOption[];
}>();

const form = useForm({
    name: props.category?.name ?? '',
    code: props.category?.code ?? '',
    description: props.category?.description ?? '',
    parent_id: props.category?.parent_id ?? '',
    is_active: props.category?.is_active ?? true,
});

const submit = () => {
    if (props.category) {
        form.put(route('assets.categories.update', props.category.id));
        return;
    }

    form.post(route('assets.categories.store'));
};
</script>

<template>
    <Head :title="category ? 'Edit Asset Category' : 'Create Asset Category'" />

    <AuthenticatedLayout>
        <template #header>
            <PageHeader
                :title="category ? 'Edit Asset Category' : 'Create Asset Category'"
                description="Keep asset classification consistent so tags, filters, and reporting stay dependable."
            />
        </template>

        <form class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-sm shadow-slate-200/60" @submit.prevent="submit">
            <div class="grid gap-5 md:grid-cols-2">
                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Category Name</span>
                    <input v-model="form.name" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                    <p v-if="form.errors.name" class="text-xs text-rose-600">{{ form.errors.name }}</p>
                </label>

                <label class="space-y-2 text-sm text-slate-700">
                    <span class="font-medium">Code</span>
                    <input v-model="form.code" type="text" class="w-full rounded-2xl border border-slate-200 px-4 py-3 uppercase" />
                    <p v-if="form.errors.code" class="text-xs text-rose-600">{{ form.errors.code }}</p>
                </label>

                <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
                    <span class="font-medium">Parent Category</span>
                    <select v-model="form.parent_id" class="w-full rounded-2xl border border-slate-200 px-4 py-3">
                        <option value="">None</option>
                        <option v-for="parent in parents" :key="parent.id" :value="parent.id">
                            {{ parent.name }}
                        </option>
                    </select>
                </label>

                <label class="space-y-2 text-sm text-slate-700 md:col-span-2">
                    <span class="font-medium">Description</span>
                    <textarea v-model="form.description" rows="4" class="w-full rounded-2xl border border-slate-200 px-4 py-3" />
                    <p v-if="form.errors.description" class="text-xs text-rose-600">{{ form.errors.description }}</p>
                </label>
            </div>

            <div class="mt-6">
                <label class="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                    <input v-model="form.is_active" type="checkbox" class="rounded border-slate-300 text-slate-900" />
                    Active category
                </label>
            </div>

            <div class="mt-8 flex justify-end">
                <button type="submit" class="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white" :disabled="form.processing">
                    {{ category ? 'Update Category' : 'Create Category' }}
                </button>
            </div>
        </form>
    </AuthenticatedLayout>
</template>
