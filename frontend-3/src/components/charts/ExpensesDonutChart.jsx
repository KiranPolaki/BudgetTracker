import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const ExpensesDonutChart = ({ data }) => {
  const ref = useRef();
  const width = 300;
  const height = 300;
  const margin = 20;

  useEffect(() => {
    if (!data || data.length === 0) return;

    const radius = Math.min(width, height) / 2 - margin;
    d3.select(ref.current).select("svg").remove();

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(d3.schemePaired);

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
      .selectAll("allSlices")
      .data(data_ready)
      .join("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.label))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .style("opacity", 0.8);

    svg
      .selectAll("allPolylines")
      .data(data_ready)
      .join("polyline")
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr("points", (d) => {
        const posA = arc.centroid(d);
        const posB = outerArc.centroid(d);
        const posC = outerArc.centroid(d);
        posC[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      });

    svg
      .selectAll("allLabels")
      .data(data_ready)
      .join("text")
      .text((d) => d.data.label)
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        pos[0] = radius * 0.99 * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style("text-anchor", (d) => (midAngle(d) < Math.PI ? "start" : "end"))
      .style("font-size", 12);

    function midAngle(d) {
      return d.startAngle + (d.endAngle - d.startAngle) / 2;
    }
  }, [data]);

  return (
    <div ref={ref} className="flex justify-center items-center h-full w-full" />
  );
};

export default ExpensesDonutChart;
