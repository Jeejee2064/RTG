import Sequencer from './components/Sequencer';
import DrumPad from './components/DrumPad';

export default function Home() {
  return (
    <main >
    <div className='w-screen min-h-screen'>
    <Sequencer/>
    <div className='flex bg-black justify-center items-center'>
      <DrumPad soundFile='random.wav' color='#ffbe0b' title='R.T.G.' keyTrigger='u'/>
      <DrumPad soundFile='floopy.wav' color='#fb5607' title='F.D.' keyTrigger='i'/>
      <DrumPad soundFile='vhs.wav' color='#3a86ff' title='V.H.S.' keyTrigger='o'/>
      <DrumPad soundFile='mastersystem.wav' color='#ff006e' title='M.S.' keyTrigger='p'/>
      </div>
      </div>
          </main>
  );
}
