import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="text-center text-gray-500 text-lg mt-8 max-w-3xl m-auto">
      <p className="text-gray-400 mb-4">
        Questions? Comments? Drop us a line:{" "}
        <a
          className="underline hover:text-gray-300"
          href="mailto:contact@starlingcyber.net"
        >
          contact@starlingcyber.net
        </a>
        .
      </p>
      <p>
        This website is provided for informational purposes only. None of its
        content should be considered investment advice or an investment
        recommendation.
      </p>
    </footer>
  );
};

export default Footer;
