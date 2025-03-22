import { useRef, useEffect } from "react";
import {
  useRive,
  EventType,
  Layout,
  Fit,
  Alignment,
  StateMachineInput,
  Rive,
} from "@rive-app/react-canvas";

// Define types for Rive content structure
export interface RiveStateMachineInfo {
  name: string;
  inputs: StateMachineInput[];
}

export interface RiveArtboard {
  name: string;
  animations: string[];
  stateMachines: RiveStateMachineInfo[];
}

export interface RiveContents {
  artboards: RiveArtboard[];
}

interface RiveWrapperProps {
  src: string;
  artboard?: string;
  animation?: string | null;
  stateMachine?: string | null;
  onLoad: (contents: RiveContents) => void;
  onError: () => void;
  onStateChanged?: (inputs: Record<string, StateMachineInput>) => void;
  onRiveInit?: (riveObj: Rive) => void;
  fit?: Fit;
  alignment?: Alignment;
}

export function RiveWrapper({
  src,
  artboard,
  animation,
  stateMachine,
  onLoad,
  onError,
  onStateChanged,
  onRiveInit,
  fit = Fit.Contain,
  alignment = Alignment.Center,
}: RiveWrapperProps) {
  const contentLoadedRef = useRef(false);
  const riveRef = useRef<Rive | null>(null);
  const layoutRef = useRef(new Layout({ fit, alignment }));

  // Update layout when fit or alignment changes
  useEffect(() => {
    layoutRef.current = new Layout({ fit, alignment });
    if (riveRef.current) {
      riveRef.current.layout = layoutRef.current;
    }
  }, [fit, alignment]);

  const { rive, RiveComponent } = useRive({
    src,
    autoplay: true,
    artboard,
    layout: layoutRef.current,
  });

  // Keep track of the rive instance
  useEffect(() => {
    if (rive) {
      riveRef.current = rive;

      // Notify parent about the Rive instance as soon as it's available
      if (onRiveInit) {
        console.log("DEBUG RiveWrapper: Calling onRiveInit with rive instance");
        onRiveInit(rive);
      }
    }
  }, [rive, onRiveInit]);

  // Handle animation changes without remounting
  useEffect(() => {
    if (!rive || !rive.contents) return;

    // If we have an animation, play it
    if (animation) {
      try {
        // Stop any current animations
        rive.stop();

        // Reset and reinitialize state machine if one is active
        if (stateMachine) {
          try {
            // First, stop the state machine
            if (typeof rive.play === "function") {
              rive.play(stateMachine);
            }

            // Get the state machine instance
            const sm = rive.stateMachineInputs(stateMachine);
            if (sm) {
              // Reset all boolean inputs to false
              Object.values(sm).forEach((input) => {
                if (input && typeof input.value === "boolean") {
                  input.value = false;
                }
              });

              // Reinitialize the state machine inputs
              if (onStateChanged) {
                const inputsObj = Array.isArray(sm)
                  ? sm.reduce(
                      (acc, input) => {
                        const name =
                          input.name ||
                          `input_${Math.random().toString(36).slice(2, 7)}`;
                        acc[name] = input;
                        return acc;
                      },
                      {} as Record<string, StateMachineInput>
                    )
                  : (sm as Record<string, StateMachineInput>);

                onStateChanged(inputsObj);
              }
            }
          } catch (err) {
            console.warn("Error resetting state machine:", err);
          }
        }

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
  }, [rive, animation, stateMachine, onStateChanged]);

  // Handle state machine changes
  useEffect(() => {
    if (!rive || !rive.contents) return;

    // If we have a state machine, activate it
    if (stateMachine) {
      try {
        console.log("Attempting to initialize state machine:", stateMachine);

        // Start the state machine - this is required for some Rive implementations
        if (typeof rive.play === "function") {
          rive.play(stateMachine);
          console.log("Started state machine:", stateMachine);
        }

        // Get the state machine instance
        const sm = rive.stateMachineInputs(stateMachine);
        if (sm) {
          // State machine is already activated by the Rive runtime
          console.log("State machine inputs:", sm);
          console.log(
            "State machine inputs type:",
            typeof sm,
            Array.isArray(sm)
          );

          // Provide the inputs to the parent for UI controls
          if (onStateChanged && sm) {
            // Convert array to object if needed
            const inputsObj = Array.isArray(sm)
              ? sm.reduce(
                  (acc, input) => {
                    const name =
                      input.name ||
                      `input_${Math.random().toString(36).slice(2, 7)}`;
                    acc[name] = input;
                    return acc;
                  },
                  {} as Record<string, StateMachineInput>
                )
              : (sm as Record<string, StateMachineInput>);

            onStateChanged(inputsObj);
          }
        }
      } catch (err) {
        console.error("Error activating state machine:", err);
      }
    }
  }, [rive, stateMachine, onStateChanged]);

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
