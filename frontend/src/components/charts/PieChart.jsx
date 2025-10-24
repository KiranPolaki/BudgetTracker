import { useEffect, useRef } from "react";
import * as d3 from "d3";

const PieChart = ({ data, title }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2 - 40;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.category__name))
      .range(d3.schemeSet3);

    const pie = d3.pie().value((d) => d.total);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    const outerArc = d3
      .arc()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1);

    const arcs = svg
      .selectAll("arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.category__name))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("transition", "all 0.3s ease")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr(
            "d",
            d3
              .arc()
              .innerRadius(radius * 0.5)
              .outerRadius(radius * 1.05)
          );
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).transition().duration(200).attr("d", arc);
      });

    // Add labels
    arcs
      .append("text")
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.99 * (midAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr("text-anchor", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? "start" : "end";
      })
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text((d) => d.data.category__name);

    // Add polylines
    arcs
      .append("polyline")
      .attr("points", (d) => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos];
      })
      .style("fill", "none")
      .style("stroke", "#999")
      .style("stroke-width", "1px");
  }, [data]);

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default PieChart;
