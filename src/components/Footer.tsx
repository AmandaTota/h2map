import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-transparent text-slate-700 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <img
            src="/Logo.png"
            alt="H2maps"
            className="w-10 h-10 object-contain"
          />
          <div>
            <div className="text-sm font-semibold text-slate-900">H2maps</div>
            <div className="text-xs text-slate-500">
              Georreferenciamento para energia renovável
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 text-sm text-slate-500 md:ml-auto">
          © {new Date().getFullYear()} H2maps
        </div>
      </div>
    </footer>
  );
}
