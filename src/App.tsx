import MenuPage from "@/pages/MenuPage";
import BattlePage from "@/pages/BattlePage";
import ResultPage from "@/pages/ResultPage";
import { useAppStore } from "@/stores/gameStore";

export default function App() {
  const phase = useAppStore((s) => s.phase);

  switch (phase) {
    case 'menu':
      return <MenuPage />;
    case 'countdown':
    case 'battle':
    case 'round_end':
      return <BattlePage />;
    case 'result':
      return <ResultPage />;
    default:
      return <MenuPage />;
  }
}