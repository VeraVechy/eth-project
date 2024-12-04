import React, { useState } from "react";
import Web3 from "web3";
import { Vote, Wallet, Send } from "lucide-react";

const VOTING_CONTRACT_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "proposal", type: "uint256" }],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const VOTING_CONTRACT_ADDRESS = "0xB2E1185468e57A801a54162F27725CbD5B0EB4a6";

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txnHash, setTxnHash] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("send");
  const [votingStatus, setVotingStatus] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const balanceWei = await web3.eth.getBalance(accounts[0]);
        const balanceEth = web3.utils.fromWei(balanceWei, "ether");
        setBalance(balanceEth);
      } catch (err) {
        setError("Wallet connection failed");
      }
    }
  };

  const sendTransaction = async (e) => {
    e.preventDefault();
    if (!account) return;

    try {
      const web3 = new Web3(window.ethereum);
      const tx = await web3.eth.sendTransaction({
        from: account,
        to: recipient,
        value: web3.utils.toWei(amount, "ether"),
      });
      setTxnHash(tx.transactionHash);
    } catch (err) {
      setError("Transaction failed");
    }
  };

  const castVote = async (proposalId) => {
    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(
        VOTING_CONTRACT_ABI,
        VOTING_CONTRACT_ADDRESS
      );

      await contract.methods.vote(proposalId).send({ from: account });

      setVotingStatus(`Successfully voted for Proposal ${proposalId}`);
    } catch (err) {
      setError("Voting failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 flex items-center justify-center ${
              activeTab === "send" ? "bg-purple-100 text-purple-700" : ""
            }`}
            onClick={() => setActiveTab("send")}
          >
            <Send className="mr-2" /> Send ETH
          </button>
          <button
            className={`flex-1 py-4 flex items-center justify-center ${
              activeTab === "vote" ? "bg-purple-100 text-purple-700" : ""
            }`}
            onClick={() => setActiveTab("vote")}
          >
            <Vote className="mr-2" /> Vote
          </button>
        </div>

        <div className="p-6">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center"
            >
              <Wallet className="mr-2" /> Connect Wallet
            </button>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </p>
                <p className="text-xl font-bold text-purple-700">
                  {balance} ETH
                </p>
              </div>

              {activeTab === "send" && (
                <form onSubmit={sendTransaction} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Recipient Address"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Amount in ETH"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.0001"
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-3 rounded-lg hover:opacity-90"
                  >
                    Send ETH
                  </button>
                </form>
              )}

              {activeTab === "vote" && (
                <div className="space-y-4">
                  <button
                    onClick={() => castVote(1)}
                    className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white py-3 rounded-lg hover:opacity-90"
                  >
                    Vote for Proposal 1
                  </button>
                  <button
                    onClick={() => castVote(2)}
                    className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white py-3 rounded-lg hover:opacity-90"
                  >
                    Vote for Proposal 2
                  </button>
                </div>
              )}

              {txnHash && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-green-600">
                    Transaction Hash: {txnHash}
                  </p>
                </div>
              )}

              {votingStatus && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-green-600">{votingStatus}</p>
                </div>
              )}

              {error && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
