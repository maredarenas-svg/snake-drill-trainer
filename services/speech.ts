
import { DrillCommand, Direction } from '../types';

/**
 * Creates a unique string key for a given command object.
 * @param command - The command to generate a key for.
 * @returns A unique string identifier.
 */
const commandToKey = (command: { direction: Direction; value: number }) => `${command.direction}_${command.value}`;

/**
 * Manages the pre-loading, caching, and playback of speech synthesis commands.
 * This approach creates and caches all possible `SpeechSynthesisUtterance` objects
 * before a drill starts, which significantly reduces the latency of playing
 * a command compared to creating it on-the-fly. This is the key to ensuring
 * audio can keep up with rapid-fire command intervals.
 */
class CommandPlayer {
  private isSupported: boolean = false;
  private utteranceCache = new Map<string, SpeechSynthesisUtterance>();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.isSupported = true;
      window.addEventListener('beforeunload', () => this.stop());
    }
  }

  /**
   * Warms up the TTS engine by speaking a silent utterance. On some browsers,
   * this can reduce the latency of the first "real" command.
   */
  public warmUp(): void {
    if (!this.isSupported) return;
    const utterance = new SpeechSynthesisUtterance(' ');
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Creates and caches SpeechSynthesisUtterance objects for all possible
   * command combinations based on the provided click values.
   * @param clickValues - An array of numbers for command values.
   */
  public preload(clickValues: number[]): void {
    if (!this.isSupported) return;
    this.utteranceCache.clear();
    const directions: Direction[] = [Direction.Up, Direction.Down, Direction.Left, Direction.Right];
    
    for (const value of clickValues) {
      for (const direction of directions) {
        const key = commandToKey({ direction, value });
        const text = `${direction} ${value}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1;
        utterance.volume = 1;
        this.utteranceCache.set(key, utterance);
      }
    }
  }

  /**
   * Calculates the automatic speech rate based on a fixed formula.
   * @param interval - The command interval in seconds.
   * @returns The calculated speech rate.
   */
  public calculateAutoSpeed(interval: number): number {
    const baseSpeed = 2.0;
    if (interval >= 1.0) {
      return baseSpeed;
    }
    // Calculate the number of 0.1s steps the interval is below 1.0s
    const intervalDifference = 1.0 - interval;
    // Use Math.round to avoid floating point inaccuracies with the division
    const steps = Math.round(intervalDifference * 10); 
    const speedIncrease = steps * 0.3;
    return baseSpeed + speedIncrease;
  }

  /**
   * Plays a pre-loaded command, dynamically adjusting its speech rate based on user settings.
   * @param command - The drill command to speak.
   * @param interval - The time in seconds the speech must fit within.
   * @param manualSpeed - Whether to use a manual speed override.
   * @param speedMultiplier - The value for manual speed or the multiplier for automatic speed.
   */
  public play(command: DrillCommand, interval: number, manualSpeed: boolean, speedMultiplier: number): void {
    if (!this.isSupported) return;

    const key = commandToKey(command);
    const utterance = this.utteranceCache.get(key);

    if (!utterance) {
      console.warn(`Command not preloaded: ${command.direction} ${command.value}`);
      return;
    }

    // Immediately cancel any ongoing speech to prevent overlap.
    window.speechSynthesis.cancel();

    let finalRate = 1;

    if (manualSpeed) {
      finalRate = speedMultiplier;
    } else {
      finalRate = this.calculateAutoSpeed(interval);
    }

    // Clamp the final rate to the browser's supported range (typically 0.1 to 10).
    utterance.rate = Math.min(10, Math.max(0.5, finalRate));

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Immediately stops any currently speaking or queued utterances.
   */
  public stop(): void {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
    }
  }
}

export const commandPlayer = new CommandPlayer();
