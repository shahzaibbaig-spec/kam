<script setup lang="ts">
import { ReactPageErrorBoundary } from '@/Bridge/ReactPageErrorBoundary';
import { ReactPageProvider } from '@/Bridge/ReactPageContext';
import { createElement, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { PropType } from 'vue';
import { onBeforeUnmount, onMounted, ref, toRaw, watch } from 'vue';

const props = defineProps({
    component: {
        type: Function as unknown as PropType<ComponentType<any>>,
        required: true,
    },
    pageProps: {
        type: Object as PropType<any>,
        default: () => ({}),
    },
    componentProps: {
        type: Object as PropType<any>,
        default: () => ({}),
    },
});

const container = ref<HTMLElement | null>(null);
let root: Root | null = null;

const normalizeProps = <T extends Record<string, unknown>>(value: T): T => {
    const rawValue = toRaw(value);

    if (rawValue === null || rawValue === undefined) {
        return {} as T;
    }

    try {
        return JSON.parse(JSON.stringify(rawValue)) as T;
    } catch {
        return rawValue as T;
    }
};

const renderReact = () => {
    if (!container.value) {
        return;
    }

    root ??= createRoot(container.value);
    root.render(
        createElement(
            ReactPageErrorBoundary,
            null,
            createElement(
                ReactPageProvider,
                { pageProps: normalizeProps(props.pageProps) },
                createElement(props.component, normalizeProps(props.componentProps)),
            ),
        ),
    );
};

onMounted(renderReact);

watch(() => [props.component, props.pageProps, props.componentProps], renderReact, { deep: true });

onBeforeUnmount(() => {
    root?.unmount();
    root = null;
});
</script>

<template>
    <div ref="container" />
</template>
