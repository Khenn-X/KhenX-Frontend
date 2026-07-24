import { cn } from '../../lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean; // narrower max-width for forms/detail pages
}

/**
 * Standard max-width container with horizontal padding.
 * Wrap every page's content in this.
 */
const PageWrapper = ({ children, className, narrow = false }: PageWrapperProps) => {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        narrow ? 'max-w-3xl' : 'max-w-7xl',
        className
      )}
    >
      {children}
    </div>
  );
};

export default PageWrapper;