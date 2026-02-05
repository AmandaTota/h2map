import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateVisibility = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollRange =
        document.documentElement.scrollHeight - window.innerHeight;
      const shouldShow = scrollRange > 0 && scrollTop > scrollRange * 0.2;

      setVisible(shouldShow);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateVisibility);
      }
    };

    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-white shadow-lg transition-all hover:bg-emerald-700 hover:opacity-100 ${
        visible
          ? "opacity-80 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      aria-label="Voltar ao topo"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default BackToTop;
