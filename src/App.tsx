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
  const [sortBasedOnAge, setSortBasedOnAge] = useState<boolean>(false);
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
      setSortBasedOnAge(false);
    } else if (data === 2) {
      setRenderBubbleChart(true);

      setSortBasedOnMurder(false);
      setSortBasedOnAge(true);
    } else if (data === 3) {
      setRenderBubbleChart(true);

      setSortBasedOnAge(false);
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

  const bubbleChartNotes: string[] = [
    "According to police figures, at least <strong>97 women across Kenya were killed in femicides between August and October of last year.</strong>",
    "While women, in general, face a higher risk of experiencing intimate partner violence (IPV) and femicide, the trends in the data show that <strong>women aged 18 to 35 at 59% form the largest demographic of victims of femicide in Kenya. </strong><br/> <br/> The perpetrators of femicide remain concentrated around men aged 18-35. ",
    `<p>Globally, UN Women reported that in 2023 alone, <strong>one woman was killed every 10 minutes</strong>, in intimate partner and family-related murders.</p>`,
    `Intimate partners and family members perpetrate the majority of killings. <br/> <br/> Our analysis shows that in <strong>77% of cases, killings were committed by a person known by the victim - an intimate partner, relative or friend.</strong> 68% of the perpetrators were currently or had previously been in an intimate relationship with the victim. Husbands, then boyfriends, are the biggest culprits.<br/><br/>  In only about 22% of cases, the woman was killed by a stranger or relationship is unknown.`,
    `<p>Alberta Wambua, director of the Gender Violence Recovery Centre, said economic hardship fuelled such violence as men frustrated by their financial struggles lashed out at women.
    <br/> <br/>
    Kenyan police routinely fail to respond to complaints of gender-based violence, often considering them private matters, Betty Kabari, an activist with End Femicide Kenya, told Reuters.</p>`,
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
            <BubbleChart
              sortBasedOnMurder={sortBasedOnMurder}
              sortBasedOnAge={sortBasedOnAge}
            />
          )}
        </div>
        <Scrollama
          onStepEnter={updateBubbleStepIndex}
          // onStepExit={updateStepExit}
          offset={0.5}
          key={3}
        >
          {[1, 2, 3, 4].map((step) => (
            <Step data={step} key={step}>
              <div className="p-6 flex justify-start items-center h-screen">
                <div className="bg-white p-4 rounded-md min-h-32 text-black mx-auto flex justify-center items-center  z-50 w-1/2">
                  {/* render html string */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: bubbleChartNotes[step - 1],
                    }}
                  ></div>
                </div>
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
