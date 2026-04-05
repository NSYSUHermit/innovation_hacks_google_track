import { X } from "lucide-react";
import { useEffect } from "react";
import {
  type DateRangeFilter,
  type IndustryFilter,
  DEFAULT_DATE_RANGE,
  DEFAULT_INDUSTRY,
} from "../data/dashboardFilters";

const INDUSTRIES: { value: IndustryFilter; label: string }[] = [
  { value: "All", label: "All industries" },
  { value: "Tech", label: "Tech" },
  { value: "Finance", label: "Finance" },
  { value: "Marketing", label: "Marketing" },
  { value: "Design", label: "Design" },
  { value: "Operations", label: "Operations" },
];

const DATE_RANGES: { value: DateRangeFilter; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
];

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
  draftIndustry: IndustryFilter;
  draftDateRange: DateRangeFilter;
  onDraftIndustryChange: (v: IndustryFilter) => void;
  onDraftDateRangeChange: (v: DateRangeFilter) => void;
  onApply: () => void;
  onReset: () => void;
}

export function FiltersModal({
  open,
  onClose,
  draftIndustry,
  draftDateRange,
  onDraftIndustryChange,
  onDraftDateRangeChange,
  onApply,
  onReset,
}: FiltersModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="filters-title">
      <button
        type="button"
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm dark:bg-black/60"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-[12px] border border-border bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="filters-title" className="text-sm font-semibold text-navy dark:text-white">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">Industry</label>
        <select
          value={draftIndustry}
          onChange={(e) => onDraftIndustryChange(e.target.value as IndustryFilter)}
          className="mt-1 w-full rounded-[12px] border border-border bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {INDUSTRIES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label className="mt-4 block text-xs font-medium text-zinc-500 dark:text-zinc-400">Date range</label>
        <select
          value={draftDateRange}
          onChange={(e) => onDraftDateRangeChange(e.target.value as DateRangeFilter)}
          className="mt-1 w-full rounded-[12px] border border-border bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        >
          {DATE_RANGES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onDraftIndustryChange(DEFAULT_INDUSTRY);
              onDraftDateRangeChange(DEFAULT_DATE_RANGE);
              onReset();
            }}
            className="rounded-[12px] border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[12px] border border-border px-4 py-2 text-sm font-medium text-navy hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onApply();
                onClose();
              }}
              className="rounded-[12px] bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
