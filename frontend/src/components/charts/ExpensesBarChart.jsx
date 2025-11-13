import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { formatCurrency } from "../../lib/utils";

const ExpensesBarChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = d3.select(ref.current);
    const width = ref.current.clientWidth || 400;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 60, left: 150 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const sortedData = [...data].sort((a, b) => b.value - a.value);

    container.select("svg").remove();

    const svg = container
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const yScale = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.label))
      .range([0, chartHeight])
      .padding(0.3);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.value)])
      .range([0, chartWidth]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(sortedData.map((d) => d.label))
      .range(d3.schemeSet3);

    g.selectAll(".bar")
      .data(sortedData)
      .join("rect")
      .attr("class", "bar")
      .attr("y", (d) => yScale(d.label))
      .attr("x", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", 0)
      .attr("fill", (d) => colorScale(d.label))
      .attr("rx", 4)
      .style("opacity", 0.85)
      .transition()
      .duration(800)
      .attr("width", (d) => xScale(d.value));

    g.selectAll(".label")
      .data(sortedData)
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.value) + 8)
      .attr("y", (d) => yScale(d.label) + yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#f9fafb")
      .text((d) => formatCurrency(d.value));

    const yAxis = d3.axisLeft(yScale);
    g.append("g")
      .call(yAxis)
      .style("color", "#d1d5db")
      .style("font-size", "12px");

    const xAxis = d3.axisBottom(xScale).ticks(5);
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(xAxis)
      .style("color", "#d1d5db")
      .style("font-size", "12px");

    g.selectAll(".domain")
      .style("stroke", "#4b5563")
      .style("stroke-width", "1px");

    g.selectAll(".tick line")
      .style("stroke", "#4b5563")
      .style("stroke-width", "1px");

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3.axisBottom(xScale).tickSize(-chartHeight).tickFormat("").ticks(5)
      )
      .style("stroke", "#3f4652")
      .style("stroke-opacity", "0.1")
      .style("stroke-width", "1px");

    g.selectAll(".grid .domain").style("stroke", "none");
  }, [data]);

  return <div ref={ref} style={{ width: "100%", height: "300px" }} />;
};

export default ExpensesBarChart;
