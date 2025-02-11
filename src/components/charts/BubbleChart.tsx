import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

import { TData } from "../../types";

type TChartData = {
  name: string;
  age: number;
  date: string;
  location: string;
  relationship: string;
  verdictTime: string;
  source: string;
  x: number;
  y: number;
  category: string;
};

export default function BubbleChart({
  sortBasedOnMurder,
}: {
  sortBasedOnMurder: boolean;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [chartData, setChartData] = useState<TChartData[] | []>([]);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  //   Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (wrapperRef.current) {
        const { width, height } = wrapperRef.current.getBoundingClientRect();

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  useEffect(() => {
    const cleanAge = (age: string | number) => {
      const numericAge = Number(age);
      return isNaN(numericAge) ? 0 : numericAge; // Replace NaN with 0
    };

    async function fetchData() {
      const data: TChartData[] = await d3.csv(
        "femicide_kenya.csv",
        (d: TData) => {
          const age = cleanAge(d.Age);

          let category = "unknown";

          if (!isNaN(age)) {
            if (age == 0) category = "unknown";
            else if (age <= 18) category = "young";
            else if (age <= 40) category = "adult";
            else if (age <= 60) category = "middle-aged";
            else category = "senior";
          }

          return {
            name: d.name,
            age: age || 0, // Ensure it's always a number
            date: d["Date of Murder"],
            location: d.Location,
            relationship: d["Suspect Relationship"],
            verdictTime: d["Time to Verdict"],
            source: d.source,
            x:
              Math.random() * dimensions.width - (margin.left + margin.right) ||
              dimensions.width / 2,
            y:
              Math.random() * dimensions.height -
                (margin.top + margin.bottom) || dimensions.height / 2,
            category, // Add category to each data point
          };
        }
      );

      console.log({ data });
      setChartData(data);
    }

    fetchData();
  }, [
    dimensions.height,
    dimensions.width,
    margin.bottom,
    margin.left,
    margin.right,
    margin.top,
  ]);

  useEffect(() => {
    if (!svgRef.current) return;

    const legendData = [
      { label: "Young (0-18)", color: "pink", radius: 10 },
      { label: "Adult (19-40)", color: "red", radius: 10 },
      { label: "Middle-aged (41-60)", color: "indigo", radius: 10 },
      { label: "Senior (61+)", color: "purple", radius: 10 },
      { label: "Unknown Age", color: "gray", radius: 10 }, // For unknowns
    ];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    const { width, height } = dimensions;

    const [minAge, maxAge] = d3.extent(chartData, (d) => d.age);
    console.log(minAge, maxAge);

    // create radius scale based on the age
    const radiusScale = d3
      .scaleSqrt()
      .domain([minAge || 0, maxAge || 95])
      .range([10, 25]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(["young", "adult", "middle-aged", "senior", "unknown"])
      .range(["pink", "red", "indigo", "purple", "gray"]);

    const simulation = d3
      .forceSimulation(chartData)
      .force("charge", d3.forceManyBody().strength(2));

    if (sortBasedOnMurder) {
      const categoryPositions: Record<string, { x: number; y: number }> = {
        young: { x: width * 0.25, y: height * 0.25 }, // Top-left
        unknown: { x: width * 0.75, y: height * 0.25 }, // Top-right
        "middle-aged": { x: width * 0.25, y: height * 0.75 }, // Bottom-left
        senior: { x: width * 0.75, y: height * 0.75 }, // Bottom-right
        adult: { x: width * 0.5, y: height * 0.5 }, // Center
      };

      const categories = Array.from(new Set(chartData.map((d) => d.category)));
      console.log({ categories });

      simulation
        .force(
          "collision",
          d3.forceCollide((d) => radiusScale(d.age) + 2)
        )
        .force(
          "x",
          d3
            .forceX(
              (d: TChartData) => categoryPositions[d.category].x as number
            )
            .strength(0.5)
        )
        .force(
          "y",
          d3
            .forceY((d: TChartData) => categoryPositions[d.category].y)
            .strength(0.5)
        );

      // Positioning with force simulation
      simulation.on("tick", () => {
        bubbles
          .attr("cx", (d) => {
            if (isNaN(d.x)) console.error("NaN detected in d.x:", d);
            return d.x ?? width / 2;
          })
          .attr("cy", (d) => {
            if (isNaN(d.y)) console.error("NaN detected in d.y:", d);
            return d.y ?? height / 2;
          });
      });
    } else {
      // Create force simulation
      simulation
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force(
          "collision",
          d3.forceCollide((d) => radiusScale(d.age) + 2)
        )
        .force(
          "x",
          d3.forceX((d) =>
            Math.max(
              radiusScale(d.age),
              Math.min(width - radiusScale(d.age), d.x || width / 2)
            )
          )
        )
        .force(
          "y",
          d3.forceY((d) =>
            Math.max(
              radiusScale(d.age),
              Math.min(height - radiusScale(d.age), d.y || height / 2)
            )
          )
        );

      // Positioning with force simulation
      simulation.on("tick", () => {
        bubbles
          .attr("cx", (d) => {
            if (isNaN(d.x)) console.error("NaN detected in d.x:", d);
            return d.x ?? width / 2;
          })
          .attr("cy", (d) => {
            if (isNaN(d.y)) console.error("NaN detected in d.y:", d);
            return d.y ?? height / 2;
          });
      });
    }

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const bubbles = svg
      .selectAll("circle")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("r", (d) => radiusScale(d.age) as number)
      .attr("fill", (d) => colorScale(d.category) as string) // Use color scale
      .attr("opacity", 0.5)
      .on("mouseover", (event, d) => {
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = `
            <strong>Name:</strong> ${d.name} <br/>
            <strong>Age:</strong> ${d.age || "Unknown"} <br/>
            <strong>Location:</strong> ${d.location} <br/>
            <strong>Suspect Relationship:</strong> ${d.relationship} <br/>
            <strong>Verdict Time:</strong> ${d.verdictTime}
          `;
          tooltipRef.current.style.visibility = "visible";
          tooltipRef.current.style.background = "white";
          tooltipRef.current.style.color = `black`;
          tooltipRef.current.style.border = "1px solid black";
          tooltipRef.current.style.padding = "16px";
          tooltipRef.current.style.fontSize = "16px";
        }
      })
      // .on("mousemove", (event) => {
      //   if (tooltipRef.current) {
      //     tooltipRef.current.style.left = `${event.pageX + 10}px`;
      //     tooltipRef.current.style.top = `${event.pageY + 10}px`;
      //   }
      // })
      .on("mouseleave", () => {
        if (tooltipRef.current) {
          tooltipRef.current.style.visibility = "hidden";
        }
      });

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 150}, 50)`); // Adjust position

    legend
      .append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", 200)
      .attr("height", 150)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 0)
      .attr("rx", 10)
      .attr("ry", 10)
      // add padding of 10px
      .attr("transform", `translate(-10, -10)`);

    legend
      .selectAll("legend-dots")
      .data(legendData)
      .enter()
      .append("circle")
      .attr("cx", 0)
      .attr("cy", (d, i) => i * 25) // Spacing between items
      .attr("r", (d) => d.radius / 2) // Adjust size
      .attr("fill", (d) => d.color);

    legend
      .selectAll("legend-labels")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", 15) // Shift right of circle
      .attr("y", (d, i) => i * 25 + 5) // Align with circles
      .text((d) => d.label)
      .attr("font-size", "12px")
      .attr("fill", "#333")
      .style("alignment-baseline", "middle");
    // add background to legend
  }, [chartData, dimensions, sortBasedOnMurder]);

  return (
    <div
      ref={wrapperRef}
      className="h-screen w-full"
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
          backgroundColor: "white",
          padding: "8px",
          border: "1px solid gray",
          borderRadius: "5px",
          fontSize: "12px",
          pointerEvents: "none",
          visibility: "hidden",
        }}
      ></div>

      <svg ref={svgRef} />
    </div>
  );
}
