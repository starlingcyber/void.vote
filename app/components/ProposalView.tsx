import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import type { Proposal } from "~/types/Proposal";
import VoteButtons from "./VoteButtons";
import VoteTallyBar from "./VoteTallyBar";
import VotingReceipts from "./VotingReceipts";
import { JsonValue } from "@bufbuild/protobuf";

const formatPayloadJson = (obj: any): JsonValue => {
  if (typeof obj === "bigint") {
    return obj.toString();
  } else if (Array.isArray(obj)) {
    return obj.map(formatPayloadJson);
  } else if (typeof obj === "object" && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        key,
        formatPayloadJson(value),
      ]),
    );
  }
  return obj;
};

const reformatPayloadJson = (obj: JsonValue): JsonValue => {
  if (typeof obj === "object" && obj !== null) {
    if (!Array.isArray(obj)) {
      if (obj["kind"] && obj["changes"]) {
        const kind = obj["kind"];
        if (
          kind === "parameter_change" &&
          obj.changes &&
          Array.isArray(obj.changes)
        ) {
          obj.changes = obj.changes.map((change: any) => {
            if (change["value"]) {
              change.value = JSON.parse(change.value);
            }
            return change;
          });
          return obj;
        }
      }
    }
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
  const serializedPayload = formatPayloadJson(proposal.payload);
  const stateClass = getProposalStateClass(proposal.state);
  const stateText = getProposalStateText(proposal.state);
  let active = false;
  if (proposal.state.voting) {
    active = true;
  }

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
            Proposal #{proposal.proposal_id.toString()}:
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

        {proposal.withdrawn && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2 text-yellow-300">
              Update: Proposal Withdrawn by Proposer
            </h3>
            <div className="bg-yellow-900 rounded-lg p-4 text-lg">
              <p>
                <span className="font-bold text-yellow-200">
                  Reason for Withdrawal:
                </span>{" "}
                {proposal.withdrawal_reason}
              </p>
              <br />
              <p className="text-gray-200">
                <b className="text-yellow-200">Editor's Note:</b> A proposal
                withdrawn before voting closes cannot possibly pass. However, it
                can still be <i>slashed</i>, if the overwhelming majority of
                votes are NO.
              </p>
            </div>
          </div>
        )}

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
                  unwrapDisallowed={true}
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
                {Number(proposal.proposal_deposit_amount) / 10 ** 6} UM
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
                src={reformatPayloadJson(serializedPayload)}
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

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-300">Voting</h3>
          <div className="bg-gray-700 rounded-lg pl-3 pr-3 pt-3 pb-3">
            <VoteButtons
              active={active}
              proposalId={BigInt(proposal.proposal_id)}
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-300">
            Your Voting Receipt Tokens
          </h3>
          <div className="bg-gray-700 rounded-lg pl-3 pr-3 pt-3 pb-3">
            <VotingReceipts
              active={active}
              proposalId={BigInt(proposal.proposal_id)}
            />
          </div>
        </div>

        {proposal.tally && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-2 text-gray-300">
              Vote Tally
            </h3>
            <VoteTallyBar
              active={active}
              proposalId={BigInt(proposal.proposal_id)}
              {...proposal.tally}
            />
          </div>
        )}
      </div>
    </li>
  );
}
