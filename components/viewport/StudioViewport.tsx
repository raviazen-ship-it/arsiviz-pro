'use client';

import React, { Component, Suspense, useEffect, useMemo, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { getCopy } from '@/lib/i18n';
import { useUIStore } from '@/store/useUIStore';
import { FallbackSchematic2D } from './FallbackSchematic2D';
import { ViewportHUD } from './ViewportHUD';

const DynamicViewportCanvas = dynamic(() => import('./ViewportCanvas'), {
  ssr: false,
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: (errorMsg: string) => React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ViewportErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'WebGL rendering error',
    };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.message);
    }
    return this.props.children;
  }
}

function detectWebGL(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch {
    return false;
  }
}

const subscribeNoop = () => () => {};

export function StudioViewport() {
  const language = useUIStore((s) => s.language);
  const setWebglAvailable = useUIStore((s) => s.setWebglAvailable);
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const supported = useMemo(() => (isClient ? detectWebGL() : true), [isClient]);
  const copy = getCopy(language);

  useEffect(() => {
    if (isClient) {
      setWebglAvailable(supported);
    }
  }, [isClient, supported, setWebglAvailable]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-studio-bg">
      {!isClient ? (
        <div className="flex h-full w-full items-center justify-center">
          <div className="rounded-lg border border-studio-border bg-studio-elevated px-4 py-2.5 text-xs font-medium text-studio-subtext shadow-panel">
            {copy.viewport.loadingScene}
          </div>
        </div>
      ) : !supported ? (
        <FallbackSchematic2D />
      ) : (
        <ViewportErrorBoundary fallback={() => <FallbackSchematic2D />}>
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <div className="rounded-lg border border-studio-border bg-studio-elevated px-4 py-2.5 text-xs font-medium text-studio-subtext shadow-panel">
                  {copy.viewport.loadingScene}
                </div>
              </div>
            }
          >
            <DynamicViewportCanvas />
          </Suspense>
          <ViewportHUD />
        </ViewportErrorBoundary>
      )}
    </div>
  );
}
