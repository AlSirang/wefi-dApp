import { ButtonContextProvider, Web3ContextProvider } from "./context";
import RoutesProvider from "./routes";
import "./styles/main.css";
import Wrapper from "./Wrapper";

function App() {
  return (
    <Web3ContextProvider>
      <Wrapper />
      <ButtonContextProvider>
        <RoutesProvider />
      </ButtonContextProvider>
    </Web3ContextProvider>
  );
}

export default App;
