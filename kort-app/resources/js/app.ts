import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/vue3';
import { createApp, DefineComponent, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';

const normalizeVisitData = (value: unknown): any => {
    return value ?? {};
};

const originalVisit = router.visit.bind(router);
const originalGet = router.get.bind(router);
const originalPost = router.post.bind(router);
const originalPut = router.put.bind(router);
const originalPatch = router.patch.bind(router);

router.visit = ((href: any, options: any = {}) => {
    return originalVisit(href, {
        ...options,
        data: normalizeVisitData(options.data),
    });
}) as typeof router.visit;

router.get = ((url: any, data: any = {}, options: any = {}) => {
    return originalGet(url, normalizeVisitData(data), options);
}) as typeof router.get;

router.post = ((url: any, data: any = {}, options: any = {}) => {
    return originalPost(url, normalizeVisitData(data), options);
}) as typeof router.post;

router.put = ((url: any, data: any = {}, options: any = {}) => {
    return originalPut(url, normalizeVisitData(data), options);
}) as typeof router.put;

router.patch = ((url: any, data: any = {}, options: any = {}) => {
    return originalPatch(url, normalizeVisitData(data), options);
}) as typeof router.patch;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = import.meta.glob<DefineComponent>('./Pages/**/*.vue', { eager: true });

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const page = pages[`./Pages/${name}.vue`];

        if (!page) {
            throw new Error(`Inertia page not found: ${name}`);
        }

        return page;
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
            .mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
