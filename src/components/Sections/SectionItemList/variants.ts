export const variantClassMap = {
  default: "flex gap-2 items-center",
  actions: "inline-flex w-full max-w-full items-center justify-between rounded-lg",
} as const;

export type Variant = keyof typeof variantClassMap;
