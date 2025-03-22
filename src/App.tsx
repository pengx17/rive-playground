import { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderIcon, AlertTriangleIcon } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { RivePreview } from "@/components/RivePreview";
import { RiveProperties } from "@/components/RiveProperties";
import { RiveContents, RiveArtboard } from "@/components/RiveWrapper";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  StateMachineInput,
  Rive,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";

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
  const [riveInstance, setRiveInstance] = useState<Rive | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Selection state
  const [selectedArtboard, setSelectedArtboard] = useState("");
  const [selectedAnimation, setSelectedAnimation] = useState("");
  const [selectedStateMachine, setSelectedStateMachine] = useState("");
  const [stateMachineInputs, setStateMachineInputs] = useState<
    Record<string, StateMachineInput>
  >({});

  // Layout state
  const [fit, setFit] = useState<Fit>(Fit.Contain);
  const [alignment, setAlignment] = useState<Alignment>(Alignment.Center);

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

    // Always set state machine to None by default
    setSelectedStateMachine("");
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

  const handleStateChanged = useCallback(
    (inputs: Record<string, StateMachineInput>) => {
      console.log("State machine inputs changed:", inputs);
      setStateMachineInputs(inputs);
    },
    []
  );

  const handleRiveInstance = useCallback((riveObj: Rive) => {
    console.log("Got Rive instance:", riveObj);
    setRiveInstance(riveObj);
  }, []);

  const handleLayoutChange = useCallback(
    (newFit: Fit, newAlignment: Alignment) => {
      setFit(newFit);
      setAlignment(newAlignment);
    },
    []
  );

  const handleBackgroundChange = useCallback((newBackground: string) => {
    // Implementation of handleBackgroundChange
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Rive File Previewer</CardTitle>
          <CardDescription>Upload and preview Rive animations</CardDescription>
        </CardHeader>
      </Card>

      <FileUpload
        onFileSelect={processFile}
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        selectedFile={file}
      />

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
        <BentoGrid>
          <BentoGridItem
            className="md:col-span-4"
            header={
              <div className="flex flex-col h-full">
                <RivePreview
                  riveKey={riveKey}
                  riveFileUrl={riveFileUrl}
                  selectedArtboard={selectedArtboard}
                  selectedAnimation={selectedAnimation || null}
                  selectedStateMachine={selectedStateMachine || null}
                  fit={fit}
                  alignment={alignment}
                  onLoad={handleRiveLoad}
                  onError={handleRiveError}
                  onStateChanged={handleStateChanged}
                  onRiveInit={handleRiveInstance}
                  artboards={artboards}
                  animations={animations}
                  stateMachines={stateMachines}
                  stateMachineInputs={stateMachineInputs}
                  isPlaying={isPlaying}
                  onPlayStateChange={setIsPlaying}
                />
              </div>
            }
          />
          <BentoGridItem
            className="md:col-span-2"
            header={
              <div className="flex flex-col h-full">
                <RiveProperties
                  artboards={artboards}
                  animations={animations}
                  stateMachines={stateMachines}
                  selectedArtboard={selectedArtboard}
                  selectedAnimation={selectedAnimation}
                  selectedStateMachine={selectedStateMachine}
                  onArtboardChange={setSelectedArtboard}
                  onAnimationChange={setSelectedAnimation}
                  onStateMachineChange={setSelectedStateMachine}
                  riveInstance={riveInstance}
                  onLayoutChange={handleLayoutChange}
                  onBackgroundChange={handleBackgroundChange}
                  isPlaying={isPlaying}
                />
              </div>
            }
          />
        </BentoGrid>
      )}
    </div>
  );
}

export default App;
