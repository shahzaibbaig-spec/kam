<script setup lang="ts">
import type { PageProps } from '@/types';
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import Dropdown from '@/Components/Dropdown.vue';
import DropdownLink from '@/Components/DropdownLink.vue';
import { Link, usePage } from '@inertiajs/vue3';
import { computed, onMounted, ref, watch } from 'vue';

const showingNavigationDropdown = ref(false);
const sidebarCollapsed = ref(false);
const page = usePage<PageProps>();

const user = computed(() => page.props.auth.user);
const navigation = computed(() => page.props.navigation ?? []);
const flash = computed(() => page.props.flash ?? {});
const canScanAssets = computed(() => user.value?.permissions.includes('asset.scan') ?? false);
const canScanInventory = computed(() => user.value?.permissions.includes('inventory-item.scan') ?? false);
const breadcrumbs = computed(() =>
    (page.component ?? '')
        .split('/')
        .filter(Boolean)
        .map((segment) =>
            segment
                .replaceAll('-', ' ')
                .replaceAll('_', ' ')
                .replace(/\b\w/g, (character) => character.toUpperCase()),
        )
        .map((segment) => (segment === 'Index' ? 'Overview' : segment)),
);

onMounted(() => {
    const storedValue = window.localStorage.getItem('kort:sidebar-collapsed');

    if (storedValue !== null) {
        sidebarCollapsed.value = storedValue === '1';
    }
});

watch(sidebarCollapsed, (value) => {
    window.localStorage.setItem('kort:sidebar-collapsed', value ? '1' : '0');
});
</script>

