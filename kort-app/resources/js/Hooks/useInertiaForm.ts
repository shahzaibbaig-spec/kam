import { router } from '@inertiajs/vue3';
import { useMemo, useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';

type FormValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | Blob
    | File
    | FormValue[]
    | { [key: string]: FormValue };

type FormValues = Record<string, FormValue>;

export interface InertiaFormSubmitOptions {
    preserveScroll?: boolean;
    preserveState?: boolean;
    replace?: boolean;
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    onFinish?: () => void;
}

export function useInertiaForm<TValues extends FormValues>(initialValues: TValues) {
    const { props } = useReactPage<{ errors?: Record<string, string> } & Record<string, unknown>>();
    const [data, setDataState] = useState<TValues>(initialValues);
    const [processing, setProcessing] = useState(false);

    const errors = useMemo(() => (props.errors ?? {}) as Record<string, string>, [props.errors]);

    const setData = <TField extends keyof TValues>(field: TField, value: TValues[TField]) => {
        setDataState((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const setValues = (values: Partial<TValues>) => {
        setDataState((current) => ({
            ...current,
            ...values,
        }));
    };

    const reset = (...fields: Array<keyof TValues>) => {
        if (fields.length === 0) {
            setDataState(initialValues);

            return;
        }

        setDataState((current) => {
            const next = { ...current };

            fields.forEach((field) => {
                next[field] = initialValues[field];
            });

            return next;
        });
    };

    const submit = (method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, options: InertiaFormSubmitOptions = {}) => {
        setProcessing(true);

        const visitOptions = {
            method,
            data: data ?? {},
            preserveScroll: options.preserveScroll ?? true,
            preserveState: options.preserveState ?? true,
            replace: options.replace ?? false,
        };

        router.visit(url, {
            ...visitOptions,
            onSuccess: () => options.onSuccess?.(),
            onError: (visitErrors) => options.onError?.(visitErrors as Record<string, string>),
            onFinish: () => {
                setProcessing(false);
                options.onFinish?.();
            },
        });
    };

    return {
        data,
        errors,
        processing,
        reset,
        setData,
        setValues,
        submit,
        get: (url: string, options?: InertiaFormSubmitOptions) => submit('get', url, options),
        post: (url: string, options?: InertiaFormSubmitOptions) => submit('post', url, options),
        put: (url: string, options?: InertiaFormSubmitOptions) => submit('put', url, options),
        patch: (url: string, options?: InertiaFormSubmitOptions) => submit('patch', url, options),
        destroy: (url: string, options?: InertiaFormSubmitOptions) => submit('delete', url, options),
    };
}
