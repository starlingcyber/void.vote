import React from "react";
import { ClientOnly } from "remix-utils/client-only";

interface ImportMap {
  [key: string]: () => Promise<any>;
}

interface PraxOnlyProps {
  fallback: React.ReactNode;
  imports: ImportMap;
  children: (imports: Record<string, any>) => React.ReactNode;
}

export default function PraxOnly({
  fallback,
  imports,
  children,
}: PraxOnlyProps) {
  return (
    <ClientOnly fallback={fallback}>
      {() => (
        <PraxWrapper fallback={fallback} imports={imports}>
          {children}
        </PraxWrapper>
      )}
    </ClientOnly>
  );
}

function PraxWrapper({
  fallback,
  imports,
  children,
}: {
  fallback: React.ReactNode;
  imports: ImportMap;
  children: (imports: Record<string, any>) => React.ReactNode;
}) {
  const [isConnected, setIsConnected] = React.useState<boolean | null>(null);
  const [importedModules, setImportedModules] = React.useState<Record<
    string,
    any
  > | null>(null);

  React.useEffect(() => {
    let unsubscribe: () => void;

    import("~/state.client").then((module) => {
      const { useStore } = module;

      // Check initial connection status
      const initialState = useStore.getState();
      setIsConnected(initialState.prax.connected);

      // Subscribe to changes
      unsubscribe = useStore.subscribe((state: any) => {
        setIsConnected(state.prax.connected);
      });
    });

    // Load all specified imports
    Promise.all(
      Object.entries(imports).map(async ([key, importFn]) => {
        const module = await importFn();
        return [key, module];
      }),
    ).then((modules) => {
      setImportedModules(Object.fromEntries(modules));
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [imports]);

  if (isConnected === null || importedModules === null) {
    return fallback;
  }

  return isConnected ? children(importedModules) : fallback;
}
