import { useState, useRef, useEffect, useCallback } from "react";
import { useRive, EventType } from "@rive-app/react-canvas";

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
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    artboard,
  });

  // Handle animation changes without remounting
  useEffect(() => {
    if (!rive || !rive.contents) return;

    console.log("Animation changed to:", animation);

    // If we have an animation, play it
    if (animation) {
      try {
        console.log("Attempting to play animation:", animation);

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
        console.log("Activating state machine:", stateMachine);

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

  // Handle artboard changes
  useEffect(() => {
    if (!rive || !artboard) return;

    // The artboard is already set via the useRive hook
    console.log("Current artboard:", artboard);
  }, [rive, artboard]);

  // Handle file loading
  useEffect(() => {
    if (!rive) return;

    const handleLoad = () => {
      try {
        console.log("Rive file loaded:", rive.contents);
        const contents = rive.contents as RiveContents | undefined;
        if (contents?.artboards) {
          onLoad(contents);
        }
      } catch (err) {
        console.error("Error processing Rive file:", err);
        onError();
      }
    };

    // Try to process immediately if content is already available
    if (rive.contents) {
      handleLoad();
    }

    // Register event listener for Load event
    rive.on(EventType.Load, handleLoad);

    return () => {
      rive.off(EventType.Load, handleLoad);
    };
  }, [rive, onLoad, onError]);

  return <RiveComponent className="w-full h-full" />;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [riveFileUrl, setRiveFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtboard, setSelectedArtboard] = useState<string>("");
  const [selectedAnimation, setSelectedAnimation] = useState<string>("");
  const [selectedStateMachine, setSelectedStateMachine] = useState<string>("");
  const [artboards, setArtboards] = useState<string[]>([]);
  const [animations, setAnimations] = useState<string[]>([]);
  const [stateMachines, setStateMachines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [riveContents, setRiveContents] = useState<RiveContents | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle when Rive file is loaded
  const handleRiveLoad = useCallback((contents: RiveContents) => {
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
        updateAnimationsAndStateMachines(firstArtboard);
      }
    }
  }, []);

  // Handle Rive loading error
  const handleRiveError = useCallback(() => {
    setIsLoading(false);
    setError(
      "Failed to load Rive file. Please make sure it is a valid .riv file."
    );
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setFile(selectedFile);
    setRiveContents(null);

    // Reset selections
    setSelectedArtboard("");
    setSelectedAnimation("");
    setSelectedStateMachine("");
    setArtboards([]);
    setAnimations([]);
    setStateMachines([]);

    // Clean up previous URL if exists
    if (riveFileUrl) {
      URL.revokeObjectURL(riveFileUrl);
    }

    // Create a URL for the file
    const fileUrl = URL.createObjectURL(selectedFile);
    setRiveFileUrl(fileUrl);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Update animations and state machines when artboard changes
  const handleArtboardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const artboardName = e.target.value;
    setSelectedArtboard(artboardName);

    if (!riveContents) return;

    try {
      const artboard = riveContents.artboards.find(
        (artboard: RiveArtboard) => artboard.name === artboardName
      );

      if (artboard) {
        updateAnimationsAndStateMachines(artboard);
      }
    } catch (err) {
      console.error("Error changing artboard:", err);
    }
  };

  const handleAnimationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const animationName = e.target.value;
    console.log("Animation changed to:", animationName);
    setSelectedAnimation(animationName);
  };

  const handleStateMachineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stateMachineName = e.target.value;
    setSelectedStateMachine(stateMachineName);
  };

  const updateAnimationsAndStateMachines = (artboard: RiveArtboard) => {
    // Extract animations
    const animationsList = artboard.animations || [];
    setAnimations(animationsList);

    // Set the default animation
    if (animationsList.length > 0) {
      setSelectedAnimation(animationsList[0]);
    } else {
      setSelectedAnimation("");
    }

    // Extract state machines
    const stateMachinesList =
      artboard.stateMachines?.map((sm) => sm.name) || [];
    setStateMachines(stateMachinesList);

    // Set the default state machine
    if (stateMachinesList.length > 0) {
      setSelectedStateMachine(stateMachinesList[0]);
    } else {
      setSelectedStateMachine("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Rive File Previewer
      </h1>

      <div className="flex items-center mb-6 space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".riv"
          onChange={handleFileChange}
          className="hidden"
          id="rive-file-input"
        />
        <button
          onClick={triggerFileInput}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Choose Rive File
        </button>
        {file && (
          <span className="text-gray-700 ml-2 truncate max-w-xs">
            {file.name}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-md mb-6">
          Loading Rive file...
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {riveFileUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Preview
            </h2>
            <div className="bg-gray-100 rounded-md h-[400px] flex items-center justify-center overflow-hidden">
              <RiveWrapper
                key={riveFileUrl}
                src={riveFileUrl}
                artboard={selectedArtboard}
                animation={selectedAnimation || null}
                stateMachine={selectedStateMachine || null}
                onLoad={handleRiveLoad}
                onError={handleRiveError}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              Rive File Properties
            </h2>

            {artboards.length > 0 && (
              <div className="space-y-6 mb-6">
                <div className="space-y-1">
                  <label
                    htmlFor="artboard-select"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Artboard:
                  </label>
                  <select
                    id="artboard-select"
                    value={selectedArtboard}
                    onChange={handleArtboardChange}
                    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {artboards.map((artboard) => (
                      <option key={artboard} value={artboard}>
                        {artboard}
                      </option>
                    ))}
                  </select>
                </div>

                {animations.length > 0 && (
                  <div className="space-y-2">
                    <p className="block text-sm font-medium text-gray-700 mb-1">
                      Animation:
                    </p>
                    <div className="space-y-2 pl-2">
                      <div className="flex items-center">
                        <input
                          id="animation-none"
                          type="radio"
                          name="animation"
                          value=""
                          checked={selectedAnimation === ""}
                          onChange={handleAnimationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="animation-none"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          None
                        </label>
                      </div>
                      {animations.map((animation) => (
                        <div key={animation} className="flex items-center">
                          <input
                            id={`animation-${animation}`}
                            type="radio"
                            name="animation"
                            value={animation}
                            checked={selectedAnimation === animation}
                            onChange={handleAnimationChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor={`animation-${animation}`}
                            className="ml-2 block text-sm text-gray-700"
                          >
                            {animation}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stateMachines.length > 0 && (
                  <div className="space-y-2">
                    <p className="block text-sm font-medium text-gray-700 mb-1">
                      State Machine:
                    </p>
                    <div className="space-y-2 pl-2">
                      <div className="flex items-center">
                        <input
                          id="statemachine-none"
                          type="radio"
                          name="statemachine"
                          value=""
                          checked={selectedStateMachine === ""}
                          onChange={handleStateMachineChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label
                          htmlFor="statemachine-none"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          None
                        </label>
                      </div>
                      {stateMachines.map((stateMachine) => (
                        <div key={stateMachine} className="flex items-center">
                          <input
                            id={`statemachine-${stateMachine}`}
                            type="radio"
                            name="statemachine"
                            value={stateMachine}
                            checked={selectedStateMachine === stateMachine}
                            onChange={handleStateMachineChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label
                            htmlFor={`statemachine-${stateMachine}`}
                            className="ml-2 block text-sm text-gray-700"
                          >
                            {stateMachine}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2">File Structure</h3>
              <ul className="text-sm space-y-4">
                <li>
                  <strong className="text-gray-700">
                    Artboards ({artboards.length}):
                  </strong>
                  <ul className="mt-1 ml-5 space-y-1 list-disc text-gray-600">
                    {artboards.map((artboard) => (
                      <li key={artboard}>{artboard}</li>
                    ))}
                  </ul>
                </li>
                {selectedArtboard && (
                  <>
                    <li>
                      <strong className="text-gray-700">
                        Animations ({animations.length}):
                      </strong>
                      <ul className="mt-1 ml-5 space-y-1 list-disc text-gray-600">
                        {animations.map((animation) => (
                          <li key={animation}>{animation}</li>
                        ))}
                      </ul>
                    </li>
                    <li>
                      <strong className="text-gray-700">
                        State Machines ({stateMachines.length}):
                      </strong>
                      <ul className="mt-1 ml-5 space-y-1 list-disc text-gray-600">
                        {stateMachines.map((stateMachine) => (
                          <li key={stateMachine}>{stateMachine}</li>
                        ))}
                      </ul>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
