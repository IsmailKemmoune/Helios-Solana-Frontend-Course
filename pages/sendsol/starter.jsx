import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import * as web3 from "@solana/web3.js";

const Starter = () => {
  const [recievePubkey, setRecieverPubkey] = useState("");
  const [solAmount, setSolAmount] = useState(0);
  const [error, setError] = useState({ publicKey: null, solAmount: null });
  const [signature, setSignature] = useState(null);
  const [balance, setBalance] = useState(0);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    const getBalance = async () => {
      if (publicKey && connection) {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / web3.LAMPORTS_PER_SOL);
      }
    };
    getBalance();
  }, [publicKey, connection]);

  const handleSendSol = async (e) => {
    e.preventDefault();

    if (!publicKey || !connection) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!recievePubkey) {
      setError({
        publicKey: "Please enter a reciever public key",
        solAmount: null,
      });
      return;
    }

    if (!solAmount) {
      setError({ publicKey: null, solAmount: "Please enter a sol amount" });
      return;
    }

    if (solAmount <= 0 || solAmount > balance) {
      setError({
        publicKey: null,
        solAmount: "Please enter a valid sol amount",
      });
      return;
    }

    try {
      const toPubkey = new web3.PublicKey(recievePubkey);

      const instrcution = web3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey,
        lamports: Math.round(Number(solAmount) * web3.LAMPORTS_PER_SOL),
      });

      const transaction = new web3.Transaction().add(instrcution);

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      transaction.recentBlockhash = blockhash;

      const signature = await sendTransaction(transaction, connection);
      toast.success(`Transaction sent: ${signature}`);
      setSignature(signature);
    } catch (error) {
      toast.error(`Error sending sol: ${error.message}`);
      console.error(error);
    } finally {
      setRecieverPubkey("");
      setSolAmount(0);
      setError({ publicKey: null, solAmount: null });
    }
  };

  return (
    <div>
      <span>Send Sol</span>
      <form>
        <label htmlFor="recieverPubkey">Reciever Public Key</label>
        <input
          id="recieverPubkey"
          type="text"
          value={recievePubkey}
          onChange={(e) => setRecieverPubkey(e.target.value)}
        />
        {error.publicKey && (
          <div className="text-red-500">{error.publicKey}</div>
        )}
        <label htmlFor="solAmount">SOL Amount</label>
        <input
          id="solAmount"
          type="number"
          value={solAmount}
          onChange={(e) => setSolAmount(e.target.value)}
        />
        {error.solAmount && (
          <div className="text-red-500">{error.solAmount}</div>
        )}
        <button
          type="submit"
          disabled={!recievePubkey || !solAmount || !publicKey || !connection}
          onClick={handleSendSol}
          className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
      <span>Balance: {balance}</span>
      {signature && (
        <div>
          Transaction sent:{" "}
          <a
            href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {signature}
          </a>
        </div>
      )}
    </div>
  );
};

export default Starter;
