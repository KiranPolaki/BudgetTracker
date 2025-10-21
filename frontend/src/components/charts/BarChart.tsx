import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BarData {
  category: string;
  budget: number;
  actual: number;
}

interface BarChartProps {
  data: BarData[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export default function BarChart({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 60, left: 60 },
}: BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Calculate dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const categories = data.map((d) => d.category);
    const x0 = d3
      .scaleBand()
      .domain(categories)
      .range([0, innerWidth])
      .paddingInner(0.1);

    const x1 = d3
      .scaleBand()
      .domain(["budget", "actual"])
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.budget, d.actual)) ?? 0])
      .range([innerHeight, 0])
      .nice();

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add bars
    const categoryGroups = svg
      .selectAll(".category")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "category")
      .attr("transform", (d) => `translate(${x0(d.category)},0)`);

    // Budget bars
    categoryGroups
      .append("rect")
      .attr("class", "bar budget")
      .attr("x", () => x1("budget")!)
      .attr("y", (d) => y(d.budget))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => innerHeight - y(d.budget))
      .attr("fill", "#60A5FA")
      .append("title")
      .text((d) => `Budget: $${d.budget.toLocaleString()}`);

    // Actual bars
    categoryGroups
      .append("rect")
      .attr("class", "bar actual")
      .attr("x", () => x1("actual")!)
      .attr("y", (d) => y(d.actual))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => innerHeight - y(d.actual))
      .attr("fill", "#F87171")
      .append("title")
      .text((d) => `Actual: $${d.actual.toLocaleString()}`);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em");

    svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => `$${d}`)
    );

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${innerWidth - 100}, -10)`);

    const legendData = [
      { label: "Budget", color: "#60A5FA" },
      { label: "Actual", color: "#F87171" },
    ];

    legend
      .selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d, i) => i * 20)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d) => d.color);

    legend
      .selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", 20)
      .attr("y", (d, i) => i * 20 + 10)
      .attr("class", "text-sm fill-gray-700")
      .text((d) => d.label);
  }, [data, width, height, margin]);

  return <svg ref={svgRef} className="w-full h-full"></svg>;
}
