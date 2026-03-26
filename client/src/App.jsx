import axios from "axios";

function App() {
  const apiCall = () => {
    axios.get("http://localhost:8080").then(() => {
      console.log("Wow, ayuda!!");
    });
  };

  return (
    <>
      <div>
        <header>
          <button onClick={apiCall} className="border-2 m-10 cursor-pointer">Make API call</button>
        </header>
      </div>
    </>
  );
}

export default App;
