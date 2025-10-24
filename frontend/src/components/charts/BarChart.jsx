import { useEffect, useRef } from "react";
import * as d3 from "d3";

const BarChart = ({ data, title, color = "#3b82f6" }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const margin = { top: 20, right: 30, bottom: 80, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.category__name))
      .range([0, width])
      .padding(0.2);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)])
      .nice()
      .range([height, 0]);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "11px");

    // Add Y axis
    svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => `₹${d}`)
    );

    // Add bars
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.category__name))
      .attr("y", height)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", color)
      .attr("rx", 4)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).transition().duration(200).attr("opacity", 0.8);

        // Show tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0,0,0,0.8)")
          .style("color", "white")
          .style("padding", "8px 12px")
          .style("border-radius", "6px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .html(`${d.category__name}: ₹${d.total.toFixed(2)}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("opacity", 1);

        d3.selectAll(".tooltip").remove();
      })
      .transition()
      .duration(800)
      .attr("y", (d) => y(d.total))
      .attr("height", (d) => height - y(d.total))
      .delay((d, i) => i * 100);
  }, [data, color]);

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default BarChart;
