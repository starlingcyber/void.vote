import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import type { Proposal } from "~/types/Proposal";
import VoteButtons from "./VoteButtons";

const serializeBigInt = (obj: any): any => {
  if (typeof obj === "bigint") {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  } else if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)]),
    );
  }
  return obj;
};

const renderValue = (value: any): string => {
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return String(value ?? "N/A");
};

const getProposalStateClass = (state: any) => {
  if (state.voting) return "proposal-voting";
  if (state.finished) {
    if (state.finished.outcome.passed) return "proposal-passed";
    if (state.finished.outcome.failed) return "proposal-failed";
    if (state.finished.outcome.slashed) return "proposal-slashed";
  }
  if (state.withdrawn) return "proposal-withdrawn";
  return "";
};

const getProposalStateText = (state: any) => {
  if (state.voting) return "Voting in Progress...";
  if (state.finished) {
    if (state.finished.outcome.passed) return "Passed";
    if (state.finished.outcome.failed) return "Failed";
    if (state.finished.outcome.slashed) return "Slashed";
  }
  if (state.withdrawn) return "Withdrawn";
  return "Unknown State";
};

export default function ProposalView({ proposal }: { proposal: Proposal }) {
  const [ReactJson, setReactJson] = useState<any>(null);
  const serializedPayload = serializeBigInt(proposal.payload);
  const stateClass = getProposalStateClass(proposal.state);
  const stateText = getProposalStateText(proposal.state);

  useEffect(() => {
    import("@microlink/react-json-view").then((module) => {
      setReactJson(() => module.default);
    });
  }, []);

  return (
    <li
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg ${stateClass}`}
    >
      <div className="p-6">
        <h2 className="text-3xl mb-4 font-bold">
          <span className="text-orange-400">
            Proposal #{proposal.proposal_id}:
          </span>{" "}
          <span className="text-teal-400">{proposal.title}</span>
        </h2>

        <div className="mb-4">
          <span className="font-semibold text-xl text-gray-300">Status:</span>
          {` `}
          <span className={`px-2 py-1 rounded text-xl font-semibold status`}>
            {stateText}
          </span>
        </div>

        <br />

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-300">
            Description
          </h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="prose prose-invert max-w-none text-gray-300 text-lg">
              {proposal.description !== "" ? (
                <ReactMarkdown
                  rehypePlugins={[rehypeSanitize]}
                  children={proposal.description}
                  allowElement={(element) =>
                    ["p", "br", "em", "strong", "ul", "ol", "li"].includes(
                      element.tagName,
                    )
                  }
                />
              ) : (
                "No description provided."
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              Proposal Details
            </h3>
            <div className="bg-gray-700 rounded-lg p-4 text-lg">
              <p>
                <span className="font-semibold text-orange-400">Kind:</span>{" "}
                {renderValue(proposal.kind)}
              </p>
              <p>
                <span className="font-semibold text-orange-400">Deposit:</span>{" "}
                {proposal.proposal_deposit_amount / 10 ** 6} UM
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              Voting Period
            </h3>
            <div className="bg-gray-700 rounded-lg p-4 text-lg">
              <p>
                <span className="font-semibold text-orange-400">
                  Start Block:
                </span>{" "}
                {renderValue(proposal.start_block_height)}
              </p>
              <p>
                <span className="font-semibold text-orange-400">
                  End Block:
                </span>{" "}
                {renderValue(proposal.end_block_height)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2 text-gray-300">
            Executable Payload
          </h3>
          <div className="bg-gray-700 rounded-lg p-4 overflow-x-auto">
            {ReactJson ? (
              <ReactJson
                src={serializedPayload}
                theme="monokai"
                collapsed={1}
                fontFamily="Iosevka"
                name={false}
                displayObjectSize={false}
                displayDataTypes={false}
                style={{ background: "transparent", fontSize: "13pt" }}
              />
            ) : (
              <pre className="text-sm">
                {JSON.stringify(serializedPayload, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {proposal.withdrawn && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 text-red-400">
              Proposal Withdrawn
            </h3>
            <div className="bg-red-900 rounded-lg p-4">
              <p>
                <span className="font-semibold text-red-400">Reason:</span>{" "}
                {proposal.withdrawal_reason}
              </p>
            </div>
          </div>
        )}

        {proposal.state.voting ? (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-300">Voting</h3>
            <div className="bg-gray-700 rounded-lg pl-3 pr-3 pt-3 pb-3">
              <VoteButtons proposalId={proposal.proposal_id} />
            </div>
          </div>
        ) : null}
      </div>
    </li>
  );
}
