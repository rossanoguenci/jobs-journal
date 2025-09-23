export const variantClassMap = {
  default: "mt-3",
  inline: "mt-3 inline-flex gap-5",
} as const;

export type Variant = keyof typeof variantClassMap;
