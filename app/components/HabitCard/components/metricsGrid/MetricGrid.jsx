import { getWeeklyProgressShade } from "../../../../lib/habitTheme";
import CheckInsMetricCard from "./CheckInsMetricCard";
import ConsistencyMetricCard from "./ConsistencyMetricCard";
import StreakMetricCard from "./StreakMetricCard";

export default function MetricsGrid({
  metrics,
  consistencyPercent,
  color,
  completionColor,
}) {
  const visibleMetrics = metrics.filter((metric) => metric.title !== "Started");
  const completionShade = completionColor || getWeeklyProgressShade(100);
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
                  completionColor={completionShade}
                  showDivider={index % 3 !== 0}
                />
              );
            })()
          ) : metric.title === "Streak" ? (
            <StreakMetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              showDivider={index % 3 !== 0}
            />
          ) : metric.title === "Check-ins" ? (
            <CheckInsMetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              showDivider={index % 3 !== 0}
            />
          ) : null
        )}
      </div>
    </div>
  );
}
