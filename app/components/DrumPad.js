'use client';
import { useState, useEffect } from 'react';
import { start, Sampler } from 'tone';

const DrumPad = ({ soundFile, color, title, keyTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sampler, setSampler] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [contextStarted, setContextStarted] = useState(false); // Track if the audio context has started

  useEffect(() => {
    // Initialize Tone.js without starting it
    const initializeTone = async () => {
      const loadedSampler = new Sampler({
        urls: {
          C4: `/sounds/${soundFile}` // Use proper string interpolation
        },
        release: 1, // Optional: release time to make the stop smoother
        onload: () => {
          setSampler(loadedSampler);
          setIsLoaded(true);
        },
        onerror: (err) => {
          console.error("Sampler loading error:", err);
        }
      }).toDestination();
    };

    initializeTone();
  }, [soundFile]);

  const playSound = async () => {
    if (!contextStarted) {
      // Start Tone.js audio context on user interaction
      try {
        await start();
        setContextStarted(true);
        console.log("Tone.js started");
      } catch (error) {
        console.error("Error starting Tone.js:", error);
        return;
      }
    }

    if (sampler && isLoaded) {
      // Stop the previous sample
      sampler.triggerRelease('C4');
      // Play the new sample
      sampler.triggerAttack('C4');
      setIsPlaying(true);
      // Automatically reset the playing state based on the sample's duration
      const duration = sampler.buffer ? sampler.buffer.duration * 1000 : 500; // Default to 500ms if buffer duration is not available
      setTimeout(() => setIsPlaying(false), duration);
    } else {
      console.warn("Sampler not loaded or not available");
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === keyTrigger.toLowerCase()) {
        playSound();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [keyTrigger, sampler, isLoaded, contextStarted]);

  return (


<div className='w-1/4 rounded-lg p-8 m-4' style={{ backgroundColor: color, textAlign: 'center' }}>
  <div>{title}</div>
  <button className='bg-gray-800 rounded-lg text-white p-8' onClick={playSound} disabled={!isLoaded}>
    {isPlaying ? 'Playing...' : 'Play Sound'}
  </button>
  <div className='mt-4 uppercase'>{keyTrigger}</div>
</div>

  );
};

export default DrumPad;
