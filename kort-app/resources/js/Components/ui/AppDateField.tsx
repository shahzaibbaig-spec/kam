import { forwardRef } from 'react';

import { AppInput, type AppInputProps } from '@/Components/ui/AppInput';

export const AppDateField = forwardRef<HTMLInputElement, AppInputProps>((props, ref) => (
    <AppInput ref={ref} type="date" {...props} />
));

AppDateField.displayName = 'AppDateField';
