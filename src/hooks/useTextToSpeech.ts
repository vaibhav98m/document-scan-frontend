import { useState, useCallback, useEffect } from "react";
import { TTSStatus } from "@/types";

export const useTextToSpeech = () => {
  const [status, setStatus] = useState<TTSStatus>({
    isPlaying: false,
    isPaused: false,
    currentText: null,
  });

  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(
    null,
  );

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!("speechSynthesis" in window)) {
      setStatus((prev) => ({
        ...prev,
        error: "Text-to-speech is not supported in this browser",
      }));
    }

    return () => {
      if (utterance) {
        speechSynthesis.cancel();
      }
    };
  }, [utterance]);

  const speak = useCallback(
    (
      text: string,
      options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
        voice?: SpeechSynthesisVoice;
      },
    ) => {
      if (!("speechSynthesis" in window)) {
        setStatus((prev) => ({
          ...prev,
          error: "Text-to-speech is not supported in this browser",
        }));
        return;
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel();

      const newUtterance = new SpeechSynthesisUtterance(text);

      // Set options
      newUtterance.rate = options?.rate || 1;
      newUtterance.pitch = options?.pitch || 1;
      newUtterance.volume = options?.volume || 1;

      if (options?.voice) {
        newUtterance.voice = options.voice;
      }

      // Event handlers
      newUtterance.onstart = () => {
        setStatus({
          isPlaying: true,
          isPaused: false,
          currentText: text,
          error: undefined,
        });
      };

      newUtterance.onend = () => {
        setStatus({
          isPlaying: false,
          isPaused: false,
          currentText: null,
          error: undefined,
        });
      };

      newUtterance.onerror = (event) => {
        setStatus({
          isPlaying: false,
          isPaused: false,
          currentText: null,
          error: `Speech synthesis error: ${event.error}`,
        });
      };

      newUtterance.onpause = () => {
        setStatus((prev) => ({
          ...prev,
          isPaused: true,
        }));
      };

      newUtterance.onresume = () => {
        setStatus((prev) => ({
          ...prev,
          isPaused: false,
        }));
      };

      setUtterance(newUtterance);
      speechSynthesis.speak(newUtterance);
    },
    [],
  );

  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setStatus({
      isPlaying: false,
      isPaused: false,
      currentText: null,
      error: undefined,
    });
  }, []);

  const getVoices = useCallback(() => {
    return speechSynthesis.getVoices();
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    getVoices,
    status,
    isSupported: "speechSynthesis" in window,
  };
};
