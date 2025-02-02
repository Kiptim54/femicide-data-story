import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const D3Chart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const data = [10, 25, 40, 30, 50, 80];

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    const width = 300;
    const height = 150;
    const barWidth = width / data.length;

    svg.attr("width", width).attr("height", height);

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * barWidth)
      .attr("y", (d) => height - d)
      .attr("width", barWidth - 5)
      .attr("height", (d) => d)
      .attr("fill", "blue");
  }, [data]);

  return <svg ref={svgRef} width={100} height={100} />;
};

export default D3Chart;
