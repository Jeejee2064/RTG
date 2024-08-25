'use client';
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

function generateRandomSequence(steps) {
  const sequence = [];
  
  for (let i = 0; i < steps; i++) {
    let randomValue;
    let previousStepHasNote = (i > 0 && sequence[i - 1] !== '');

    if (previousStepHasNote) {
      randomValue = Math.random();
      if (randomValue < 0.85) {
        sequence.push(''); // More likely to be blank
      } else if (randomValue < 0.95) {
        sequence.push('D#3'); // Less likely
      } else {
        sequence.push('D3'); // Even less likely
      }
    } else {
      randomValue = Math.random();
      if (randomValue < 0.5) {
        sequence.push(''); // Regular chance for blank
      } else if (randomValue < 0.95) {
        sequence.push('D3'); // Regular chance for D3
      } else {
        sequence.push('D#3'); // Regular chance for D#3
      }
    }
  }

  return sequence;
}

function generateHatClosedSequence(steps) {
  const sequence = [];
  
  for (let i = 0; i < steps; i++) {
    let randomValue = Math.random();
    sequence.push(randomValue < 0.3 ? 'F1' : ''); // 50% chance for 'F1', otherwise blank
  }

  return sequence;
}

function generateRimshotsSequence(steps) {
  const sequence = [];
  
  for (let i = 0; i < steps; i++) {
    let randomValue = Math.random();
    sequence.push(randomValue < 0.3 ? 'G1' : ''); // Adjust probability as needed
  }

  return sequence;
}


const Sequencer = () => {
   const [sequence, setSequence] = useState(generateRandomSequence(16));
  const [isPlaying, setIsPlaying] = useState(false);
  const [sampler, setSampler] = useState(null);
  const [drumSampler, setDrumSampler] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tempo, setTempo] = useState(140);
  const [kickOn, setKickOn] = useState(true);
  const [clapOn, setClapOn] = useState(false);
  const [hatOn, setHatOn] = useState(false);
  const [hatClosedOn, setHatClosedOn] = useState(true);
  const [bassOn, setBassOn] = useState(true);

const [rimshotsOn, setRimshotsOn] = useState(true);
const [rimshotsSequence, setRimshotsSequence] = useState(generateRimshotsSequence(16));
const rimshotsSequenceRef = useRef(null);

  const sequenceRef = useRef(null);
  const kickGain = useRef(null);
  const bassGain = useRef(null);
  const [hatClosedSequence, setHatClosedSequence] = useState(generateHatClosedSequence(16));
  const hatClosedSequenceRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const initializeSampler = async () => {
      const newSampler = new Tone.Sampler({
        urls: {
          D3: '/sounds/bass.mp3',
          'D#3': '/sounds/bass+1.mp3',
        },
        onload: () => setIsLoaded(true),
        onerror: (err) => console.error('Sampler loading error:', err),
      });

      const newDrumSampler = new Tone.Sampler({
        urls: {
          C1: '/sounds/Kick.WAV',
          D1: '/sounds/Clap.WAV',
          E1: '/sounds/HatOpen.wav',
          F1: '/sounds/HatClosed.wav',
          G1: 'sounds/Rim.WAV',
        },
        onload: () => setIsLoaded(true),
        onerror: (err) => console.error('Drum Sampler loading error:', err),
      });

      const sidechainCompressor = new Tone.Compressor({
        attack: 0.01,
        release: 0.3,
        ratio: 6,
        threshold: -24,
      });

      const kickGainNode = new Tone.Gain(1);
      const bassGainNode = new Tone.Gain(0.8);

      newDrumSampler.chain(kickGainNode, Tone.Destination);
      kickGainNode.connect(sidechainCompressor);
      newSampler.chain(sidechainCompressor, bassGainNode, Tone.Destination);

      setSampler(newSampler);
      setDrumSampler(newDrumSampler);

      kickGain.current = kickGainNode;
      bassGain.current = bassGainNode;
    };

    initializeSampler();
  }, []);

