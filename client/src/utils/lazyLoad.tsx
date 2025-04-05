import React, { lazy, Suspense } from 'react';

/**
 * Loading fallback component
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

/**
 * Creates a lazy-loaded component with a loading fallback
 * @param factory Function that imports the component
 * @param fallback Optional custom loading fallback
 * @returns Lazy-loaded component with suspense
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <LoadingFallback />
) {
  const LazyComponent = lazy(factory);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Creates a lazy-loaded component with a loading fallback
 * Simplified version for direct use in JSX
 */
export function lazyComponent<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <LoadingFallback />
) {
  const Component = lazy(factory);
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
}
