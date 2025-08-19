import { DrillCommand, Direction } from '../types';

/**
 * Checks if a given command is valid from the current T&E state.
 * @param command The command to validate.
 * @param currentTraverse The current simulated traverse value.
 * @param currentElevation The current simulated elevation value.
 * @param maxTAndE The maximum allowed value for traverse and elevation.
 * @returns True if the move is valid, false otherwise.
 */
const isMoveValid = (
  command: DrillCommand,
  currentTraverse: number,
  currentElevation: number,
  maxTAndE: number
): boolean => {
  const { direction, value } = command;
  switch (direction) {
    case Direction.Up:
      return currentElevation + value <= maxTAndE;
    case Direction.Down:
      return currentElevation - value >= -maxTAndE;
    case Direction.Left:
      return currentTraverse - value >= -maxTAndE;
    case Direction.Right:
      return currentTraverse + value <= maxTAndE;
    default:
      return false;
  }
};

export const generateDrill = (numCommands: number, clickValues: number[], maxTAndE: number): DrillCommand[] => {
  if (clickValues.length === 0 || clickValues.some(v => v > maxTAndE)) {
    // Also check if any click values are impossible from the start.
    return [];
  }

  // We might need to retry if a random sequence gets stuck, so we wrap in a loop.
  const MAX_GENERATION_ATTEMPTS = 10;
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const totalCommands = numCommands % 2 === 0 ? numCommands : numCommands + 1;
    const halfCommands = totalCommands / 2;
    const positiveCommands: DrillCommand[] = [];

    // 1. Generate one half of the drill with "positive" movements (UP/RIGHT)
    for (let i = 0; i < halfCommands; i++) {
      const value = clickValues[Math.floor(Math.random() * clickValues.length)];
      const isHorizontal = Math.random() > 0.5;
      positiveCommands.push({ direction: isHorizontal ? Direction.Right : Direction.Up, value });
    }

    // 2. Create the exact opposite commands to ensure the drill is balanced
    const negativeCommands: DrillCommand[] = positiveCommands.map(command => ({
      direction: command.direction === Direction.Right ? Direction.Left : Direction.Down,
      value: command.value,
    }));

    let availableCommands = [...positiveCommands, ...negativeCommands];
    const finalDrill: DrillCommand[] = [];
    let simTraverse = 0;
    let simElevation = 0;

    // 3. Iteratively build the drill by picking valid moves
    while (availableCommands.length > 0) {
      const validMoveIndices = availableCommands
        .map((_, index) => index)
        .filter(index => isMoveValid(availableCommands[index], simTraverse, simElevation, maxTAndE));

      if (validMoveIndices.length === 0) {
        // This random sequence is stuck. Break and let the outer loop try again.
        break;
      }

      // Pick a random valid move from the list of possible moves
      const randomValidIndex = validMoveIndices[Math.floor(Math.random() * validMoveIndices.length)];
      
      // Remove the chosen command from the pool and add it to the final drill
      const [chosenCommand] = availableCommands.splice(randomValidIndex, 1);
      finalDrill.push(chosenCommand);

      // Update the simulated state
      switch (chosenCommand.direction) {
        case Direction.Up:    simElevation += chosenCommand.value; break;
        case Direction.Down:  simElevation -= chosenCommand.value; break;
        case Direction.Left:  simTraverse  -= chosenCommand.value; break;
        case Direction.Right: simTraverse  += chosenCommand.value; break;
      }
    }

    if (finalDrill.length === totalCommands) {
      return finalDrill; // Success!
    }
  }
  
  // If all attempts fail, log an error and return an empty array.
  console.error(`Failed to generate a valid drill after ${MAX_GENERATION_ATTEMPTS} attempts. Please try different settings.`);
  return [];
};