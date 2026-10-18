import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-sm p-3.5 shadow-none hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 tracking-tight">
          {title}
        </span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <div className="mt-1.5">
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center text-xs text-slate-500 gap-1.5">
            {trend && (
              <span
                className={`font-semibold ${
                  trendUp ? 'text-emerald-600' : 'text-slate-600'
                }`}
              >
                {trend}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
