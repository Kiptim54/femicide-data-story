import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

import { TData } from "../../types";
import { DetailsDialog } from "../DetailsDialog";

export type TChartData = {
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
  suspectRelationship: string;
};

const base =
  import.meta.env.MODE === "production"
    ? "https://kiptim54.github.io/femicide-data-story/"
    : "/";

const csvUrl = `${base}femicide_kenya.csv`;

export default function BubbleChart({
  sortBasedOnMurder,
  sortBasedOnAge,
}: {
  sortBasedOnMurder: boolean;
  sortBasedOnAge: boolean;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [chartData, setChartData] = useState<TChartData[] | []>([]);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [currentVictimDetails, setCurrentVictimDetails] =
    useState<TChartData>();
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);

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
      const data: TChartData[] = await d3.csv(csvUrl, (d: TData) => {
        const age = cleanAge(d.Age);

        let category = "unknown";
        let suspectRelationship = "stranger";

        if (!isNaN(age)) {
          if (age == 0) category = "unknown";
          else if (age < 18) category = "Below 18";
          else if (age <= 35) category = "18-35";
          else if (age <= 50) category = "36-50";
          else category = "Over 50";
        }

        // check if suspect relationship includes certain key words
        if (/husband|ex-husband/i.test(d["Suspect Relationship"])) {
          suspectRelationship = "Husband/Ex-Husband";
        } else if (
          /boyfriend|ex-boyfriend|lover/i.test(d["Suspect Relationship"])
        ) {
          suspectRelationship = "Boyfriend/Ex-Boyfriend";
        } else if (/friend|known to victim/i.test(d["Suspect Relationship"])) {
          suspectRelationship = "Friend/Known to Victim";
        } else if (/unknown/i.test(d["Suspect Relationship"])) {
          suspectRelationship = "Stranger/Unknown to Victim";
        } else if (
          /family|cousin|brother|step father/i.test(d["Suspect Relationship"])
        ) {
          suspectRelationship = "Family Member";
        } else if (/stranger/i.test(d["Suspect Relationship"])) {
          suspectRelationship = "Stranger/Unknown to Victim";
        } else {
          suspectRelationship = "Other";
        }

        return {
          name: d.name,
          age: age || 0, // Ensure it's always a number
          date: d["Date of Murder"],
          location: d.Location,
          relationship: suspectRelationship,
          suspectRelationship: d["Suspect Relationship"],
          verdictTime: d["Time to Verdict"],
          source: d.source,
          x:
            Math.random() * dimensions.width - (margin.left + margin.right) ||
            dimensions.width / 2,
          y:
            Math.random() * dimensions.height - (margin.top + margin.bottom) ||
            dimensions.height / 2,
          // x: dimensions.width / 2,
          // // (Math.random() - 0.5) * dimensions.width * 0.5,
          // y: dimensions.height / 2,
          // // (Math.random() - 0.5) * dimensions.height * 0.5,

          category, // Add category to each data point
        };
      });

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
      { label: "Below 18", color: "pink", radius: 10 },
      { label: "18-35", color: "red", radius: 10 },
      { label: "36-50", color: "indigo", radius: 10 },
      { label: "Over 50", color: "purple", radius: 10 },
      { label: "Unknown Age", color: "gray", radius: 10 }, // For unknowns
    ];

    // legend data for suspect relationship
    const legendSuspectData = [
      { label: "Husband/Ex-Husband", color: "pink", radius: 10 },
      {
        label: "Boyfriend/Ex-Boyfriend",
        color: "red",
        radius: 10,
      },
      { label: "Family Member", color: "purple", radius: 10 },
      { label: "Friend/Known to Victim", color: "indigo", radius: 10 },

      {
        label: "Stranger/Unknown to Victim",
        color: "gray",
        radius: 10,
      },
      // For unknowns
      { label: "Other", color: "black", radius: 10 }, // For unknowns
    ];

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawings

    const { width, height } = dimensions;

    const [minAge, maxAge] = d3.extent(chartData, (d) => d.age);

    // create radius scale based on the age
    const radiusScale = d3
      .scaleSqrt()
      .domain([minAge || 0, maxAge || 95])
      .range([10, 20]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(["Below 18", "18-35", "36-50", "Over 50", "unknown"])
      .range(["pink", "red", "indigo", "purple", "gray"]);

    const victimColorScale = d3
      .scaleOrdinal()
      .domain([
        "Husband/Ex-Husband",
        "Stranger/Unknown to Victim",
        "Friend/Known to Victim",
        "Family Member",
        "Boyfriend/Ex-Boyfriend",
        "Other",
      ])
      .range(["pink", "gray", "indigo", "purple", "red", "black"]);

    const simulation = d3
      .forceSimulation(chartData)
      .force("charge", d3.forceManyBody().strength(2));

    const categoryPositions: Record<string, { x: number; y: number }> = {
      "Below 18": { x: width * 0.25, y: height * 0.25 }, // Top-left
      unknown: { x: width * 0.75, y: height * 0.25 }, // Top-right
      "36-50": { x: width * 0.25, y: height * 0.75 }, // Bottom-left
      "Over 50": { x: width * 0.75, y: height * 0.75 }, // Bottom-right
      "18-35": { x: width * 0.5, y: height * 0.5 }, // Center
    };

    const victimRelationShipPositions: Record<
      string,
      { x: number; y: number }
    > = {
      "Stranger/Unknown to Victim": { x: width * 0.25, y: height * 0.25 }, // Top-left
      "Boyfriend/Ex-Boyfriend": { x: width * 0.75, y: height * 0.25 }, // Top-right
      "Friend/Known to Victim": { x: width * 0.25, y: height * 0.75 }, // Bottom-left
      "Family Member": { x: width * 0.75, y: height * 0.75 }, // Bottom-right
      "Husband/Ex-Husband": { x: width * 0.5, y: height * 0.5 }, // Center
      Other: { x: width * 0.5, y: height * 0.9 }, // Bottom-center
    };

    if (sortBasedOnAge) {
      // const categories = Array.from(new Set(chartData.map((d) => d.category)));
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
      // // Positioning with force simulation
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
        // imagebubbles
        //   .attr("x", (d) => (d.x ?? width / 2) - radiusScale(d.age))
        //   .attr("y", (d) => (d.y ?? height / 2) - radiusScale(d.age));
      });
    } else if (sortBasedOnMurder) {
      simulation
        .force(
          "collision",
          d3.forceCollide((d) => radiusScale(d.age) + 2)
        )
        .force(
          "x",
          d3
            .forceX(
              (d: TChartData) =>
                victimRelationShipPositions[d.relationship].x as number
            )
            .strength(0.5)
        )
        .force(
          "y",
          d3
            .forceY(
              (d: TChartData) => victimRelationShipPositions[d.relationship].y
            )
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
        // imagebubbles
        //   .attr("x", (d) => (d.x ?? width / 2) - radiusScale(d.age))
        //   .attr("y", (d) => (d.y ?? height / 2) - radiusScale(d.age));
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
        // imagebubbles
        //   .attr("x", (d) => (d.x ?? width / 2) - radiusScale(d.age))
        //   .attr("y", (d) => (d.y ?? height / 2) - radiusScale(d.age));
      });
    }

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    // .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const bubbles = svg
      .selectAll("circle")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("r", (d) => radiusScale(d.age) as number)
      .attr(
        "fill",
        (d) =>
          (sortBasedOnMurder
            ? victimColorScale(d.relationship)
            : colorScale(d.category)) as string
      ) // Use color scale
      .attr("opacity", 0.5)
      .on("click", (event, d) => {
        setCurrentVictimDetails({
          name: d.name,
          age: d.age,
          date: d.date,
          location: d.location,
          relationship: d.location,
          verdictTime: d.verdictTime,
          source: d.source,
          x: d.x,
          y: d.y,
          category: d.category,
          suspectRelationship: d.suspectRelationship,
        });
        setIsOpenDialog(true);
      })

      .on("mouseover", (event, d) => {
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = `
            <strong>Name:</strong> ${d.name} <br/>
            <strong>Age:</strong> ${d.age || "Unknown"} <br/>
            <strong>Location:</strong> ${d.location} <br/>
            <strong>Suspect Relationship:</strong> ${
              d.suspectRelationship
            } <br/>
            <strong>Murder Date:</strong> ${d.date} <br/>

            <strong>Verdict Time:</strong> ${d.verdictTime}
          `;
          tooltipRef.current.style.visibility = "visible";
          tooltipRef.current.style.background = "white";
          tooltipRef.current.style.color = `black`;
          tooltipRef.current.style.border = "0px solid black";
          tooltipRef.current.style.padding = "16px";
          tooltipRef.current.style.fontSize = "16px";
          // make the current bubble highlighted
          d3.select(event.currentTarget).attr("fill", "orange");
        }
      })

      .on("mouseleave", () => {
        if (tooltipRef.current) {
          // return bubble to original color

          bubbles.attr("fill", (d) =>
            sortBasedOnMurder
              ? (victimColorScale(d.relationship) as string)
              : (colorScale(d.category) as string)
          );

          // tooltipRef.current.style.visibility = "hidden";
          tooltipRef.current.innerHTML =
            "<strong>Hover or click on the bubbles to see the details of the victims</strong> <br/>";
        }
      });

    // const imagebubbles = svg
    //   .selectAll("image")
    //   .data(chartData)
    //   .enter()
    //   .append("image")
    //   .attr("xlink:href", AfroSVG)
    //   .attr("width", (d) => radiusScale(d.age) * 1.5)
    //   .attr("height", (d) => radiusScale(d.age) * 1.5)
    //   .attr("x", (d) => (d.x ?? width / 2) - radiusScale(d.age))
    //   .attr("y", (d) => (d.y ?? height / 2) - radiusScale(d.age))
    //   .attr("opacity", 1);

    const categoryCenters = d3
      .groups(chartData, (d) => d.category)
      .map(([key, values]) => {
        return {
          category: key,
          x: d3.mean(values, (d) => d.x) as number,
          y: d3.mean(values, (d) => d.y) as number,
        };
      });
    if (sortBasedOnAge) {
      svg
        .selectAll(".category-label")
        .data(categoryCenters)
        .enter()
        .append("text")
        .attr("class", "category-label")
        .attr("x", (d) => categoryPositions[d.category].x)
        .attr("y", (d) => categoryPositions[d.category].y)
        .attr("text-anchor", "middle")
        .attr("dy", "-1.5em") // Move label slightly above the cluster
        .text((d) => d.category)
        .style("font-size", "16px")
        .style("fill", "black"); // Correctly set the text color
    } else if (sortBasedOnMurder) {
      const victimRelationShipCenters = d3
        .groups(chartData, (d) => d.relationship)
        .map(([key, values]) => {
          return {
            relationship: key,
            x: d3.mean(values, (d) => d.x) as number,
            y: d3.mean(values, (d) => d.y) as number,
          };
        });

      svg
        .selectAll(".category-label")
        .data(victimRelationShipCenters)
        .enter()
        .append("text")
        .attr("class", "category-label")
        .attr("x", (d) => victimRelationShipPositions[d.relationship].x)
        .attr("y", (d) => victimRelationShipPositions[d.relationship].y)
        .attr("text-anchor", "middle")
        .attr("dy", "-1.5em") // Move label slightly above the cluster
        .text((d) => d.relationship)
        .style("font-size", "16px")
        .style("fill", "black"); // Correctly set the text color
    }

    //

    if (sortBasedOnMurder) {
      const legend = svg
        .append("g")
        .attr("transform", `translate(${width - 200}, 50)`); // Adjust position
      legend
        .append("rect")
        .attr("x", -10)
        .attr("y", -10)
        .attr("width", 250)
        .attr("height", 180)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("rx", 10)
        .attr("ry", 10)
        // add padding of 10px
        .attr("transform", `translate(-10, -10)`);

      legend
        .selectAll("legend-dots")
        .data(legendSuspectData)
        .enter()
        .append("circle")
        .attr("cx", 0)
        .attr("cy", (_d, i) => i * 25) // Spacing between items
        .attr("r", (d) => d.radius / 2) // Adjust size
        .attr("fill", (d) => d.color);

      legend
        .selectAll("legend-labels")
        .data(legendSuspectData)
        .enter()
        .append("text")
        .attr("x", 15) // Shift right of circle
        .attr("y", (_d, i) => i * 25 + 5) // Align with circles
        .text((d) => d.label)
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .style("alignment-baseline", "middle");
    } else {
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
        .attr("cy", (_d, i) => i * 25) // Spacing between items
        .attr("r", (d) => d.radius / 2) // Adjust size
        .attr("fill", (d) => d.color);

      legend
        .selectAll("legend-labels")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", 15) // Shift right of circle
        .attr("y", (_d, i) => i * 25 + 5) // Align with circles
        .text((d) => d.label)
        .attr("font-size", "12px")
        .attr("fill", "#333")
        .style("alignment-baseline", "middle");
    }

    // add background to legend
  }, [chartData, dimensions, sortBasedOnMurder, sortBasedOnAge]);

  return (
    <div
      ref={wrapperRef}
      className="h-screen w-full overflow-hidden"
      style={{
        width: "100%",
        // overflowX: "auto",
        position: "relative",
      }}
    >
      <div
        ref={tooltipRef}
        className="hidden md:block"
        style={{
          position: "absolute",
          backgroundColor: "white",
          padding: "8px",
          border: "1px solid gray",
          borderRadius: "5px",
          fontSize: "12px",
          pointerEvents: "none",
          // visibility: "hidden",
        }}
      >
        <strong>
          Hover or click on the bubbles to see the details of the victims d
        </strong>
      </div>

      <svg ref={svgRef} />

      <DetailsDialog
        victimDetails={currentVictimDetails}
        open={isOpenDialog}
        setIsOpen={setIsOpenDialog}
      />
    </div>
  );
}
