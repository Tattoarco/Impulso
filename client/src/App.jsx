  // import axios from "axios";
import { Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";


function App() {
  // const apiCall = () => {
  //   axios.get("http://localhost:8080").then(() => {
  //     console.log("Wow, ayuda!!");
  //   });
  // };

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
