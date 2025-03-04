import "./App.css";
import { Scrollama, Step } from "react-scrollama";
import { ReactNode, useState } from "react";
import BarChart, { TRelationship } from "./components/charts/BarChart";
import DataIntroduction from "./components/DataIntroduction";
import HeaderIntro from "./components/HeaderIntro";
import BubbleChart from "./components/charts/BubbleChart";
import { Analytics } from "@vercel/analytics/react";


type TOnStepCallback = {
  element: ReactNode; // The DOM node of the step that was triggered
  data: unknown; // The data supplied to the step
  direction: "up" | "down"; // 'up' or 'down'
  entry: IntersectionObserverEntry; // The IntersectionObserverEntry for the step
};

function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [, setCurrentGraphStepIndex] = useState<number | null>(null);
  const [hightlightYear, setHightlightYear] = useState<null | number[]>(null);
  const [sortBasedOnMurder, setSortBasedOnMurder] = useState<boolean>(false);
  const [sortBasedOnAge, setSortBasedOnAge] = useState<boolean>(false);
  const [renderBubbleChart, setRenderBubbleChart] = useState<boolean>(false);
  const [highlightRelationship, setHighlightRelationship] = useState<TRelationship|null>(null)

  const updateStepIndex = ({ data }: TOnStepCallback) => {
    console.log({ data });
    setCurrentStepIndex(data as number);
  };

  const updateGraphStepIndex = ({ data }: TOnStepCallback) => {
    console.log({ data });
    setCurrentGraphStepIndex(data as number);
    if (data === 1) {
      setHightlightYear([2018, 2024]);
      setSortBasedOnMurder(false);
    }
    if (data === 2) {
      setSortBasedOnMurder(true);
      setHighlightRelationship("Husband/Ex-Husband")

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
      setSortBasedOnMurder(false);
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

  const barGraphNotes: string[] = [
    `  
                    2024 proved to be the worst year for femicide with a total
                    of <b>113 cases</b> despite the amplified coverage and
                    campaigns against it. This tops 2018 which was the previous high. <br/><br/> (After final data collection by Odip
                    Dev, the number of cases rose to <b>171 cases</b>). <br />
                    <br />
                    <br />
                    <p className="italic">
                      
                      Note: We are yet to take into account the latest data.
                      Find the latest database with the latest numbers
                      <a
                        href="https://femicide.africauncensored.online/"
                        class="cursor-pointer text-femicide-red"
                        target="_blank"
                      >
                        
                        here.
                      </a>
                    </p>
                  </p>`,
    `<b>Getting married gets women killed</b>. Husbands still lead as perpetrators, and there’s an almost 75% percent chance that a woman will be killed by someone that she knows; a family member, friend or intimate partner.
    <br/> <br/>

    Alberta Wambua, director of the <b>Gender Violence Recovery Centre</b>, said economic hardship fuelled such violence as men frustrated by their financial struggles lashed out at women.

    <br/><br/>

   

    `,
    ` Kenyan police routinely fail to respond to complaints of gender-based violence, often considering them private matters, Betty Kabari, an activist with End Femicide Kenya, told Reuters.
"We have a lot of cases of domestic violence where it's not that the perpetrator is not known," she said. "They are known, but the police have no interest in following up". <br/> <br/>
The professional runner  <a
                        href="https://www.olympics.com/en/news/ugandan-olympic-marathoner-rebecca-cheptegei-dies-after-fire-attack"
                        class="cursor-pointer text-femicide-red"
                        target="_blank"
                      >
                         Rebecca Cheptegei </a>, whose ex-boyfriend killed her in September by dousing her in petrol and setting her alight, had <b>gone to the police at least three times last year to report threats and physical abuse by him </b>, her family said`,
    `Femicide in Kenya is more than a series of tragic events; it is <b>a systemic issue deeply rooted in misogynistic norms and societal structures that perpetuate violence against women as a method of control and discipline. </b> <br/> <br/>“The problem is the normalization of gender-based violence and the rhetoric that, yes, women are disposable,” said <b>Njeri wa Migwi, co-founder of Usikimye</b>`,
  ];
  return (
    <div className="bg-femicide-white">
      <Analytics />
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

      <div className="relative md:grid md:grid-cols-2 min-h-screen">
        <div className={`sticky md:hidden top-0 h-screen z-40`}>
          {" "}
          <div className={`min-h-screen flex justify-center items-center p-2`}>
            <BarChart
              highlightYear={hightlightYear}
              sortBasedOnMurder={sortBasedOnMurder}
              highlightRelationship={highlightRelationship}
              
            />

            {/* <BubbleChart /> */}
          </div>
        </div>
        <div className="z-50 relative">
          <Scrollama key={2} onStepEnter={updateGraphStepIndex} offset={0.5}>
            {[1, 2, 3, 4].map((step) => (
              <Step data={step} key={step}>
                <div className="min-h-[200vh] md:min-h-screen p-6 flex justify-start items-center">
                  <p
                    className="bg-white p-6 rounded-md text-black"
                    dangerouslySetInnerHTML={{
                      __html: barGraphNotes[step - 1],
                    }}
                  ></p>
                </div>
              </Step>
            ))}
          </Scrollama>
        </div>
        <div className={`hidden md:block sticky top-0 h-screen `}>
          {" "}
          <div className={`min-h-screen flex justify-center items-center`}>
            <BarChart
              highlightYear={hightlightYear}
              sortBasedOnMurder={sortBasedOnMurder}
              highlightRelationship={highlightRelationship}
            />

            {/* <BubbleChart /> */}
          </div>
        </div>
      </div>
      <div className="bg-femicide-red p-16 bg-opacity-95 text-white  rounded text-balance  clip-path overflow-hidden">
        <div className="w-80%">
          <h3 className="text-xl font-bold mb-4">Data Sources/References:</h3>
          <ul className="text-sm ">
            <li>
              Odipo Dev:{" "}
              <a
                href="https://femicide.africaunc  
ensored.online/"
                target="_blank"
              >
                Femicide Database
              </a>
            </li>
            <li>
              Equal Measures 2030:{" "}
              <a
                href="https://equalmeasures2030.org/blogs/kenyas-urgent-battle-against-femicide/"
                target="_blank"
              >
                Link
              </a>
            </li>
            <li>
              Africa Uncensored:{" "}
              <a
                href=" https://africauncensored.online/blog/2025/01/24/femicide-in-kenya-2024-was-the-worst-year-on-record/"
                target="_blank"
              >
                Link
              </a>
            </li>
            <li>
              Africa Data Hub:
              <a
                href="https://www.africadatahub.org/femicide-kenya"
                target="_blank"
              >
                Link
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
