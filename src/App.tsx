import "./App.css";
import { Scrollama, Step } from "react-scrollama";
import { ReactNode, useState } from "react";

type TOnStepCallback = {
  element: ReactNode; // The DOM node of the step that was triggered
  data: unknown; // The data supplied to the step
  direction: "up" | "down"; // 'up' or 'down'
  entry: IntersectionObserverEntry; // The IntersectionObserverEntry for the step
};
function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);

  const updateStepIndex = ({ data }: TOnStepCallback) => {
    console.log({ data });
    setCurrentStepIndex(data as number);
  };

  const updateStepExit = ({ data, direction }: TOnStepCallback) => {
    console.log({ data });
    if (data === 1 && direction == "up") setCurrentStepIndex(null);
  };
  return (
    <div className="relative">
      <div className="sticky h-screen top-0 bg-femicide flex justify-center items-center  bg-cover bg-center text-white bg-black bg-opacity-85 bg-blend-darken">
        <div
          className={`bg-white p-16 text-black text-center w-3/4 m-auto md:w-[60%] rounded transition-opacity duration-500 ease-out  ${
            currentStepIndex === null
              ? "relative opacity-100 z-50"
              : "opacity-0"
          }`}
        >
          <h1 className="text-xl md:text-5xl font-bold mb-4">
            <span className="text-red-700 font-extrabold">FEMICIDE</span> IN
            KENYA
          </h1>
          <p className="text-lg text-center">
            A data story tracking and humanizing Kenyan femicide cases through
            the years{" "}
          </p>
        </div>
      </div>
      <Scrollama
        onStepEnter={updateStepIndex}
        onStepExit={updateStepExit}
        offset={0.5}
      >
        {[1, 2, 3].map((step) => (
          <Step data={step} key={step}>
            <div className={`h-screen flex justify-center items-center`}>
              <div
                className={`bg-white p-16 text-black  w-3/4 m-auto md:w-[60%] rounded  ${
                  currentStepIndex === step
                    ? "relative opacity-100 z-50"
                    : "opacity-20"
                }`}
              >
                <p className="text-lg">
                  Beth Muthoni, a 41 year old woman, was found brutally murdered
                  on January 18 2025 at Thiririka Shrine in Gatundu South,
                  Kiambu. She had visited the facility for prayers.
                  <br />
                  <br />
                  Beth Muthoni, a 41 year old woman, was found brutally murdered
                  on January 18 2025 at Thiririka Shrine in Gatundu South,
                  Kiambu. She had visited the facility for prayers. Beth
                  Muthoni, a 41 year old woman, was found brutally murdered on
                  January 18 2024 at Thiririka Shrine in Gatundu South, Kiambu.
                  She had visited the facility for prayers.
                  <br />
                  <br />
                  -Daily Nation (Link)
                </p>
              </div>
            </div>
          </Step>
        ))}
      </Scrollama>
    </div>
  );
}

export default App;
