//--- [ GLOBAL STYLES ] ---//
import "./App.css";

//--- [ COMPONENT IMPORTS ] ---//
import Layout from "./components/Layout/Layout";

//--- [ ROOT APPLICATION COMPONENT ] ---//
/* The primary container for the application.
   It delegates the structural scaffolding (Header, Footer, Main Content area)
   entirely to the Layout component.
*/
function App() {
  return (
    <>
      <Layout />
    </>
  );
}

export default App;