import { getWeeklyProgressShade } from "../../../../lib/habitTheme";
import ConsistencyMetricCard from "./ConsistencyMetricCard";
import MetricCard from "./MetricCard";

export default function MetricsGrid({ metrics, consistencyPercent, color }) {
  const visibleMetrics = metrics.filter((metric) => metric.title !== "Started");
  return (
    <div className="flex items-center justify-center max-[360px]:mt-1">
      <div className="grid w-full grid-cols-3 gap-3 max-[360px]:gap-3">
        {visibleMetrics.map((metric, index) =>
          metric.title === "Consistency" ? (
            (() => {
              const clampedPercent = Math.min(consistencyPercent || 0, 100);
              const shade = getWeeklyProgressShade(clampedPercent);
              return (
                <ConsistencyMetricCard
                  key={metric.title}
                  title={metric.title}
                  subtitle={metric.subtitle}
                  percent={consistencyPercent}
                  value={consistencyPercent}
                  showPercent
                  color={shade}
                  completionColor={shade}
                  showDivider={index % 3 !== 0}
                />
              );
            })()
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
