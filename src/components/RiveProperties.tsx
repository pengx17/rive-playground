import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon } from "lucide-react";
import { Rive, Fit, Alignment } from "@rive-app/react-canvas";
import RiveStateMachineControls from "@/components/RiveStateMachineControls";
import { useState, useEffect } from "react";

interface RivePropertiesProps {
  artboards: string[];
  animations: string[];
  stateMachines: string[];
  selectedArtboard: string;
  selectedAnimation: string;
  selectedStateMachine: string;
  onArtboardChange: (value: string) => void;
  onAnimationChange: (value: string) => void;
  onStateMachineChange: (value: string) => void;
  riveInstance: Rive | null;
  onLayoutChange?: (fit: Fit, alignment: Alignment) => void;
  isPlaying: boolean;
}

const FIT_OPTIONS = [
  { label: "Contain", value: "contain", fit: Fit.Contain },
  { label: "Cover", value: "cover", fit: Fit.Cover },
  { label: "Fill", value: "fill", fit: Fit.Fill },
  { label: "Fit Width", value: "fitWidth", fit: Fit.FitWidth },
  { label: "Fit Height", value: "fitHeight", fit: Fit.FitHeight },
  { label: "None", value: "none", fit: Fit.None },
  { label: "Scale Down", value: "scaleDown", fit: Fit.ScaleDown },
] as const;

const ALIGNMENT_OPTIONS = [
  { label: "Center", value: "center", alignment: Alignment.Center },
  { label: "Top Left", value: "topLeft", alignment: Alignment.TopLeft },
  { label: "Top Center", value: "topCenter", alignment: Alignment.TopCenter },
  { label: "Top Right", value: "topRight", alignment: Alignment.TopRight },
  {
    label: "Center Left",
    value: "centerLeft",
    alignment: Alignment.CenterLeft,
  },
  {
    label: "Center Right",
    value: "centerRight",
    alignment: Alignment.CenterRight,
  },
  {
    label: "Bottom Left",
    value: "bottomLeft",
    alignment: Alignment.BottomLeft,
  },
  {
    label: "Bottom Center",
    value: "bottomCenter",
    alignment: Alignment.BottomCenter,
  },
  {
    label: "Bottom Right",
    value: "bottomRight",
    alignment: Alignment.BottomRight,
  },
] as const;

export function RiveProperties({
  artboards,
  animations,
  stateMachines,
  selectedArtboard,
  selectedAnimation,
  selectedStateMachine,
  onArtboardChange,
  onAnimationChange,
  onStateMachineChange,
  riveInstance,
  onLayoutChange,
  isPlaying,
}: RivePropertiesProps) {
  const hasArtboards = artboards.length > 0;
  const hasAnimations = animations.length > 0;
  const hasStateMachines = stateMachines.length > 0;
  const [selectedFit, setSelectedFit] = useState<Fit>(Fit.Contain);
  const [selectedAlignment, setSelectedAlignment] = useState<Alignment>(
    Alignment.Center
  );

  useEffect(() => {
    onLayoutChange?.(selectedFit, selectedAlignment);
  }, []);

  const toggleAnimation = () => {
    if (!riveInstance || !selectedAnimation) return;

    try {
      if (isPlaying) {
        riveInstance.pause(selectedAnimation);
      } else {
        riveInstance.reset({ animations: [selectedAnimation] });
        riveInstance.play(selectedAnimation);
      }
    } catch (err) {
      console.warn("Error toggling animation:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rive File Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {hasArtboards && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label
                  htmlFor="artboard-select"
                  className="block text-sm font-medium mb-2"
                >
                  Artboard:
                </label>
                <Select
                  value={selectedArtboard}
                  onValueChange={onArtboardChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an artboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {artboards.map((artboard) => (
                      <SelectItem key={artboard} value={artboard}>
                        {artboard}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {hasAnimations && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="block text-sm font-medium">Animation:</p>
                    {selectedAnimation && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAnimation}
                        className="h-8 w-8 p-0"
                      >
                        {isPlaying ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {isPlaying ? "Pause" : "Play"} animation
                        </span>
                      </Button>
                    )}
                  </div>
                  <RadioGroup
                    value={selectedAnimation}
                    onValueChange={(value) => {
                      onAnimationChange(value);
                      if (value !== "") {
                        onStateMachineChange("");
                        if (riveInstance) {
                          try {
                            riveInstance.reset({ animations: [value] });
                            riveInstance.play(value);
                          } catch (err) {
                            console.warn("Error playing animation:", err);
                          }
                        }
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="animation-none" />
                      <label
                        htmlFor="animation-none"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        None
                      </label>
                    </div>
                    {animations.map((animation) => (
                      <div
                        key={animation}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={animation}
                          id={`animation-${animation}`}
                        />
                        <label
                          htmlFor={`animation-${animation}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {animation}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <Separator />

              {hasStateMachines && (
                <div className="space-y-2">
                  <p className="block text-sm font-medium mb-2">
                    State Machine:
                  </p>
                  <RadioGroup
                    value={selectedStateMachine}
                    onValueChange={(value) => {
                      onStateMachineChange(value);
                      if (value !== "") {
                        onAnimationChange("");
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="statemachine-none" />
                      <label
                        htmlFor="statemachine-none"
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        None
                      </label>
                    </div>
                    {stateMachines.map((stateMachine) => (
                      <div
                        key={stateMachine}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={stateMachine}
                          id={`statemachine-${stateMachine}`}
                        />
                        <label
                          htmlFor={`statemachine-${stateMachine}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {stateMachine}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium mb-2">
                Fit Mode:
              </label>
              <Select
                value={
                  FIT_OPTIONS.find((opt) => opt.fit === selectedFit)?.value
                }
                onValueChange={(value) => {
                  const option = FIT_OPTIONS.find((opt) => opt.value === value);
                  if (option) {
                    setSelectedFit(option.fit);
                    onLayoutChange?.(option.fit, selectedAlignment);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fit mode" />
                </SelectTrigger>
                <SelectContent>
                  {FIT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium mb-2">
                Alignment:
              </label>
              <Select
                value={
                  ALIGNMENT_OPTIONS.find(
                    (opt) => opt.alignment === selectedAlignment
                  )?.value
                }
                onValueChange={(value) => {
                  const option = ALIGNMENT_OPTIONS.find(
                    (opt) => opt.value === value
                  );
                  if (option) {
                    setSelectedAlignment(option.alignment);
                    onLayoutChange?.(selectedFit, option.alignment);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  {ALIGNMENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedStateMachine && riveInstance && (
        <RiveStateMachineControls
          rive={riveInstance}
          stateMachine={selectedStateMachine}
        />
      )}
    </div>
  );
}
