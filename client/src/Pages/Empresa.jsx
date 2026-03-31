// import { useNavigate } from "react-router-dom";

import { Button } from "@heroui/react";
import SideBar from "../Components/Sidebar";

export default function Empresa() {
  // const navigate = useNavigate();
  return (
    <>
      <SideBar />
      <section className="h-screen flex justify-center items-center">
        <h1>Ya estás adentro como empresa</h1>
      </section>
    </>
  );
}
