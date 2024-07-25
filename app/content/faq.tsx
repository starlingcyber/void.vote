import { FAQLink } from "app/components/FAQ";

export const faqItems = [
  {
    id: "what-is-this-site",
    question: "What is this site?",
    answer: (
      <>
        This site,{" "}
        <FAQLink href="/">
          <code>void.vote</code>
        </FAQLink>
        , allows <FAQLink href="https://penumbra.zone">Penumbra</FAQLink>{" "}
        stakeholders to view and vote on governance proposals from the comfort
        of their web browsers. It is a frontend interface to Penumbra's on-chain
        governance system, and is maintained by{" "}
        <FAQLink href="https://starlingcyber.net">Starling Cybernetics</FAQLink>
        , an active validator on the Penumbra network.
      </>
    ),
  },
  {
    id: "what-is-governance",
    question: "What is Penumbra's governance system?",
    answer: (
      <>
        <FAQLink href="https://penumbra.zone">Penumbra</FAQLink> is a shielded
        proof of stake blockchain allowing anyone to transact, stake, trade, and
        vote with privacy. Penumbra's on-chain governance system is the
        consensus decision-making process that permits anyone staking any amount
        of Penumbra's native staking token ($UM) to vote on governance proposals
        that determine the future behavior of the blockchain. Each delegator's
        vote holds a power proportionate to the value of their stake.
      </>
    ),
  },
  {
    id: "how-is-penumbra-governance-different",
    question: "How is governance different on Penumbra?",
    answer: (
      <>
        Penumbra's governance system is distinct from many other proof of stake
        blockchains such as those built on the Cosmos SDK. Key points of
        difference:
        <ul className="my-3 ml-8 list-disc list-outside space-y-2">
          <li>
            Delegator votes are private. Nobody can see how you vote, not even
            the validator with whom you stake your tokens.
          </li>
          <li>
            All votes are final once cast. This applies to validators as well as
            delegators.
          </li>
          <li>
            The only possible votes are YES, NO, and ABSTAIN ("no with veto" is
            not an option).
          </li>
          <li>
            If a proposal receives over a critical threshold of NO votes, it is
            considered "slashed", and the initial deposit of the proposer is
            burned. This is done to deter spam proposals.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-to-vote",
    question: "How can I vote?",
    answer: (
      <>
        To vote, you must first connect this site to{" "}
        <FAQLink href="https://praxwallet.com">Prax Wallet</FAQLink>, the
        browser extension wallet for Penumbra by pressing the "Connect Wallet"
        button at the top of the page. Once you have done this, any proposal for
        which you are eligible to vote will display buttons to submit your vote.
      </>
    ),
  },
  {
    id: "i-cant-vote",
    question: "I can't vote. What's wrong?",
    answer: (
      <>
        If you have connected your wallet to the site and you do not see any
        voting buttons beneath a proposal, it is likely for one of the following
        reasons:
        <ul className="my-3 ml-8 list-disc list-outside space-y-2">
          <li>
            <b>You are not eligible to vote on the proposal:</b> In order to be
            eligible to vote on a proposal, you must have staked $UM tokens to
            some validator <i>before</i> the proposal was submitted to the
            network.
          </li>
          <li>
            <b>You have already voted on the proposal.</b> Votes cannot be
            changed once they are cast, so if you have already voted, you cannot
            vote again.
          </li>
          <li>
            <b>The proposal has already concluded voting.</b> If a proposal is
            open for voting, its status will read: "Voting in Progress".
            Otherwise, the window to vote has closed.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "validators-voting",
    question: "Can validators use this site to vote?",
    answer: (
      <>
        No, validators cannot use this site to vote, and this feature is not
        planned. Validators must cast their votes using the command line wallet
        interface, <code>pcli</code>. Further instructions on how to use this
        tool may be found in the{" "}
        <FAQLink href="https://guide.penumbra.zone">Penumbra Guide</FAQLink>.
      </>
    ),
  },
  {
    id: "privacy",
    question: "What information does this site collect?",
    answer: (
      <>
        This site does not report identifiable user analytics. Information about
        your account balance, transaction history, and voting behavior is never
        transmitted to this site. Only the RPC provider you have selected in
        your wallet can tell how you interact with the Penumbra network, and
        because Penumbra itself protects your privacy, your RPC provider itself
        has very limited visibility into your activity.
      </>
    ),
  },
  {
    id: "support-the-site",
    question: "How can I support this site?",
    answer: (
      <>
        If you would like to support the development and maintenance of this
        site, you may do so by delegating $UM tokens to{" "}
        <FAQLink href="https://starlingcyber.net">Starling Cybernetics</FAQLink>{" "}
        by clicking the "Stake" button on the home page. Your support in the
        form of delegations helps us maintain this site and other community
        resources. Thank you!
      </>
    ),
  },
  {
    id: "security-report",
    question:
      "I found a security vulnerability in this site. What should I do?",
    answer: (
      <>
        If you have discovered a security vulnerability in this site, please
        report it to us by emailing{" "}
        <FAQLink href="mailto:contact@starlingcyber.net">
          <code>contact@starlingcyber.net</code>
        </FAQLink>
        . We will respond to your report as soon as possible.
      </>
    ),
  },
];
