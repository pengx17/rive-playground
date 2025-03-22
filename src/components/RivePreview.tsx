import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AsciiStructure } from "@/components/AsciiStructure";
import { RiveWrapper, RiveContents } from "@/components/RiveWrapper";
import {
  StateMachineInput,
  Rive,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";
import { cn } from "@/lib/utils";

interface RivePreviewProps {
  riveKey: number;
  riveFileUrl: string;
  selectedArtboard: string;
  selectedAnimation: string | null;
  selectedStateMachine: string | null;
  onLoad: (contents: RiveContents) => void;
  onError: () => void;
  onStateChanged: (inputs: Record<string, StateMachineInput>) => void;
  onRiveInit: (riveObj: Rive) => void;
  artboards: string[];
  animations: string[];
  stateMachines: string[];
  stateMachineInputs: Record<string, StateMachineInput>;
  fit?: Fit;
  alignment?: Alignment;
  backgroundStyle?: string;
  isPlaying?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export function RivePreview({
  riveKey,
  riveFileUrl,
  selectedArtboard,
  selectedAnimation,
  selectedStateMachine,
  onLoad,
  onError,
  onStateChanged,
  onRiveInit,
  artboards,
  animations,
  stateMachines,
  stateMachineInputs,
  fit = Fit.Contain,
  alignment = Alignment.Center,
  backgroundStyle = "grid",
  isPlaying = true,
  onPlayStateChange,
}: RivePreviewProps) {
  const hasArtboards = artboards.length > 0;

  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "rounded-md h-[400px] flex items-center justify-center overflow-hidden",
              {
                "bg-neutral-50": backgroundStyle === "none",
                "bg-grid-slate-200": backgroundStyle === "grid",
                "bg-dot-slate-300": backgroundStyle === "dots",
              }
            )}
          >
            <RiveWrapper
              key={riveKey}
              src={riveFileUrl}
              artboard={selectedArtboard}
              animation={selectedAnimation}
              stateMachine={selectedStateMachine}
              onLoad={onLoad}
              onError={onError}
              onStateChanged={onStateChanged}
              onRiveInit={onRiveInit}
              fit={fit}
              alignment={alignment}
              isPlaying={isPlaying}
              onPlayStateChange={onPlayStateChange}
            />
          </div>
        </CardContent>
      </Card>

      {hasArtboards && (
        <div className="mt-6">
          <AsciiStructure
            artboards={artboards}
            animations={animations}
            stateMachines={stateMachines}
            selectedArtboard={selectedArtboard}
            stateMachineInputs={stateMachineInputs}
          />
        </div>
      )}
    </div>
  );
}
