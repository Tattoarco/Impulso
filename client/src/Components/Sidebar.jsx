import { useState } from "react";

import { Button } from "@heroui/react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform rounded-r-2xl 
        ${open ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 transition duration-200 ease-in-out`}
      >
        <h1 className="text-2xl font-bold text-center">Impulso</h1>

        <nav>
          <a href="/" className="block py-2.5 px-4 rounded hover:bg-gray-700 transition">
            Home
          </a>
          <a href="/" className="block py-2.5 px-4 rounded hover:bg-gray-700 transition">
            About
          </a>
          <a href="/" className="block py-2.5 px-4 rounded hover:bg-gray-700 transition">
            Contact
          </a>
        </nav>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="p-4  flex justify-between md:justify-end">
          <Button variant="ghost" onClick={() => setOpen(!open)} className="md:hidden text-gray-800 focus:outline-none">
            ☰
          </Button>
        </div>
      </div>
    </div>
  );
}
