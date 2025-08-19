import React, { useState, useCallback, useEffect } from 'react';
import { DrillState, DrillCommand } from './types';
import DrillConfiguration from './components/DrillConfiguration';
import DrillRunner from './components/DrillRunner';
import DrillResult from './components/DrillResult';
import { generateDrill } from './services/drillGenerator';
import { commandPlayer } from './services/speech';
import { TargetIcon } from './components/Icons';

export interface DrillConfig {
  numCommands: number;
  clickValues: string; // Keep as string to bind directly to input
  commandInterval: number;
  voiceEnabled: boolean;
  ttsSpeedMultiplier: number;
  ttsManualSpeed: boolean;
  maxTAndE: number;
}

const App: React.FC = () => {
  const [drillState, setDrillState] = useState<DrillState>('configuring');
  const [commands, setCommands] = useState<DrillCommand[]>([]);
  const [finalTAndE, setFinalTAndE] = useState<{ traverse: number; elevation: number }>({ traverse: 0, elevation: 0 });
  const [drillConfig, setDrillConfig] = useState<DrillConfig>({
    numCommands: 10,
    clickValues: '5, 10',
    commandInterval: 1,
    voiceEnabled: true,
    ttsSpeedMultiplier: 2,
    ttsManualSpeed: false,
    maxTAndE: 25,
  });

  useEffect(() => {
    // A small trick to "warm up" the speech synthesis engine on some browsers,
    // reducing the delay of the first spoken command in the drill.
    commandPlayer.warmUp();
  }, []);

  const handleConfigChange = useCallback((newConfig: Partial<DrillConfig>) => {
    setDrillConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const handleStartDrill = useCallback(() => {
    const parsedValues = drillConfig.clickValues
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v) && v > 0);

    if (parsedValues.length > 0) {
      if (drillConfig.voiceEnabled) {
        commandPlayer.preload(parsedValues);
      }
      setCommands(generateDrill(drillConfig.numCommands, parsedValues, drillConfig.maxTAndE));
      setDrillState('running');
    }
    // Error handling for invalid clickValues can be done in the configuration component
  }, [drillConfig]);

  const handleFinishDrill = useCallback((finalTraverse: number, finalElevation: number) => {
    setFinalTAndE({ traverse: finalTraverse, elevation: finalElevation });
    setDrillState('finished');
  }, []);

  const handleReset = useCallback(() => {
    commandPlayer.stop();
    setCommands([]);
    setDrillState('configuring');
  }, []);

  const renderContent = () => {
    switch (drillState) {
      case 'running':
        return <DrillRunner 
                  commands={commands} 
                  onFinish={handleFinishDrill} 
                  onReset={handleReset} 
                  commandInterval={drillConfig.commandInterval} 
                  voiceEnabled={drillConfig.voiceEnabled}
                  ttsManualSpeed={drillConfig.ttsManualSpeed}
                  ttsSpeedMultiplier={drillConfig.ttsSpeedMultiplier}
                  maxTAndE={drillConfig.maxTAndE}
                />;
      case 'finished':
        return <DrillResult finalTraverse={finalTAndE.traverse} finalElevation={finalTAndE.elevation} onReset={handleReset} />;
      case 'configuring':
      default:
        return <DrillConfiguration config={drillConfig} onConfigChange={handleConfigChange} onStartDrill={handleStartDrill} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-mono flex flex-col items-center justify-center p-4">
      <header className="w-full max-w-2xl mb-8 text-center">
        <div className="flex items-center justify-center space-x-4">
          <TargetIcon className="h-12 w-12 text-yellow-400" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 tracking-wider">Snake Drill Trainer</h1>
          </div>
        </div>
      </header>
      <main className="w-full max-w-2xl">
        {renderContent()}
      </main>
      <footer className="w-full max-w-2xl mt-8 text-center text-gray-500 text-xs">
        <p>burpees or what</p>
      </footer>
    </div>
  );
};

export default App;