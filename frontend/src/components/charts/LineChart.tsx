import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface LineData {
  date: string;
  value: number;
}

interface LineChartProps {
  data: LineData[];
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export default function LineChart({
  data,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 30, left: 60 },
}: LineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Calculate dimensions
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Parse dates
    const parsedData = data.map((d) => ({
      ...d,
      parsedDate: new Date(d.date),
    }));

    // Create scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.parsedDate) as [Date, Date])
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) ?? 0])
      .range([innerHeight, 0])
      .nice();

    // Create line generator
    const line = d3
      .line<(typeof parsedData)[0]>()
      .x((d) => x(d.parsedDate))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerWidth)
          .tickFormat(() => "")
      )
      .attr("stroke-opacity", 0.1);

    // Add line path
    svg
      .append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#60A5FA")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots
    svg
      .selectAll(".dot")
      .data(parsedData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.parsedDate))
      .attr("cy", (d) => y(d.value))
      .attr("r", 4)
      .attr("fill", "#60A5FA")
      .append("title")
      .text((d) => `${d.date}: $${d.value.toLocaleString()}`);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5));

    svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => `$${d}`)
    );
  }, [data, width, height, margin]);

  return <svg ref={svgRef} className="w-full h-full"></svg>;
}
