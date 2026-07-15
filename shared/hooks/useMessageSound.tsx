import { useCallback, useEffect, useRef } from 'react';

export const useMessageSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio('/sounds/message.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    const unlock = async () => {
      if (unlockedRef.current || !audioRef.current) return;

      try {
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        unlockedRef.current = true;
        console.log('Audio unlocked');
      } catch {
        // Ignore
      }
    };

    window.addEventListener('pointerdown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
    };
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || !unlockedRef.current) return;

    audio.currentTime = 0;
    void audio
      .play()
      .then(() => {
        console.log('---play---');
      })
      .catch((e) => {
        console.log('---play error---', e);
      });
  }, []);

  return play;
};
