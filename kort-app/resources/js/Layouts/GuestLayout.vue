<script setup lang="ts">
import ApplicationLogo from '@/Components/ApplicationLogo.vue';
import { Link } from '@inertiajs/vue3';
</script>

<template>
    <div class="min-h-screen bg-app-glow px-4 py-8 sm:px-6 lg:px-8">
        <div class="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div class="relative overflow-hidden rounded-[2rem] bg-sidebar px-8 py-8 text-white shadow-panel">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.35),_transparent_36%)]" />
                <div class="relative flex h-full flex-col">
                    <Link href="/" class="inline-flex">
                        <ApplicationLogo />
                    </Link>

                    <div class="mt-10 space-y-5">
                        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-blue-200">
                            Secure Access
                        </p>
                        <h1 class="max-w-2xl text-4xl font-semibold leading-tight text-white">
                            Track hospital assets, inventory, and accountability from one secure workspace.
                        </h1>
                        <p class="max-w-2xl text-sm leading-7 text-blue-100/90">
                            Professional, calm, and purpose-built for clinical operations teams that need clarity and dependable audit visibility.
                        </p>
                    </div>

                    <div class="mt-10 grid gap-4 sm:grid-cols-3">
                        <div class="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                            <p class="text-sm font-semibold text-white">Permission Aware</p>
                            <p class="mt-2 text-sm text-blue-100/80">Laravel remains the source of truth for secure visibility.</p>
                        </div>
                        <div class="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                            <p class="text-sm font-semibold text-white">Operationally Clear</p>
                            <p class="mt-2 text-sm text-blue-100/80">Designed for staff who need to move quickly and accurately.</p>
                        </div>
                        <div class="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                            <p class="text-sm font-semibold text-white">Audit Ready</p>
                            <p class="mt-2 text-sm text-blue-100/80">Structured for traceability across asset and inventory workflows.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col justify-center gap-6">
                <div class="w-full rounded-[2rem] border border-white/90 bg-white/95 px-6 py-6 shadow-surface sm:px-10 sm:py-8">
                    <slot />
                </div>

                <div class="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-surface">
                    <p class="text-xs font-semibold uppercase tracking-[0.3em] text-blue-700">
                        Demo Access
                    </p>
                    <div class="mt-5 space-y-3 text-sm text-slate-700">
                        <p><span class="font-semibold">Super Admin:</span> super.admin@kort.local</p>
                        <p><span class="font-semibold">Store Manager:</span> store.manager@kort.local</p>
                        <p><span class="font-semibold">Biomedical Engineer:</span> biomedical@kort.local</p>
                        <p><span class="font-semibold">Auditor:</span> auditor@kort.local</p>
                    </div>
                    <div class="mt-6 rounded-3xl bg-blue-50/70 p-5">
                        <p class="text-sm font-semibold text-slate-900">Shared Password</p>
                        <p class="mt-2 text-sm text-slate-600">BurnCenter@123</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
