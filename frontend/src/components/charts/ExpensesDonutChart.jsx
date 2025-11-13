import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const ExpensesDonutChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = d3.select(ref.current);
    const width = ref.current.clientWidth || 350;
    const height = width;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;

    container.select("svg").remove();

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible")
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(d3.schemeSet3);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);
    const data_ready = pie(data);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);

    const outerArc = d3
      .arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    svg
      .selectAll("path")
      .data(data_ready)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.label))
      .attr("stroke", "#1f2937")
      .style("stroke-width", "2px")
      .style("opacity", 0.9)
      .transition()
      .duration(750)
      .attrTween("d", function (d) {
        const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function (t) {
          d.endAngle = i(t);
          return arc(d);
        };
      });

    svg
      .selectAll("polyline")
      .data(data_ready)
      .join("polyline")
      .attr("stroke", "#9ca3af")
      .style("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("points", (d) => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        posC[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      });

    svg
      .selectAll("text")
      .data(data_ready)
      .join("text")
      .text((d) => d.data.label)
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * 1.05 * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", (d) => (midAngle(d) < Math.PI ? "start" : "end"))
      .style("font-size", 13)
      .style("font-weight", 500)
      .style("fill", "#f9fafb");

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
  }, [data]);

  return (
    <div
      ref={ref}
      className="flex justify-center items-center w-full h-64 sm:h-80 lg:h-96"
    />
  );
};

export default ExpensesDonutChart;
