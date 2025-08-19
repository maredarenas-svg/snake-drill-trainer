
export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export interface DrillCommand {
  direction: Direction;
  value: number;
}

export type DrillState = 'configuring' | 'running' | 'finished';
