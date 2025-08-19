
import React from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons';

interface DrillResultProps {
  finalTraverse: number;
  finalElevation: number;
  onReset: () => void;
}

const DrillResult: React.FC<DrillResultProps> = ({ finalTraverse, finalElevation, onReset }) => {
  const isSuccess = finalTraverse === 0 && finalElevation === 0;

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700 text-center">
      {isSuccess ? (
        <>
          <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-green-400 mb-2">MISSION SUCCESS</h3>
          <p className="text-gray-300">Your T&E settings have returned to zero. Well done.</p>
        </>
      ) : (
        <>
          <XCircleIcon className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-red-400 mb-2">MISSION FAILURE</h3>
          <p className="text-gray-300">Your final T&E settings were not zero. Practice makes perfect.</p>
        </>
      )}

      <div className="mt-6 bg-gray-900 p-4 rounded-md">
        <h4 className="text-lg font-semibold text-gray-400">Final Settings</h4>
        <div className="flex justify-around mt-2">
            <p className="text-xl text-white">Traverse: <span className={finalTraverse === 0 ? 'text-green-400' : 'text-red-400'}>{finalTraverse}</span></p>
            <p className="text-xl text-white">Elevation: <span className={finalElevation === 0 ? 'text-green-400' : 'text-red-400'}>{finalElevation}</span></p>
        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-8 w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500 transition-all duration-200 text-lg"
      >
        Run New Drill
      </button>
    </div>
  );
};

export default DrillResult;
