import { useState, useEffect, useRef, useCallback } from "react";

export interface AudioPlayerState {
  playingId: string | null;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
}

export interface AudioPlayerActions {
  play: (id: string, text: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  setRate: (rate: number) => void;
}

interface UseAudioPlayerReturn {
  state: AudioPlayerState;
  actions: AudioPlayerActions;
  isPlayingId: (id: string) => boolean;
}

// Global state to ensure only one audio plays at a time
let globalAudioState: {
  currentUtterance: SpeechSynthesisUtterance | null;
  playingId: string | null;
  listeners: Set<(state: AudioPlayerState) => void>;
} = {
  currentUtterance: null,
  playingId: null,
  listeners: new Set(),
};

const useAudioPlayer = (): UseAudioPlayerReturn => {
  const [state, setState] = useState<AudioPlayerState>({
    playingId: null,
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    error: null,
    currentTime: 0,
    duration: 0,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timeTrackingRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to global state changes
  useEffect(() => {
    const updateState = (newState: AudioPlayerState) => {
      setState(newState);
    };

    globalAudioState.listeners.add(updateState);

    return () => {
      globalAudioState.listeners.delete(updateState);
    };
  }, []);

  const notifyListeners = useCallback(
    (newState: Partial<AudioPlayerState>) => {
      const fullState = { ...state, ...newState };
      setState(fullState);
      globalAudioState.listeners.forEach((listener) => listener(fullState));
    },
    [state],
  );

  const startTimeTracking = useCallback(() => {
    if (timeTrackingRef.current) {
      clearInterval(timeTrackingRef.current);
    }

    timeTrackingRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        setState((prev) => ({
          ...prev,
          currentTime: prev.currentTime + 0.1,
        }));
      }
    }, 100);
  }, []);

  const stopTimeTracking = useCallback(() => {
    if (timeTrackingRef.current) {
      clearInterval(timeTrackingRef.current);
      timeTrackingRef.current = null;
    }
  }, []);

  const play = useCallback(
    async (id: string, text: string) => {
      try {
        // Stop any currently playing audio
        if (globalAudioState.currentUtterance) {
          window.speechSynthesis.cancel();
          stopTimeTracking();
        }

        notifyListeners({
          playingId: id,
          isLoading: true,
          isPlaying: false,
          isPaused: false,
          error: null,
          currentTime: 0,
        });

        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Estimate duration (rough calculation: words per minute)
        const wordCount = text.split(/\s+/).length;
        const estimatedDuration = (wordCount / 150) * 60; // Assuming 150 WPM

        utterance.onstart = () => {
          notifyListeners({
            isLoading: false,
            isPlaying: true,
            isPaused: false,
            duration: estimatedDuration,
          });
          startTimeTracking();
        };

        utterance.onend = () => {
          stopTimeTracking();
          notifyListeners({
            playingId: null,
            isPlaying: false,
            isPaused: false,
            currentTime: 0,
          });
          globalAudioState.currentUtterance = null;
          globalAudioState.playingId = null;
        };

        utterance.onerror = (event) => {
          stopTimeTracking();
          notifyListeners({
            playingId: null,
            isPlaying: false,
            isPaused: false,
            isLoading: false,
            error: `Speech synthesis error: ${event.error}`,
            currentTime: 0,
          });
          globalAudioState.currentUtterance = null;
          globalAudioState.playingId = null;
        };

        utterance.onpause = () => {
          stopTimeTracking();
          notifyListeners({
            isPaused: true,
            isPlaying: false,
          });
        };

        utterance.onresume = () => {
          notifyListeners({
            isPaused: false,
            isPlaying: true,
          });
          startTimeTracking();
        };

        // Store references
        utteranceRef.current = utterance;
        globalAudioState.currentUtterance = utterance;
        globalAudioState.playingId = id;

        // Start speaking
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        notifyListeners({
          playingId: null,
          isPlaying: false,
          isPaused: false,
          isLoading: false,
          error: error instanceof Error ? error.message : "Playback failed",
          currentTime: 0,
        });
      }
    },
    [notifyListeners, startTimeTracking, stopTimeTracking],
  );

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    stopTimeTracking();
    notifyListeners({
      playingId: null,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
    });
    globalAudioState.currentUtterance = null;
    globalAudioState.playingId = null;
  }, [notifyListeners, stopTimeTracking]);

  const setVolume = useCallback((volume: number) => {
    if (utteranceRef.current) {
      utteranceRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const setRate = useCallback((rate: number) => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = Math.max(0.1, Math.min(10, rate));
    }
  }, []);

  const isPlayingId = useCallback(
    (id: string) => {
      return state.playingId === id;
    },
    [state.playingId],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimeTracking();
      if (globalAudioState.playingId === state.playingId) {
        window.speechSynthesis.cancel();
        globalAudioState.currentUtterance = null;
        globalAudioState.playingId = null;
      }
    };
  }, [state.playingId, stopTimeTracking]);

  return {
    state,
    actions: {
      play,
      pause,
      resume,
      stop,
      setVolume,
      setRate,
    },
    isPlayingId,
  };
};

export default useAudioPlayer;
