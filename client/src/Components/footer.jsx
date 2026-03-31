export default function Footer() {
  return (
    <>
      <footer className="bg-gray-900 text-white px-[5%] py-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-md flex items-center justify-center">
            <i className="fi fi-sr-bolt text-white"></i>
          </div>
          <span className="font-bold">Impulso</span>
        </div>

        <p className="text-sm text-gray-400">© 2025 Impulso · Medellín, Colombia</p>
      </footer>
    </>
  );
}
