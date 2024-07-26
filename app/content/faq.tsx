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
        stakeholders to view and vote on Penumbra's on-chain governance
        proposals from the comfort of their web browsers. It is maintained by{" "}
        <FAQLink href="https://starlingcyber.net">Starling Cybernetics</FAQLink>
        , an active validator on the Penumbra network.
      </>
    ),
  },
  {
    id: "how-to-vote",
    question: "How do I vote?",
    answer: (
      <>
        To vote on a Penumbra governance proposal, follow these steps:
        <ol className="my-3 ml-8 list-decimal list-outside space-y-2">
          <li>
            Connect this site to{" "}
            <FAQLink href="https://praxwallet.com">Prax Wallet</FAQLink>, the
            browser extension wallet for Penumbra, by pressing the "Connect
            Wallet" button at the top of the page.
          </li>
          <li>
            After connecting your wallet, each proposal for which you are
            eligible to vote will display YES, NO, and ABSTAIN buttons to submit
            your vote.
          </li>
          <li>
            To cast your vote, click the button corresponding to the vote you
            want to cast, review the transaction popup from Prax Wallet, and if
            you are satisfied, approve the transaction.
          </li>
        </ol>
        You are only eligible to vote on proposals which were submitted to the
        network during a time period when you were staking.
      </>
    ),
  },
  {
    id: "how-to-stake",
    question: "How do I stake?",
    answer: (
      <>
        To become eligible to vote on governance proposals, you must stake $UM
        tokens to a validator. Here's how:
        <ol className="my-3 ml-8 list-decimal list-outside space-y-2">
          <li>
            Make sure you have installed{" "}
            <FAQLink href="https://praxwallet.com">Prax Wallet</FAQLink>, the
            browser extension wallet for Penumbra.
          </li>
          <li>
            You can then stake $UM by pressing the "Stake" button at the top of
            the page.
          </li>
          <li>
            Select the amount you wish to stake, then click "Stake". Review the
            transaction popup from Prax Wallet, and if you are satisfied,
            approve the transaction.
          </li>
        </ol>
        After staking, you will become immediately eligible to vote on future
        governance proposals.
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
        vote with privacy. It features an on-chain governance system permitting
        anyone staking its token $UM to vote on governance proposals that
        determine the future of the blockchain. Each delegator's vote holds a
        power proportionate to the value of their stake.
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
            eligible to vote on a proposal, you must have staked <i>before</i>{" "}
            the proposal was submitted to the network.
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
        No, validators cannot use this site to vote. Validators must cast their
        votes using the Penumbra command line wallet interface,{" "}
        <code>pcli</code>. Further instructions on how to use this tool may be
        found in the{" "}
        <FAQLink href="https://guide.penumbra.zone">Penumbra Guide</FAQLink>.
      </>
    ),
  },
  {
    id: "privacy",
    question: "What information does this site collect?",
    answer: (
      <>
        This site does not report user analytics. Information about your account
        balance, transaction history, and voting behavior stays in your web
        browser and is never collected by us. Only the RPC provider you have
        selected in your wallet can tell how you interact with the Penumbra
        network using this site, and because Penumbra itself protects your
        privacy, your RPC provider itself cannot inspect the content of your
        transactions.
      </>
    ),
  },
  {
    id: "support-the-site",
    question: "How can I support this site?",
    answer: (
      <>
        To support the development of this site, stake with{" "}
        <FAQLink href="https://starlingcyber.net">Starling Cybernetics</FAQLink>{" "}
        by clicking the "Stake" button on the home page. Your support as a
        delegator &ndash; in addition to earning you rewards and empowering you
        to vote &ndash; helps us maintain this site and other community
        resources. Thank you!
      </>
    ),
  },
  {
    id: "issue-report",
    question: "I found an issue with this site. What should I do?",
    answer: (
      <>
        If you believe you have found a security vulnerability in this site or
        any other service provided by{" "}
        <FAQLink href="https://starlingcyber.net">Starling Cybernetics</FAQLink>
        , please email{" "}
        <FAQLink href="mailto:contact@starlingcyber.net">
          <code>contact@starlingcyber.net</code>
        </FAQLink>
        . <b>Do not open GitHub issues about security vulnerabilities.</b> For
        bug reports or feature requests which are not related to security,
        please{" "}
        <FAQLink href="https://github.com/starlingcyber/void.vote/issues/new">
          open an issue
        </FAQLink>{" "}
        on the site's GitHub repository.
      </>
    ),
  },
];
