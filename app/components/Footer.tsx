import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="text-center text-gray-500 text-lg mt-8">
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
        This website is provided for informational purposes only, and should not
        be considered investment advice or an investment recommendation.
      </p>
    </footer>
  );
};

export default Footer;
