import "./App.css";
import { Scrollama, Step } from "react-scrollama";
import { ReactNode, useState } from "react";
import BarChart from "./components/charts/BarChart";
import DataIntroduction from "./components/DataIntroduction";
import HeaderIntro from "./components/HeaderIntro";
import BubbleChart from "./components/charts/BubbleChart";

type TOnStepCallback = {
  element: ReactNode; // The DOM node of the step that was triggered
  data: unknown; // The data supplied to the step
  direction: "up" | "down"; // 'up' or 'down'
  entry: IntersectionObserverEntry; // The IntersectionObserverEntry for the step
};

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [, setCurrentGraphStepIndex] = useState<number | null>(null);
  const [hightlightYear, setHightlightYear] = useState<null | number>(null);
  const [sortBasedOnMurder, setSortBasedOnMurder] = useState<boolean>(false);
  const [renderBubbleChart, setRenderBubbleChart] = useState<boolean>(false);

  const updateStepIndex = ({ data }: TOnStepCallback) => {
    console.log({ data });
    setCurrentStepIndex(data as number);
  };

  const updateGraphStepIndex = ({ data }: TOnStepCallback) => {
    console.log({ data });
    setCurrentGraphStepIndex(data as number);
    if (data === 1) {
      setHightlightYear(2024);
    }
    if (data === 2) {
      setHightlightYear(2020);
    }
    if (data === 3) {
      setHightlightYear(2019);
    }
  };

  const updateBubbleStepIndex = ({ data }: TOnStepCallback) => {
    setCurrentGraphStepIndex(data as number);
    if (data === 1) {
      setRenderBubbleChart(true);
      setSortBasedOnMurder(false);
    }
    if (data === 2) {
      setSortBasedOnMurder(true);
    }
  };

  // const updateStepExit = ({ data, direction }: TOnStepCallback) => {
  //   console.log({ data });
  //   if (data === 0 && direction == "up") {
  //     setCurrentStepIndex(null);
  //   }
  // };

  const components: { component: ReactNode }[] = [
    { component: <HeaderIntro /> },
    {
      component: <DataIntroduction />,
    },
  ];
  return (
    <div className="bg-femicide-white">
      <div className="min-h-screen relative">
        <div
          className={`sticky h-screen top-0 bg-femicide flex justify-center items-center  bg-cover bg-center text-white bg-black bg-opacity-85 bg-blend-darken`}
        ></div>
        <Scrollama
          onStepEnter={updateStepIndex}
          // onStepExit={updateStepExit}
          offset={0.5}
          key={1}
        >
          {components.map((step, index) => (
            <Step data={index} key={index}>
              <div
                className={`w-3/4 m-auto md:w-[60%] min-h-screen rounded ${
                  currentStepIndex === index
                    ? "relative opacity-100 z-50"
                    : "opacity-20"
                }`}
              >
                {step.component}
              </div>
            </Step>
          ))}
        </Scrollama>
      </div>

      {/* the bubble chart section */}
      <div className="min-h-screen relative">
        <div
          className={`sticky h-screen top-0 flex justify-center items-center  bg-cover bg-center text-white  bg-opacity-85 bg-blend-darken`}
        >
          {renderBubbleChart && (
            <BubbleChart sortBasedOnMurder={sortBasedOnMurder} />
          )}
        </div>
        <Scrollama
          onStepEnter={updateBubbleStepIndex}
          // onStepExit={updateStepExit}
          offset={0.5}
          key={3}
        >
          {[1, 2].map((step) => (
            <Step data={step} key={step}>
              <div className="p-6 flex justify-start items-center h-screen">
                <h1 className="bg-white p-4 rounded-md min-h-32 text-black mx-auto flex justify-center items-center  z-50">
                  Hover on the bubbles to see details of the victim
                </h1>
              </div>
            </Step>
          ))}
        </Scrollama>
      </div>

      <div className="relative grid grid-cols-2 min-h-screen">
        <div>
          <Scrollama key={2} onStepEnter={updateGraphStepIndex} offset={0.5}>
            {[1, 2, 3, 4].map((step) => (
              <Step data={step} key={step}>
                <div className="min-h-screen p-6 flex justify-start items-center">
                  hey {step}
                </div>
              </Step>
            ))}
          </Scrollama>
        </div>

        <div className={`sticky top-0 h-screen`}>
          {" "}
          <div className={`min-h-screen flex justify-center items-center`}>
            <BarChart highlightYear={hightlightYear} />

            {/* <BubbleChart /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