<template>
    <div class="min-h-screen bg-app-glow">
        <div class="mx-auto flex min-h-screen max-w-[1680px]">
            <aside
                class="hidden shrink-0 border-r border-sidebar-border bg-sidebar text-white transition-all duration-200 lg:flex lg:flex-col"
                :class="sidebarCollapsed ? 'w-24' : 'w-80'"
            >
                <div class="border-b border-sidebar-border px-4 py-6">
                    <div class="flex items-center justify-between gap-3">
                        <Link :href="route('dashboard')" class="min-w-0">
                            <div
                                v-if="sidebarCollapsed"
                                class="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/15 text-sm font-bold text-white ring-1 ring-blue-300/20"
                            >
                                KA
                            </div>
                            <ApplicationLogo v-else />
                        </Link>
                        <button
                            type="button"
                            class="rounded-2xl p-2 text-blue-100 transition hover:bg-white/10 hover:text-white"
                            @click="sidebarCollapsed = !sidebarCollapsed"
                        >
                            <svg v-if="sidebarCollapsed" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fill-rule="evenodd"
                                    d="M7.22 4.22a.75.75 0 0 1 1.06 0l5.25 5.25a.75.75 0 0 1 0 1.06l-5.25 5.25a.75.75 0 1 1-1.06-1.06L11.94 10 7.22 5.28a.75.75 0 0 1 0-1.06Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                            <svg v-else class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fill-rule="evenodd"
                                    d="M12.78 4.22a.75.75 0 0 1 0 1.06L8.06 10l4.72 4.72a.75.75 0 1 1-1.06 1.06l-5.25-5.25a.75.75 0 0 1 0-1.06l5.25-5.25a.75.75 0 0 1 1.06 0Z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="mt-8 flex-1 space-y-8 overflow-y-auto">
                    <div v-for="section in navigation" :key="section.label" class="space-y-3">
                        <p
                            v-if="!sidebarCollapsed"
                            class="px-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-100/70"
                        >
                            {{ section.label }}
                        </p>

                        <div class="space-y-1 px-3">
                            <Link
                                v-for="item in section.items"
                                :key="item.route"
                                :href="route(item.route)"
                                class="flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition"
                                :class="
                                    route().current(item.route)
                                        ? 'bg-white/12 text-white'
                                        : 'text-blue-100/85 hover:bg-white/10 hover:text-white'
                                "
                            >
                                <span v-if="sidebarCollapsed" class="mx-auto text-xs font-semibold text-blue-100">
                                    {{ item.label.slice(0, 1) }}
                                </span>
                                <span v-else>{{ item.label }}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div class="px-4 py-5">
                    <div class="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                        <div class="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                            {{ (user?.name ?? 'KA').slice(0, 2).toUpperCase() }}
                        </div>
                        <template v-if="!sidebarCollapsed">
                            <p class="mt-3 text-lg font-semibold text-white">{{ user?.name }}</p>
                            <p class="text-sm text-blue-100/80">{{ user?.designation }}</p>
                            <div class="mt-4 flex flex-wrap gap-2">
                                <span
                                    v-for="role in user?.roles"
                                    :key="role"
                                    class="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-100 ring-1 ring-blue-300/20"
                                >
                                    {{ role }}
                                </span>
                            </div>
                        </template>
                    </div>
                </div>
            </aside>

            <div class="flex min-h-screen flex-1 flex-col">
                <nav class="sticky top-0 z-40 border-b border-white/80 bg-white/90 px-5 py-4 shadow-sm backdrop-blur lg:hidden">
                    <div class="flex items-center justify-between">
                        <Link :href="route('dashboard')">
                            <div class="text-sm font-semibold text-slate-900">
                                {{ $page.props.app.name }}
                            </div>
                        </Link>

                        <button
                            class="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-panel"
                            @click="showingNavigationDropdown = !showingNavigationDropdown"
                        >
                            Menu
                        </button>
                    </div>

                    <div v-if="showingNavigationDropdown" class="mt-4 space-y-4 rounded-[1.75rem] bg-sidebar p-4 shadow-panel">
                        <div v-for="section in navigation" :key="section.label" class="space-y-2">
                            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/70">
                                {{ section.label }}
                            </p>
                            <Link
                                v-for="item in section.items"
                                :key="item.route"
                                :href="route(item.route)"
                                class="block rounded-2xl px-4 py-3 text-sm font-medium text-blue-100 transition"
                                :class="route().current(item.route) ? 'bg-white/10 text-white' : 'hover:bg-white/10 hover:text-white'"
                            >
                                {{ item.label }}
                            </Link>
                        </div>
                    </div>
                </nav>

                <header class="sticky top-0 z-30 m-4 rounded-[1.75rem] border border-white/90 bg-white/95 px-5 py-4 shadow-surface backdrop-blur lg:m-6 lg:px-6">
                    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div class="flex flex-col gap-4 xl:flex-row xl:items-center">
                            <button
                                type="button"
                                class="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:inline-flex"
                                @click="sidebarCollapsed = !sidebarCollapsed"
                            >
                                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M3.75 5.5A.75.75 0 0 1 4.5 4.75h11a.75.75 0 0 1 0 1.5h-11a.75.75 0 0 1-.75-.75Zm0 4.5A.75.75 0 0 1 4.5 9.25h11a.75.75 0 0 1 0 1.5h-11a.75.75 0 0 1-.75-.75Zm0 4.5a.75.75 0 0 1 .75-.75h11a.75.75 0 0 1 0 1.5h-11a.75.75 0 0 1-.75-.75Z" />
                                </svg>
                            </button>

                            <div class="hidden lg:block">
                                <input
                                    type="text"
                                    placeholder="Search assets, stock, suppliers, or records"
                                    class="w-80 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    readonly
                                />
                            </div>

                            <div class="flex items-center gap-3">
                                <img
                                    src="/images/kort-logo.jpeg"
                                    alt="KORT logo"
                                    class="h-11 w-11 rounded-xl border border-slate-200 bg-white object-contain p-1 shadow-sm"
                                />
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
                                        KORT Burn Center Assest Managment System
                                    </p>
                                    <p class="mt-2 text-sm text-slate-600">
                                        Built for burn center asset, inventory, and compliance operations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-3">
                            <div class="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 lg:flex">
                                <span class="inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                                Notification Center
                                <span class="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Soon</span>
                            </div>

                            <Link
                                v-if="canScanAssets"
                                :href="route('assets.scan.index')"
                                class="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-panel transition hover:bg-blue-500"
                            >
                                Scan Asset
                            </Link>
                            <Link
                                v-if="canScanInventory"
                                :href="route('inventory.scan.index')"
                                class="rounded-2xl bg-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-200"
                            >
                                Scan Item
                            </Link>

                            <Dropdown align="right" width="48">
                                <template #trigger>
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:bg-slate-50"
                                    >
                                        <div class="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-sm font-semibold text-blue-700">
                                            {{ (user?.name ?? 'KA').slice(0, 2).toUpperCase() }}
                                        </div>
                                        <div class="hidden sm:block">
                                            <p class="text-sm font-semibold text-slate-900">{{ user?.name }}</p>
                                            <p class="text-xs text-slate-500">{{ user?.designation }}</p>
                                        </div>
                                    </button>
                                </template>

                                <template #content>
                                    <DropdownLink :href="route('profile.edit')">Profile</DropdownLink>
                                    <DropdownLink href="#" class="cursor-not-allowed opacity-50">Settings</DropdownLink>
                                    <DropdownLink :href="route('logout')" method="post" as="button" class="text-rose-600">
                                        Log Out
                                    </DropdownLink>
                                </template>
                            </Dropdown>
                        </div>
                    </div>
                </header>

                <div class="space-y-4 px-4 pb-6 lg:px-6">
                    <div class="rounded-[1.5rem] border border-slate-200/80 bg-white/90 px-5 py-4 shadow-sm">
                        <div class="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                            <Link :href="route('dashboard')" class="font-medium text-slate-700 transition hover:text-blue-700">
                                Dashboard
                            </Link>
                            <template v-for="crumb in breadcrumbs" :key="crumb">
                                <span class="text-slate-300">/</span>
                                <span
                                    class="capitalize"
                                    :class="crumb === breadcrumbs[breadcrumbs.length - 1] ? 'font-medium text-slate-700' : ''"
                                >
                                    {{ crumb }}
                                </span>
                            </template>
                        </div>
                    </div>

                    <div
                        v-if="flash.success"
                        class="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 shadow-sm"
                    >
                        {{ flash.success }}
                    </div>
                    <div
                        v-if="flash.error"
                        class="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 shadow-sm"
                    >
                        {{ flash.error }}
                    </div>

                    <header v-if="$slots.header">
                        <slot name="header" />
                    </header>

                    <main>
                        <slot />
                    </main>
                </div>
            </div>
        </div>
    </div>
</template>
