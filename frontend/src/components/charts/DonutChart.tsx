import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface ExpensesByCategory {
  category: string;
  amount: number;
  color?: string;
}

interface DonutChartProps {
  data: ExpensesByCategory[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export default function DonutChart({
  data,
  width = 400,
  height = 400,
  innerRadius = 80,
  outerRadius = 150,
}: DonutChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create pie generator
    const pie = d3
      .pie<ExpensesByCategory>()
      .value((d) => d.amount)
      .sort(null);

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<ExpensesByCategory>>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // Create SVG element
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Create chart
    const arcs = svg
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Add paths
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => d.data.color || colorScale(i.toString()));

    // Add labels
    arcs
      .append("text")
      .attr("transform", (d) => {
        const [x, y] = arc.centroid(d);
        return `translate(${x}, ${y})`;
      })
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("class", "text-sm fill-gray-700 font-medium")
      .text((d) => {
        const percentage = (
          (d.data.amount / d3.sum(data, (d) => d.amount)) *
          100
        ).toFixed(1);
        return percentage + "%";
      });

    // Add tooltips
    arcs
      .append("title")
      .text((d) => `${d.data.category}: $${d.data.amount.toLocaleString()}`);
  }, [data, width, height, innerRadius, outerRadius]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full h-full"></svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-2xl font-bold text-gray-700">
          ${data.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">Total</div>
      </div>
    </div>
  );
}
