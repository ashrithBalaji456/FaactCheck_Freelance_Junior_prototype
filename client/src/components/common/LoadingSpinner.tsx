import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ label, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-slate-400">
      <Loader2 className={`${sizeClasses} animate-spin motion-reduce:animate-none text-emerald-400`} />
      {label && <p className="text-sm font-medium">{label}</p>}
    </div>
  );
}