const startSequence = async () => {
  if (!isLoaded || !sampler || !drumSampler) return;

  try {
    await Tone.start();
    console.log('Tone.js context started');
  } catch (error) {
    console.error('Error starting Tone.js:', error);
    return;
  }

  if (sequenceRef.current) {
    sequenceRef.current.dispose();
  }

  Tone.Transport.bpm.value = tempo;

  const newSequence = new Tone.Sequence(
    (time, step) => {
      const note = sequence[step];
      if (note && bassOn) {
        console.log(`Triggering bass note: ${note} at step: ${step}`);
        sampler.triggerAttackRelease(note, '8n', time);
      }

      if (kickOn && (step + 1) % 4 === 1) {
        drumSampler.triggerAttackRelease('C1', '8n', time);
      }
      if (clapOn && (step === 3 || step === 11)) {
        drumSampler.triggerAttackRelease('D1', '8n', time);
      }
      if (hatOn && (step + 1) % 4 === 3) {
        drumSampler.triggerAttackRelease('E1', '8n', time);
      }
      if (hatClosedOn && hatClosedSequence[step] === 'F1') {
        drumSampler.triggerAttackRelease('F1', '8n', time);
      }
      if (rimshotsOn && rimshotsSequence[step] === 'G1') {
        drumSampler.triggerAttackRelease('G1', '8n', time);
      }
      setCurrentStep(step);
    },
    Array.from(Array(16).keys()),
    '16n'
  ).start(0);

  sequenceRef.current = newSequence;
  Tone.Transport.start();
  setIsPlaying(true);
};

  const stopSequence = () => {
    if (sequenceRef.current) {
      sequenceRef.current.stop();
    }
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  const changeSequence = () => {
    const newSequence = generateRandomSequence(16);
    setSequence(newSequence);
  };

useEffect(() => {
  if (isPlaying && sequenceRef.current) {
    sequenceRef.current.dispose();

    const newSequence = new Tone.Sequence(
      (time, step) => {
        const note = sequence[step];
        if (note && bassOn) {
          console.log(`Triggering bass note: ${note} at step: ${step}`);
          sampler.triggerAttackRelease(note, '8n', time);
        }

        if (kickOn && (step + 1) % 4 === 1) {
          drumSampler.triggerAttackRelease('C1', '8n', time);
        }
        if (clapOn && (step === 4 || step === 12)) {
          drumSampler.triggerAttackRelease('D1', '8n', time);
        }
        if (hatOn && (step + 1) % 4 === 3) {
          drumSampler.triggerAttackRelease('E1', '8n', time);
        }
        if (hatClosedOn && hatClosedSequence[step] === 'F1') {
          drumSampler.triggerAttackRelease('F1', '8n', time);
        }
        if (rimshotsOn && rimshotsSequence[step] === 'G1') {
          drumSampler.triggerAttackRelease('G1', '8n', time);
        }
        setCurrentStep(step);
      },
      Array.from(Array(16).keys()),
      '16n'
    ).start(0);

    sequenceRef.current = newSequence;
  }
}, [sequence, isPlaying, kickOn, clapOn, hatOn, hatClosedOn, hatClosedSequence, rimshotsSequence, rimshotsOn, bassOn]);

useEffect(() => {
  setRimshotsSequence(generateRimshotsSequence(16));
}, [rimshotsOn]);

  useEffect(() => {
    if (isPlaying) {
      Tone.Transport.bpm.value = tempo;
    }
  }, [tempo, isPlaying]);

  useEffect(() => {
    setHatClosedSequence(generateHatClosedSequence(16));
  }, [hatClosedOn]);

 useEffect(() => {
  let isDebouncing = false;

  const handleKeyDown = (event) => {
    if (event.key === ' ') {
      // Check if we're currently debouncing
      if (isDebouncing) return;

      // Set debouncing flag and call togglePlayback
      isDebouncing = true;
      togglePlayback();

      // Reset debouncing flag after a short delay
      setTimeout(() => {
        isDebouncing = false;
      }, 200); // Adjust the timeout as needed
    } else if (event.key === 'q') {
      changeSequence();
    } else if (event.key === 'a') {
      setKickOn(prev => !prev);
    } else if (event.key === 's') {
      setClapOn(prev => !prev);
    } else if (event.key === 'd') {
      setHatOn(prev => !prev);
    } else if (event.key === 'w') {
      setHatClosedSequence(generateHatClosedSequence(16));
     } else if (event.key === 'e') {
      setRimshotsSequence(generateRimshotsSequence(16));
    } else if (event.key === 'f') {
      setHatClosedOn(prev => !prev);
          } else if (event.key === 'g') {
      setRimshotsOn(prev => !prev);
    } else if (event.key === 'h') { // New key for toggling bass
      setBassOn(prev => !prev);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [isPlaying, tempo, hatClosedSequence]);


  const togglePlayback = () => {
  if (isPlaying) {
    stopSequence();
  } else {
    startSequence();
  }
};


  return (
   <div className="bg-black flex flex-col items-center justify-center pt-4 text-white m-0 w-full overflow-x-hidden">
  <h1 className="text-l">Random Techno Generator 1.0</h1>

  <div className="md:flex items-center lg:m-8 w-full justify-center">
    <div className="flex flex-col items-center">
      <button 
        onClick={togglePlayback} 
        className={`p-4 rounded-lg mx-4 ${isPlaying ? 'bg-red-600' : 'bg-blue-600'} text-white`}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <span className="text-gray-200 hidden lg:block">(SPACE)</span>
    </div>
    <div className='flex justify-center items-center'>
    <label htmlFor="tempo" className="mr-4 text-gray-200">Tempo: {tempo} BPM</label>
    <input 
      id="tempo" 
      type="range" 
      min="60" 
      max="200" 
      value={tempo} 
      onChange={(e) => setTempo(e.target.value)} 
      className="lg:w-64 w-32"
    />
  </div>
   </div>

  <div className="flex flex-wrap gap-2 justify-center">
    <div className="flex flex-col items-center">
      <button 
        onClick={changeSequence} 
        className="bg-gray-800 text-white p-4 rounded-lg mx-4"
      >
        Randomize Bass
      </button>
      <span className="text-gray-200 hidden lg:block">(Q)</span>
    </div>
    <div className="flex flex-col items-center">
      <button 
        onClick={() => setHatClosedSequence(generateHatClosedSequence(16))} 
        className="bg-gray-800 text-white p-4 rounded-lg mx-4"
      >
        Randomize Hats
      </button>
      <span className="text-gray-200 hidden lg:block">(W)</span>
    </div>
    <div className="flex flex-col items-center">
      <button 
        onClick={() => setRimshotsSequence(generateRimshotsSequence(16))} 
        className="bg-gray-800 text-white p-4 rounded-lg mx-4"
      >
        Randomize Rimshots
      </button>
      <span className="text-gray-200 hidden lg:block">(E)</span>
    </div>
  </div>

  <div className="flex flex-wrap gap-x-2 items-center justify-center mt-4">
    <div className="flex flex-col justify-center items-center">
      <button 
        onClick={() => setKickOn(!kickOn)} 
        className={`lg:p-4 p-2 rounded-lg ${kickOn ?  'bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-200': 'bg-cyan-400'}`}
      >
       Kick
      </button>
      <span className="text-gray-200 hidden lg:block">(A)</span>
    </div>
    <div className="flex flex-col items-center">
      <button 
        onClick={() => setClapOn(!clapOn)} 
        className={`lg:p-4 p-2 rounded-lg ${clapOn ?  'bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-200': 'bg-cyan-400'}`}
      >
   Clap
      </button>
      <span className="text-gray-200 hidden lg:block">(S)</span>
    </div>
    <div className="flex flex-col items-center">
      <button 
        onClick={() => setHatOn(!hatOn)} 
        className={`lg:p-4 p-2 rounded-lg ${hatOn ?  'bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-200': 'bg-cyan-400'}`}
      >
 HO
      </button>
      <span className="text-gray-200 hidden lg:block">(D)</span>
    </div>
    <div className="flex flex-col items-center">
      <button 
        onClick={() => setHatClosedOn(!hatClosedOn)} 
        className={`lg:p-4 p-2 rounded-lg ${hatClosedOn ?  'bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-200': 'bg-cyan-400'}`}
      >
  HC 
      </button>
      <span className="text-gray-200 hidden lg:block">(F)</span>
    </div>
    <div className="flex flex-col items-center">
      <button 
        onClick={() => setRimshotsOn(!rimshotsOn)} 
        className={`lg:p-4 p-2 rounded-lg ${rimshotsOn ?  'bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-200': 'bg-cyan-400'}`}
      >
        Rim 
      </button>
      <span className="text-gray-200 hidden lg:block">(G)</span>
    </div>
    <div className="flex flex-col items-center">
      <button 
        onClick={() => setBassOn(!bassOn)} 
        className={`lg:p-4 p-2 rounded-lg ${bassOn ?  'bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-200': 'bg-cyan-400'}`}
      >
Bass
      </button>
      <span className="text-gray-200 hidden lg:block">(H)</span>
    </div>
  </div>

  <div className="flex justify-center mt-8 w-full">
    {Array.from({ length: 16 }).map((_, index) => (
      <div
        key={index}
        className={`lg:w-8 lg:h-8 w-4 h-4 mx-1 border-2 border-gray-400 rounded-full ${currentStep === index ? 'bg-blue-500' : 'bg-white'}`}
      />
    ))}
  </div>

  {!isLoaded && <p>Loading samples...</p>}
</div>


  );
};

export default Sequencer;
