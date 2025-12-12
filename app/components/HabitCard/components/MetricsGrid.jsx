const MetricCard = ({ title, value, subtitle }) => (
  <div className="flex flex-col items-center justify-center rounded-md border border-slate-300 bg-slate-50/70 p-3 text-center shadow-sm">
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
      {title}
    </p>
    <p className="mt-1 text-2xl font-bold leading-tight text-slate-900">
      {value}
    </p>
    <p className="text-[11px] text-slate-600">{subtitle}</p>
  </div>
);

export default function MetricsGrid({ metrics }) {
  return (
    <div className="mt-4 flex items-center justify-center">
      <div className="grid w-full grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            subtitle={metric.subtitle}
          />
        ))}
      </div>
    </div>
  );
}
