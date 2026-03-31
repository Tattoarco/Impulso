import { Button } from "@heroui/react";

export default function Navbar() {
  return (
    <>
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-[5%] h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
            <i className="fi fi-sr-bolt text-white"></i>
          </div>
          <span className="font-bold text-lg">Impulso</span>
        </a>

        <div className="hidden md:flex items-center gap-2">
          <a href="#como-funciona" className="text-sm text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition">
            Cómo funciona
          </a>
          <a href="#para-quien" className="text-sm text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition">
            Para quién
          </a>

          <Button onClick={() => (window.location.href = "/login")} variant="ghost" className="text-sm text-orange-500 hover:bg-orange-100 hover:text-gray-600 transition">
            Iniciar sesión
          </Button>
          <Button className="font-semibold bg-orange-500 hover:bg-orange-600 transition hover:-translate-y-0.5 hover:shadow-lg">Registrarse</Button>
        </div>
      </nav>
    </>
  );
}
