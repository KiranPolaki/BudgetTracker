import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { TrendingUp } from "lucide-react";

const BudgetGaugeChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.budget <= 0) {
      d3.select(ref.current).selectAll("svg").remove();
      return;
    }

    const { budget, spent } = data;
    const percentSpent = Math.min(spent / budget, 1);

    d3.select(ref.current).selectAll("svg").remove();

    const containerWidth = ref.current.clientWidth || 280;
    const containerHeight = ref.current.clientHeight || 200;

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr(
        "transform",
        `translate(${containerWidth / 2}, ${containerHeight - 30})`
      );

    const radius = Math.min(containerWidth * 0.45, containerHeight * 0.8);
    const arcWidth = radius * 0.15;

    const arc = d3
      .arc()
      .innerRadius(radius - arcWidth)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2);

    const color = d3
      .scaleLinear()
      .domain([0, 0.75, 1])
      .range(["#22c55e", "#facc15", "#ef4444"]);

    svg
      .append("path")
      .datum({ endAngle: Math.PI / 2 })
      .style("fill", "#27272a")
      .attr("d", arc);

    svg
      .append("path")
      .datum({ endAngle: Math.PI * percentSpent - Math.PI / 2 })
      .style("fill", color(percentSpent))
      .attr("d", arc)
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate(-Math.PI / 2, d.endAngle);
        return function (t) {
          d.endAngle = interpolate(t);
          return arc(d);
        };
      });

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -radius * 0.35)
      .style("font-size", "28px")
      .style("font-weight", "600")
      .style("fill", "#f9fafb")
      .text(`${(percentSpent * 100).toFixed(0)}%`);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", -radius * 0.15)
      .style("font-size", "13px")
      .style("fill", "#71717a")
      .text("of budget spent");
  }, [data]);

  return (
    <div ref={ref} className="w-full h-52 flex items-center justify-center">
      {!data || data.budget <= 0 ? (
        <div className="flex flex-col items-center justify-center h-full">
          <TrendingUp className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm text-center">
            Set a budget to see your spending progress
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default BudgetGaugeChart;
