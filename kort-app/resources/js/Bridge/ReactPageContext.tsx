import { createContext, useContext, type PropsWithChildren } from 'react';

import type { ReactSharedPageProps } from '@/types/app-shell';

export interface ReactPageContextValue<PageProps extends Record<string, unknown> = ReactSharedPageProps> {
    props: PageProps;
}

const ReactPageContext = createContext<ReactPageContextValue<Record<string, unknown>> | null>(null);

export interface ReactPageProviderProps<PageProps extends Record<string, unknown>> extends PropsWithChildren {
    pageProps: PageProps;
}

export function ReactPageProvider<PageProps extends Record<string, unknown>>({
    pageProps,
    children,
}: ReactPageProviderProps<PageProps>) {
    return <ReactPageContext.Provider value={{ props: pageProps }}>{children}</ReactPageContext.Provider>;
}

export function useReactPage<PageProps extends Record<string, unknown> = ReactSharedPageProps>() {
    const context = useContext(ReactPageContext);

    if (!context) {
        throw new Error('useReactPage must be used within ReactPageProvider.');
    }

    return context as ReactPageContextValue<PageProps>;
}
