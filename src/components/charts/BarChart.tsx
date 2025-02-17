import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import { TData } from "../../types";

type TChartData = {
  year: number | null;
  count: number;
};

type TD3ChartProps = {
  highlightYear: number | null;
};

// Show the number of women killed through the years
const D3Chart = (props: TD3ChartProps) => {
  const { highlightYear } = props;
  const [data, setData] = useState<TChartData[]>([]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  const yAccessor = (d: TChartData) => d.count;
  const xAccessor = (d: TChartData) => d.year?.toString() ?? "";

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current) {
        const { width } = wrapperRef.current.getBoundingClientRect();
        setDimensions({ width, height: 400 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Fetch & process CSV data
  useEffect(() => {
    async function fetchData() {
      const femicide_data: TData[] = await d3.csv("/femicide_kenya.csv");

      const sortData = d3.rollup(
        femicide_data,
        (v) => v.length,
        (d) => {
          const date = new Date(d["Date of Murder"]);
          return !isNaN(date.getTime()) ? date.getFullYear() : null;
        }
      );

      const processedData = Array.from(sortData, ([year, count]) => ({
        year,
        count,
      }));
      const sortedData = processedData
        .filter((d) => d.year !== null)
        .sort((a, b) => (a.year! - b.year!) as number);

      setData(sortedData);
    }
    fetchData();
  }, []);

  // Render D3 chart
  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    const tooltip = d3.select(tooltipRef.current);
    const { width, height } = dimensions;
    const margin = { top: 20, right: 50, bottom: 50, left: 50 };

    const xScale = d3
      .scaleBand()
      .domain(data.map(xAccessor))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, yAccessor) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const bars = svg
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => xScale(xAccessor(d)) ?? 0)
      .attr("y", (d) => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.count) - margin.bottom)
      .attr("fill", "gray")

      .on("mouseover", (event, d) => {
        const x = xScale(xAccessor(d)) ?? 0;
        const y = yScale(d.count); // Get the bar's height position

        tooltip
          .style("visibility", "visible")
          .text(`${d.count} Cases`)
          .style("left", `${x + xScale.bandwidth() / 2}px`) // Center tooltip
          .style("top", `${y - 35}px`); // Move tooltip above the bar

        d3.select(event.target).attr("fill", "red");
      })
      .on("mouseleave", (event) => {
        tooltip.style("visibility", "hidden");
        d3.select(event.target).attr("fill", "gray");
      });

    bars
      .transition()
      .duration(500)
      .attr("fill", (d) => (d.year === highlightYear ? "red" : "gray"));

    // X-Axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    // Y-Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // X-Axis Label
    svg
      .append("text")
      .attr("x", width / 2) // Centered along X-axis
      .attr("y", height - margin.bottom + 50) // Positioned below the axis
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("Year");

    // Y-Axis Label
    svg
      .append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -height / 2) // Centered along Y-axis
      .attr("y", margin.left - 40) // Positioned left of Y-axis
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#333")
      .text("No. of Femicide Cases");
  }, [data, dimensions, highlightYear]);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        overflowX: "auto",
        position: "relative",
      }}
    >
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          background: "rgba(0, 0, 0, 0.75)",
          color: "#fff",
          padding: "5px 10px",
          borderRadius: "5px",
          fontSize: "12px",
          pointerEvents: "none",
        }}
      />
      <svg ref={svgRef} />
    </div>
  );
};

export default D3Chart;
