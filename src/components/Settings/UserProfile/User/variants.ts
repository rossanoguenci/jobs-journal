export const variantClassMap = {
    container: {
        default: "flex items-center gap-5",
        full: "flex-col justify-center text-center",
        compact: "",
    },
    avatar: {
        default: "",
        full: "max-h-20 max-w-20 size-16",
        compact: "max-h-14 max-w-14",
    },
    user_info: {
        default: "",
        full: "",
        compact: "",
    },
    user_info_name: {
        default: "",
        full: "text-lg font-bold",
        compact: "text-base",
    },
    user_info_role: {
        default: "text-gray-400",
        full: "text-medium",
        compact: "text-sm",
    },
} as const;

// Element keys (container, avatar, etc.)
export type VariantKey = keyof typeof variantClassMap;

// Style variants (default, full, compact)
export type StyleVariant = keyof (typeof variantClassMap)[keyof typeof variantClassMap];

// Utility to compose classes for an element + variant + extra classes
// vcn -> variant class name :)
export function vcn<K extends VariantKey>(
  key: K,
  variant: StyleVariant = "default",
  extra?: string,
) {
  const base = variantClassMap[key].default || ""; // always applied
  const v = variant !== "default" ? variantClassMap[key][variant] : ""; // only if not default
  return [base, v, extra].filter(Boolean).join(" ");
}
