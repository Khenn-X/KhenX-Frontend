import { useEffect, useState } from 'react';
import logo from '../../assets/kgreen.png';
import { cn } from '../../lib/utils';

interface PageLoaderProps {
  visible?: boolean;
  label?: string;
}

const PageLoader = ({ visible = true, label = 'Loading...' }: PageLoaderProps) => {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShowCard(false);
      return;
    }

    const showTimer = window.setTimeout(() => setShowCard(true), 400);
    const failSafeTimer = window.setTimeout(() => setShowCard(false), 8000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(failSafeTimer);
      setShowCard(false);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'pointer-events-none absolute inset-0 z-[70] flex items-center justify-center p-4 transition-opacity duration-200',
        showCard ? 'opacity-100' : 'opacity-0',
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.55)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        minHeight: '180px',
      }}
    >
      <div
        className={cn(
          'flex w-full max-w-[240px] items-center justify-center rounded-2xl border border-slate-200/70 bg-white/90 px-5 py-6 shadow-xl shadow-slate-200/70 transition-all duration-200',
          showCard ? 'scale-100 opacity-100' : 'scale-[0.98] opacity-0',
        )}
      >
        <div className="flex items-center gap-4">
          <div
            className="relative flex items-center justify-center"
            style={{ width: 'var(--loader-size, 48px)', height: 'var(--loader-size, 48px)' }}
          >
            <div
              className="absolute inset-0 rounded-full border-[var(--loader-stroke,3px)] border-[#00C9A7]/20"
              style={{ borderTopColor: 'var(--loader-color, #00C9A7)' }}
            />
            <div
              className="absolute inset-[18%] rounded-full border-[var(--loader-stroke,3px)] border-[#00C9A7]/20"
              style={{ borderTopColor: 'var(--loader-color, #00C9A7)' }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: 'var(--loader-stroke, 3px) solid transparent',
                borderTopColor: 'var(--loader-color, #00C9A7)',
                borderRightColor: 'var(--loader-color, #00C9A7)',
                animation: 'kx-loader-spin 0.9s linear infinite',
              }}
            />
            <img src={logo} alt="KhenX" className="relative h-5 w-5 object-contain" />
          </div>
          <div className="text-sm font-medium text-slate-600">{label}</div>
        </div>
      </div>
      <style>{`
        @keyframes kx-loader-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
