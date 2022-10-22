import { Web3ContextProvider } from "./context";
import Presale from "./pages/presale";
import "./styles/main.css";
import Wrapper from "./Wrapper";
function App() {
  return (
    <Web3ContextProvider>
      <Wrapper />
      <Presale />
    </Web3ContextProvider>
  );
}

export default App;
