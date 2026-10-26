import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Games } from '../features/games/Games';
import { BlockRunner } from '../features/games/BlockRunnerGame';
import { PixelSolitaire } from '../features/games/PixelSolitaire';
import { Trepaluna } from '../features/games/TrepalunaGame';
import { LavaFloor } from '../features/games/LavaFloor';
import { SharkCity } from '../features/games/SharkCity';
import { PaperBall } from '../features/games/PaperBallGame';
import { Invasion } from '../features/games/InvasionGame';
import { GravitySwap } from '../features/games/GravitySwapGame';
import { KombatFootball } from '../features/games/KombatFootballGame';

// Solo la sección de Juegos: sin cuenta, sin sincronización. Los récords quedan guardados en el navegador.
export default function App() {
  return <HashRouter><Routes><Route element={<Layout />}>
    <Route index element={<Games />} />
    <Route path="juegos" element={<Games />} />
    <Route path="juegos/bloques" element={<BlockRunner />} />
    <Route path="juegos/solitario" element={<PixelSolitaire />} />
    <Route path="juegos/trepaluna" element={<Trepaluna />} />
    <Route path="juegos/lava" element={<LavaFloor />} />
    <Route path="juegos/tiburon" element={<SharkCity />} />
    <Route path="juegos/cesto" element={<PaperBall />} />
    <Route path="juegos/invasion" element={<Invasion />} />
    <Route path="juegos/gravedad" element={<GravitySwap />} />
    <Route path="juegos/kombat" element={<KombatFootball />} />
  </Route></Routes></HashRouter>;
}
