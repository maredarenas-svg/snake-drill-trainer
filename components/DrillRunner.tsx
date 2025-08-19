import React, { useState, useEffect, useRef } from 'react';
import { DrillCommand, Direction } from '../types';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from './Icons';
import TEGrid from './TEGrid';
import { commandPlayer } from '../services/speech';

interface DrillRunnerProps {
  commands: DrillCommand[];
  commandInterval: number;
  voiceEnabled: boolean;
  ttsManualSpeed: boolean;
  ttsSpeedMultiplier: number;
  maxTAndE: number;
  onFinish: (finalTraverse: number, finalElevation: number) => void;
  onReset: () => void;
}

const CommandDisplay: React.FC<{ command: DrillCommand }> = ({ command }) => {
    const getIcon = () => {
        switch (command.direction) {
            case Direction.Up: return <ArrowUpIcon className="w-8 h-8 mr-3 text-green-400" />;
            case Direction.Down: return <ArrowDownIcon className="w-8 h-8 mr-3 text-red-400" />;
            case Direction.Left: return <ArrowLeftIcon className="w-8 h-8 mr-3 text-blue-400" />;
            case Direction.Right: return <ArrowRightIcon className="w-8 h-8 mr-3 text-yellow-400" />;
        }
    };
    return (
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 flex items-center justify-center min-h-[100px]">
            {getIcon()}
            <span className="text-4xl font-bold tracking-widest text-white">{command.direction} {command.value}</span>
        </div>
    );
};


const DrillRunner: React.FC<DrillRunnerProps> = ({ commands, commandInterval, voiceEnabled, ttsManualSpeed, ttsSpeedMultiplier, maxTAndE, onFinish, onReset }) => {
  const [currentCommandIndex, setCurrentCommandIndex] = useState(0);
  // Use a ref for the logical T&E state to prevent stale closures in timers.
  const tAndERef = useRef({ traverse: 0, elevation: 0 });
  // Use state only for what needs to be rendered.
  const [displayTAndE, setDisplayTAndE] = useState({ traverse: 0, elevation: 0 });

  const currentCommand = commands[currentCommandIndex];

  // Effect for handling speech and command progression.
  // It only depends on the command index and props that don't change during the drill.
  useEffect(() => {
    if (!currentCommand) {
      if (commands.length > 0) {
        // This case can happen if commands are cleared while a drill is running.
        onFinish(tAndERef.current.traverse, tAndERef.current.elevation);
      }
      return;
    }

    if (voiceEnabled) {
      const MIN_SPEECH_INTERVAL_S = 0.1;
      if (commandInterval >= MIN_SPEECH_INTERVAL_S) {
        commandPlayer.play(currentCommand, commandInterval, ttsManualSpeed, ttsSpeedMultiplier);
      } else {
        commandPlayer.stop();
      }
    }

    // Timer to update the grid/display halfway through the interval.
    const gridUpdateTimer = setTimeout(() => {
      let { traverse, elevation } = tAndERef.current;
      const { direction, value } = currentCommand;

      switch (direction) {
        case Direction.Up:    elevation += value; break;
        case Direction.Down:  elevation -= value; break;
        case Direction.Left:  traverse  -= value; break;
        case Direction.Right: traverse  += value; break;
      }
      
      traverse = Math.max(-maxTAndE, Math.min(maxTAndE, traverse));
      elevation = Math.max(-maxTAndE, Math.min(maxTAndE, elevation));
      
      // Update the ref for the next logical step.
      tAndERef.current = { traverse, elevation };
      // Update the state to trigger a re-render for the UI.
      setDisplayTAndE({ traverse, elevation });

    }, (commandInterval * 1000) / 2);

    // Timer to advance to the next command at the end of the interval.
    const nextCommandTimer = setTimeout(() => {
      if (currentCommandIndex >= commands.length - 1) {
        // The drill is over. `tAndERef` has the final, correct values.
        onFinish(tAndERef.current.traverse, tAndERef.current.elevation);
      } else {
        setCurrentCommandIndex(prev => prev + 1);
      }
    }, commandInterval * 1000);

    return () => {
      clearTimeout(gridUpdateTimer);
      clearTimeout(nextCommandTimer);
    };

  }, [currentCommandIndex, commands, commandInterval, onFinish, voiceEnabled, ttsManualSpeed, ttsSpeedMultiplier, currentCommand, maxTAndE]);
  
  // Cleanup effect to stop any speech when the component unmounts
  useEffect(() => {
    return () => commandPlayer.stop();
  }, []);

  const handleStopClick = () => {
    commandPlayer.stop(); // Immediately stop any speech
    onReset(); // Then reset the drill state
  };
  
  const progressPercentage = (currentCommandIndex / commands.length) * 100;

  if (!currentCommand) {
    return (
        <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700 space-y-6 text-center">
            <p className="text-lg text-gray-300">Loading drill...</p>
        </div>
    );
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700 space-y-6">
      <TEGrid traverse={displayTAndE.traverse} elevation={displayTAndE.elevation} maxTAndE={maxTAndE} />
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-400">TRAVERSE (L/R)</p>
          <p className="text-3xl font-bold text-white">{displayTAndE.traverse >= 0 ? `R ${displayTAndE.traverse}`: `L ${Math.abs(displayTAndE.traverse)}`}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">ELEVATION (U/D)</p>
          <p className="text-3xl font-bold text-white">{displayTAndE.elevation >= 0 ? `U ${displayTAndE.elevation}`: `D ${Math.abs(displayTAndE.elevation)}`}</p>
        </div>
      </div>
      
      <div>
        <p className="text-center text-gray-400 mb-2">COMMAND {currentCommandIndex + 1} / {commands.length}</p>
        <CommandDisplay command={currentCommand} />
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }} title={`Drill progress: ${Math.round(progressPercentage)}%`}></div>
      </div>

      <button
        onClick={handleStopClick}
        className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-600 transition-all duration-200 text-lg"
      >
        Stop Drill
      </button>
    </div>
  );
};

export default DrillRunner;