import './App.css';
import Board from './components/canva/board/Board';
import { GameProvider } from './contexts/GameContexts';

function App() {
  return (
    <GameProvider>
      <Board/>
    </GameProvider>
  );
}

export default App;
