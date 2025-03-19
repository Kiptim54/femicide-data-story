import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Dispatch, SetStateAction } from "react";
import { TChartData } from "./charts/BubbleChart";

export const DetailsDialog = ({
  victimDetails,
  open,
  setIsOpen,
}: {
  victimDetails: TChartData | undefined;
  open: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Dialog open={open} defaultOpen={open} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="d b-0 border-b-2 py-2">
            {victimDetails?.name} ({victimDetails?.age}{" "}
            {victimDetails?.age && `years old`})
          </DialogTitle>
          <DialogDescription>
            Name:{" "}
            <span className="text-primary font-semibold">
              {victimDetails?.name}
            </span>
            <br />
            Age:{" "}
            <span className="text-primary font-semibold">
              {victimDetails?.age}
            </span>
            <br />
            Location:{" "}
            <span className="text-primary font-semibold">
              {victimDetails?.location}
            </span>
            <br />
            Date:{" "}
            <span className="text-primary font-semibold">
              {victimDetails?.date}
            </span>
            <br />
            Cause of Death:{" "}
            <span className="text-primary font-semibold">
              {victimDetails?.suspectRelationship}
            </span>
            <br />
            Time to Verdict:{" "}
            <span className="text-primary font-semibold">
              {victimDetails?.verdictTime}
            </span>
            <br />
            Source:{" "}
            <a
              className="font-bold text-femicide-red"
              href={`${victimDetails?.source}`}
              target="_blank"
              rel="noreferrer"
            >
              Read from Source
            </a>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
