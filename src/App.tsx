import { useRef, useEffect, useState, useCallback } from "react";
import {
  useRive,
  EventType,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileIcon, LoaderIcon, AlertTriangleIcon } from "lucide-react";
import { AsciiStructure } from "@/components/AsciiStructure";

// Define types for Rive content structure
interface RiveInput {
  name: string;
  type: number;
}

interface RiveStateMachineInfo {
  name: string;
  inputs: RiveInput[];
}

interface RiveArtboard {
  name: string;
  animations: string[];
  stateMachines: RiveStateMachineInfo[];
}

interface RiveContents {
  artboards: RiveArtboard[];
}

// RiveWrapper component to isolate the useRive hook
interface RiveWrapperProps {
  src: string;
  artboard?: string;
  animation?: string | null;
  stateMachine?: string | null;
  onLoad: (contents: RiveContents) => void;
  onError: () => void;
}

function RiveWrapper({
  src,
  artboard,
  animation,
  stateMachine,
  onLoad,
  onError,
}: RiveWrapperProps) {
  const contentLoadedRef = useRef(false);

  // Create a layout object for proper sizing and alignment
  const layout = new Layout({
    fit: Fit.Contain,
    alignment: Alignment.Center,
  });

  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    artboard,
    layout,
  });

  // Handle animation changes without remounting
  useEffect(() => {
    if (!rive || !rive.contents) return;

    // If we have an animation, play it
    if (animation) {
      try {
        // Stop any current animations
        rive.stop();

        // Play the new animation
        setTimeout(() => {
          if (rive) {
            rive.play(animation);
          }
        }, 50);
      } catch (err) {
        console.error("Error playing animation:", err);
      }
    }
  }, [rive, animation]);

  // Handle state machine changes
  useEffect(() => {
    if (!rive || !rive.contents) return;

    // If we have a state machine, activate it
    if (stateMachine) {
      try {
        // Get the state machine instance
        const sm = rive.stateMachineInputs(stateMachine);
        if (sm) {
          // State machine is already activated by the Rive runtime
          console.log("State machine inputs:", sm);
        }
      } catch (err) {
        console.error("Error activating state machine:", err);
      }
    }
  }, [rive, stateMachine]);

  // Handle file loading - this is a one-time operation on initial load
  useEffect(() => {
    // Reset the ref whenever we get a new src (key prop handles component remounting)
    contentLoadedRef.current = false;

    if (!rive) return;

    const processContent = () => {
      // Check if we've already processed this file
      if (contentLoadedRef.current) return;

      try {
        const contents = rive.contents as RiveContents | undefined;
        if (contents?.artboards) {
          // Set flag to prevent multiple processing
          contentLoadedRef.current = true;
          onLoad(contents);
        }
      } catch (err) {
        console.error("Error processing Rive file:", err);
        onError();
      }
    };

    // Try to process content if it's already available
    if (rive.contents) {
      processContent();
    }

    // One-time event listener for load event
    const handleRiveLoad = () => {
      processContent();
    };

    // Add event listener
    rive.on(EventType.Load, handleRiveLoad);

    // Cleanup
    return () => {
      rive.off(EventType.Load, handleRiveLoad);
    };
  }, [rive, onLoad, onError, src]);

  return (
    <div className="w-full h-full rounded-md overflow-hidden">
      <div className="w-full h-full relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-gray-100"></div>
        <div className="absolute inset-0 bg-grid-slate-200 opacity-70"></div>
        <div className="absolute inset-0 bg-dot-slate-300 opacity-60"></div>
        <div className="relative w-full h-full flex items-center justify-center z-10">
          <RiveComponent className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

function App() {
  // File-related state
  const [file, setFile] = useState<File | null>(null);
  const [riveFileUrl, setRiveFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riveKey, setRiveKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Rive content state
  const [riveContents, setRiveContents] = useState<RiveContents | null>(null);
  const [artboards, setArtboards] = useState<string[]>([]);
  const [animations, setAnimations] = useState<string[]>([]);
  const [stateMachines, setStateMachines] = useState<string[]>([]);

  // Selection state
  const [selectedArtboard, setSelectedArtboard] = useState("");
  const [selectedAnimation, setSelectedAnimation] = useState("");
  const [selectedStateMachine, setSelectedStateMachine] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const resetSelections = useCallback(() => {
    setSelectedArtboard("");
    setSelectedAnimation("");
    setSelectedStateMachine("");
    setArtboards([]);
    setAnimations([]);
    setStateMachines([]);
  }, []);

  const processArtboard = useCallback((artboard: RiveArtboard) => {
    const animationsList = artboard.animations || [];
    const stateMachinesList =
      artboard.stateMachines?.map((sm) => sm.name) || [];

    setAnimations(animationsList);
    setStateMachines(stateMachinesList);

    if (animationsList.length > 0) {
      setSelectedAnimation(animationsList[0]);
    } else {
      setSelectedAnimation("");
    }

    if (stateMachinesList.length > 0) {
      setSelectedStateMachine(stateMachinesList[0]);
    } else {
      setSelectedStateMachine("");
    }
  }, []);

  const processFile = useCallback(
    (selectedFile: File) => {
      setIsLoading(true);
      setError(null);
      setFile(selectedFile);
      setRiveContents(null);
      resetSelections();

      // Clean up previous URL if exists
      if (riveFileUrl) {
        URL.revokeObjectURL(riveFileUrl);
      }

      // Create a URL for the file
      const fileUrl = URL.createObjectURL(selectedFile);
      setRiveFileUrl(fileUrl);

      // Increment key to force remount of Rive component
      setRiveKey((prevKey) => prevKey + 1);
    },
    [riveFileUrl, resetSelections]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;
      processFile(selectedFile);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = e.dataTransfer.files;
      if (!droppedFiles || droppedFiles.length === 0) return;

      const fileItem = droppedFiles[0];
      // Check if it's a .riv file
      if (fileItem.name.endsWith(".riv")) {
        processFile(fileItem);
      } else {
        setError("Please drop a valid .riv file");
      }
    },
    [processFile]
  );

  const handleRiveLoad = useCallback(
    (contents: RiveContents) => {
      setIsLoading(false);
      setRiveContents(contents);

      // Process the artboards
      const artboardsList = contents.artboards.map(
        (artboard: RiveArtboard) => artboard.name
      );

      setArtboards(artboardsList);

      // Set the default artboard
      if (artboardsList.length > 0) {
        setSelectedArtboard(artboardsList[0]);

        // Get animations and state machines for the first artboard
        const firstArtboard = contents.artboards.find(
          (artboard: RiveArtboard) => artboard.name === artboardsList[0]
        );

        if (firstArtboard) {
          processArtboard(firstArtboard);
        }
      }
    },
    [processArtboard]
  );

  const handleRiveError = useCallback(() => {
    setIsLoading(false);
    setError(
      "Failed to load Rive file. Please make sure it is a valid .riv file."
    );
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Add effect to handle artboard change
  useEffect(() => {
    if (!riveContents || !selectedArtboard) return;

    try {
      const artboard = riveContents.artboards.find(
        (artboard: RiveArtboard) => artboard.name === selectedArtboard
      );

      if (artboard) {
        processArtboard(artboard);
      }
    } catch (err) {
      console.error("Error changing artboard:", err);
    }
  }, [riveContents, selectedArtboard, processArtboard]);

  // Derived values
  const hasArtboards = artboards.length > 0;
  const hasAnimations = animations.length > 0;
  const hasStateMachines = stateMachines.length > 0;

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Rive File Previewer</CardTitle>
          <CardDescription>Upload and preview Rive animations</CardDescription>
        </CardHeader>
      </Card>

      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex flex-col items-center justify-center mb-6 p-8 border-2 border-dashed 
          rounded-lg transition-colors duration-200
          ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".riv"
          onChange={handleFileChange}
          className="hidden"
          id="rive-file-input"
        />
        <div className="text-center mb-4">
          <FileIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <h3 className="font-medium text-lg">Drop your Rive file here</h3>
          <p className="text-sm text-gray-500">or</p>
        </div>
        <Button onClick={triggerFileInput} variant="default">
          <FileIcon className="mr-2 h-4 w-4" />
          Choose Rive File
        </Button>
        {file && (
          <p className="mt-4 text-sm">
            Selected: <span className="font-medium">{file.name}</span>
          </p>
        )}
      </div>

      {isLoading && (
        <Alert variant="default" className="mb-6">
          <LoaderIcon className="h-4 w-4 animate-spin" />
          <AlertTitle>Loading</AlertTitle>
          <AlertDescription>Loading Rive file...</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {riveFileUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md h-[400px] flex items-center justify-center overflow-hidden bg-neutral-50">
                  <RiveWrapper
                    key={riveKey}
                    src={riveFileUrl}
                    artboard={selectedArtboard}
                    animation={selectedAnimation || null}
                    stateMachine={selectedStateMachine || null}
                    onLoad={handleRiveLoad}
                    onError={handleRiveError}
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
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Rive File Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {hasArtboards && (
                  <div className="space-y-6 mb-6">
                    <div className="space-y-1">
                      <label
                        htmlFor="artboard-select"
                        className="block text-sm font-medium mb-2"
                      >
                        Artboard:
                      </label>
                      <Select
                        value={selectedArtboard}
                        onValueChange={setSelectedArtboard}
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
                        <p className="block text-sm font-medium mb-2">
                          Animation:
                        </p>
                        <RadioGroup
                          value={selectedAnimation}
                          onValueChange={setSelectedAnimation}
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
                          onValueChange={setSelectedStateMachine}
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
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
