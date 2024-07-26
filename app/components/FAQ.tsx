import React, { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQProps {
  faqItems: { id: string; question: string; answer: ReactNode }[];
}

export default function FAQ({ faqItems }: FAQProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);

  useEffect(() => {
    if (location.hash.startsWith("#faq")) {
      const questionId = location.hash.split("/")[1];
      const index = faqItems.findIndex((item) => item.id === questionId);
      setOpenItemIndex(index !== -1 ? index : 0);
    } else {
      setOpenItemIndex(null);
    }
  }, [location.hash, faqItems]);

  const isOpen = location.hash.startsWith("#faq");

  const onClose = () => {
    navigate(location.pathname + location.search);
  };

  const handleItemClick = (index: number) => {
    navigate(`#faq/${faqItems[index].id}`);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="bg-gray-800 rounded-lg border-2 border-teal-400 shadow-lg w-full max-w-6xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header and close button (fixed) */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-teal-400 pr-8">
            Frequently Asked Questions
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-full p-1"
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="overflow-y-auto flex-grow p-6">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FAQItem
                key={item.id}
                question={item.question}
                isOpen={index === openItemIndex}
                onClick={() => handleItemClick(index)}
              >
                {item.answer}
              </FAQItem>
            ))}
          </div>
        </div>

        {/* Footer with close button (fixed) */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 border-2 border-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-xl"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface FAQItemProps {
  question: string;
  children: ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  children,
  isOpen,
  onClick,
}) => {
  return (
    <div className="border-b border-gray-700 last:border-b-0 pb-4">
      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-md p-2 transition-colors duration-150 ease-in-out hover:bg-gray-700"
      >
        <h3 className="text-2xl font-semibold text-orange-400 flex justify-between items-center">
          {question}
          <motion.svg
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </h3>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="text-gray-300 text-xl mt-2 pl-2 pr-8 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface FAQLinkProps {
  href: string;
  children: ReactNode;
}

export const FAQLink: React.FC<FAQLinkProps> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-teal-300 hover:underline"
  >
    {children}
  </a>
);
