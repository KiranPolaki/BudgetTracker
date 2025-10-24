import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const BudgetGaugeChart = ({ data }) => {
  const ref = useRef();
  const width = 250;
  const height = 150;
  const margin = 20;

  useEffect(() => {
    if (!data || data.budget <= 0) {
      d3.select(ref.current).select("svg").remove(); // Clear previous chart
      return;
    }

    const { budget, spent } = data;
    const percentSpent = Math.min(spent / budget, 1);

    d3.select(ref.current).select("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height - margin})`);

    const arc = d3
      .arc()
      .innerRadius(80)
      .outerRadius(100)
      .startAngle(-Math.PI / 2);

    const color = d3
      .scaleLinear()
      .domain([0, 0.75, 1])
      .range(["#6ee7b7", "#facc15", "#ef4444"]);

    // Background arc
    svg
      .append("path")
      .datum({ endAngle: Math.PI / 2 })
      .style("fill", "#e5e7eb")
      .attr("d", arc);

    // Foreground arc (progress)
    svg
      .append("path")
      .datum({ endAngle: Math.PI * percentSpent - Math.PI / 2 })
      .style("fill", color(percentSpent))
      .attr("d", arc);

    // Text in the middle
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .text(`${(percentSpent * 100).toFixed(0)}%`);

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("Spent");
  }, [data]);

  return (
    <div
      ref={ref}
      className="flex justify-center items-center h-full w-full mt-4"
    />
  );
};

export default BudgetGaugeChart;
