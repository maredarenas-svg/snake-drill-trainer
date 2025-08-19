import React, { useState } from 'react';
import type { DrillConfig } from '../App';
import { commandPlayer } from '../services/speech';

interface DrillConfigurationProps {
  config: DrillConfig;
  onConfigChange: (newConfig: Partial<DrillConfig>) => void;
  onStartDrill: () => void;
}

const DrillConfiguration: React.FC<DrillConfigurationProps> = ({ config, onConfigChange, onStartDrill }) => {
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedValues = config.clickValues
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v) && v > 0);

    if (parsedValues.length === 0) {
      setError('Please enter at least one valid, positive number for click values.');
      return;
    }
    
    if (config.numCommands < 2) {
      setError('Number of commands must be at least 2.');
      return;
    }

    if (config.maxTAndE < 5) {
      setError('Max T&E must be at least 5.');
      return;
    }
    
    if (parsedValues.some(v => v > config.maxTAndE)) {
      setError('Click values cannot be greater than the Max T&E.');
      return;
    }

    if (config.commandInterval <= 0) {
      setError('Command interval must be a positive number.');
      return;
    }

    onStartDrill();
  };
  
  const displayedSpeed = config.ttsManualSpeed
    ? config.ttsSpeedMultiplier
    : commandPlayer.calculateAutoSpeed(config.commandInterval);


  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700">
      <h3 className="text-2xl font-bold text-center mb-6 text-gray-200">Drill Setup</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="numCommands" className="block text-sm font-medium text-gray-400 mb-2">Number of Commands</label>
          <input
            id="numCommands"
            type="number"
            value={config.numCommands}
            onChange={(e) => onConfigChange({ numCommands: parseInt(e.target.value, 10) || 0 })}
            min="2"
            max="100"
            step="2"
            className="w-full bg-gray-900 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            aria-describedby="numCommands-help"
          />
          <p id="numCommands-help" className="text-xs text-gray-500 mt-1">Total commands in the drill (min 2, even numbers recommended).</p>
        </div>
        <div>
          <label htmlFor="maxTAndE" className="block text-sm font-medium text-gray-400 mb-2">Max Traverse/Elevation</label>
          <input
            id="maxTAndE"
            type="number"
            value={config.maxTAndE}
            onChange={(e) => onConfigChange({ maxTAndE: parseInt(e.target.value, 10) || 0 })}
            min="5"
            max="100"
            step="1"
            className="w-full bg-gray-900 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            aria-describedby="maxTAndE-help"
          />
          <p id="maxTAndE-help" className="text-xs text-gray-500 mt-1">The maximum clicks for Traverse and Elevation (default 25).</p>
        </div>
        <div>
          <label htmlFor="clickValues" className="block text-sm font-medium text-gray-400 mb-2">Possible Click Values</label>
          <input
            id="clickValues"
            type="text"
            value={config.clickValues}
            onChange={(e) => onConfigChange({ clickValues: e.target.value })}
            placeholder="e.g., 5, 10, 15"
            className="w-full bg-gray-900 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            aria-describedby="clickValues-help"
          />
          <p id="clickValues-help" className="text-xs text-gray-500 mt-1">Comma-separated list of possible click values.</p>
        </div>
        <div>
          <label htmlFor="commandInterval" className="block text-sm font-medium text-gray-400 mb-2">Command Interval (seconds)</label>
          <input
            id="commandInterval"
            type="number"
            value={config.commandInterval}
            onChange={(e) => onConfigChange({ commandInterval: parseFloat(e.target.value) || 0 })}
            min="0.1"
            step="0.1"
            className="w-full bg-gray-900 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
            aria-describedby="commandInterval-help"
          />
           <p id="commandInterval-help" className="text-xs text-gray-500 mt-1">Time between each command (must be a positive number).</p>
        </div>

        <fieldset className="space-y-4 rounded-md border border-gray-700 p-4">
            <legend className="text-sm font-medium text-gray-400 px-2">Voice Options</legend>
            <div className="flex items-center justify-start space-x-3">
            <input
                id="voiceEnabled"
                type="checkbox"
                checked={config.voiceEnabled}
                onChange={(e) => onConfigChange({ voiceEnabled: e.target.checked })}
                className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-yellow-500 focus:ring-yellow-400"
            />
            <label htmlFor="voiceEnabled" className="text-sm font-medium text-gray-400">Enable Voice Commands</label>
            </div>
            {config.voiceEnabled && (
            <>
                <div>
                <label htmlFor="ttsSpeedMultiplier" className="block text-sm font-medium text-gray-400 mb-2">TTS Speed</label>
                <input
                    id="ttsSpeedMultiplier"
                    type="number"
                    value={displayedSpeed.toFixed(1)}
                    onChange={(e) => onConfigChange({ ttsSpeedMultiplier: parseFloat(e.target.value) || 1 })}
                    min="0.5"
                    max="10"
                    step="0.1"
                    className={`w-full bg-gray-900 text-white p-3 rounded-md border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-opacity ${!config.ttsManualSpeed ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-describedby="ttsSpeedMultiplier-help"
                    disabled={!config.ttsManualSpeed}
                    readOnly={!config.ttsManualSpeed}
                />
                <p id="ttsSpeedMultiplier-help" className="text-xs text-gray-500 mt-1">
                    {config.ttsManualSpeed ? 'Set manual speech rate (2 is default).' : 'Speed is calculated automatically based on interval.'}
                </p>
                </div>
                <div className="flex items-center justify-start space-x-3">
                <input
                    id="ttsManualSpeed"
                    type="checkbox"
                    checked={config.ttsManualSpeed}
                    onChange={(e) => onConfigChange({ ttsManualSpeed: e.target.checked })}
                    className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-yellow-500 focus:ring-yellow-400"
                />
                <label htmlFor="ttsManualSpeed" className="text-sm font-medium text-gray-400">Manual Speed Override</label>
                </div>
            </>
            )}
        </fieldset>

        {error && <p className="text-red-400 text-sm text-center" role="alert">{error}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-all duration-200 text-lg"
        >
          Start Drill
        </button>
      </form>
    </div>
  );
};

export default DrillConfiguration;