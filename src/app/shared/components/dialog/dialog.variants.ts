import { cva, type VariantProps } from 'class-variance-authority';

export const dialogVariants = cva(
  'fixed left-[50%] top-[50%] z-50 flex w-full max-w-[calc(100%-2rem)] max-h-[85vh] translate-x-[-50%] translate-y-[-50%] flex-col gap-4 overflow-y-auto overscroll-contain border bg-background p-6 shadow-lg rounded-lg sm:max-w-[425px]',
);
export type ZardDialogVariants = VariantProps<typeof dialogVariants>;
