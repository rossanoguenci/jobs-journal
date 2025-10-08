import React from "react";
import OrphansResolverContent from "@/components/orphans/OrphansResolverContent";

export type ResolverRendererProps = {
  onResolvedAction: () => Promise<void> | void;
};

export type ResolverEntry = {
  render: (props: ResolverRendererProps) => React.ReactNode;
  modalOptions?: {
    isCloseButtonVisible?: boolean;
    onClose?: () => void;
  };
};

export const RESOLVERS: Record<string, ResolverEntry> = {
  ensure_orphans_preview: {
    render: ({ onResolvedAction }) => (
      <OrphansResolverContent onResolvedAction={onResolvedAction} />
    ),
    modalOptions: { isCloseButtonVisible: false },
  },
  // Future steps can be added here as simple entries
};
