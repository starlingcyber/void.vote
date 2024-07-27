import { useNavigate } from "@remix-run/react";

export default function FAQButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("#faq")}
      className="px-4 py-2 rounded-md font-bold text-white transition-all duration-100 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 w-36 h-12 flex items-center justify-center text-2xl border-2 bg-teal-600 hover:bg-teal-700 focus:ring-teal-600 border-teal-400 whitespace-nowrap"
    >
      ❔ Info
    </button>
  );
}
