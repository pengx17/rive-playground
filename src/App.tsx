import { useRive } from '@rive-app/react-canvas';
import recordBlockPlayIcon from '/record_block_play_icon_light.riv?url';

import './App.css';

function App() {
  const { rive, RiveComponent } = useRive({
    src: recordBlockPlayIcon,
    stateMachines: 'bumpy',
    autoplay: false,
  });
  return (
    <div style={{ width: 100, height: 100 }}>
      <RiveComponent
        onMouseEnter={() => rive && rive.play()}
        onMouseLeave={() => rive && rive.pause()}
      />
    </div>
  );
}

export default App;
