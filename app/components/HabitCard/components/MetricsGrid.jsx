import CircularProgress from "./CircularProgress/CircularProgress";

const MetricCard = ({ title, value, subtitle, showDivider }) => (
  <div
    className={`relative flex flex-col items-center justify-center py-3 px-4 text-center max-[360px]:py-2.5 max-[360px]:px-3 ${
      showDivider
        ? "before:absolute before:left-0 before:top-5 before:bottom-5 before:w-[1.5px] before:bg-slate-200"
        : ""
    }`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 max-[360px]:text-[10px]">
      {title}
    </p>
    <p className="mt-1 text-2xl font-bold leading-tight text-slate-900 max-[360px]:text-xl">
      {value}
    </p>
    <p className="text-[11px] text-slate-600 max-[360px]:text-[10px]">
      {subtitle}
    </p>
  </div>
);

const ConsistencyMetricCard = ({
  title,
  subtitle,
  percent,
  value,
  showPercent,
  color,
  showDivider,
}) => (
  <div
    className={`relative flex flex-col items-center justify-center py-3 px-4 text-center max-[360px]:py-2.5 max-[360px]:px-3 ${
      showDivider
        ? "before:absolute before:left-0 before:top-5 before:bottom-5 before:w-[1.5px] before:bg-slate-200"
        : ""
    }`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 max-[360px]:text-[10px]">
      {title}
    </p>
    <div className="mt-2 flex items-center justify-center">
      <CircularProgress
        percent={percent}
        value={value}
        showPercent={showPercent}
        color={color}
      />
    </div>
    <p className="text-[11px] text-slate-600 max-[360px]:text-[10px]">
      {subtitle}
    </p>
  </div>
);

export default function MetricsGrid({ metrics, consistencyPercent, color }) {
  const visibleMetrics = metrics.filter((metric) => metric.title !== "Started");
  return (
    <div className="mt-1 flex items-center justify-center max-[360px]:mt-3">
      <div className="grid w-full grid-cols-3 gap-3 max-[360px]:gap-3">
        {visibleMetrics.map((metric, index) =>
          metric.title === "Consistency" ? (
            <ConsistencyMetricCard
              key={metric.title}
              title={metric.title}
              subtitle={metric.subtitle}
              percent={consistencyPercent}
              value={consistencyPercent}
              showPercent
              color={color}
              showDivider={index % 3 !== 0}
            />
          ) : metric.title === "Streak" || metric.title === "Check-ins" ? (
            <ConsistencyMetricCard
              key={metric.title}
              title={metric.title}
              subtitle={metric.subtitle}
              percent={Math.min(100, parseInt(metric.value, 10) || 0)}
              value={parseInt(metric.value, 10) || 0}
              color={color}
              showDivider={index % 3 !== 0}
            />
          ) : (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              showDivider={index % 3 !== 0}
            />
          )
        )}
      </div>
    </div>
  );
}
