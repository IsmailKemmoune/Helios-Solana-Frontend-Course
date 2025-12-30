import { useEffect, useState } from "react";
import * as web3 from "@solana/web3.js";
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";
import * as walletAdapterReact from "@solana/wallet-adapter-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

const Starter = () => {
  const [balance, setBalance] = useState<number | null>(0);

  const endpoint = web3.clusterApiUrl("devnet");

  const phantomWalletAdapter = new walletAdapterWallets.PhantomWalletAdapter();
  const solflareWalletAdapter =
    new walletAdapterWallets.SolflareWalletAdapter();

  const wallets = [phantomWalletAdapter, solflareWalletAdapter];

  const { connection } = useConnection();

  const { publicKey } = useWallet();

  useEffect(() => {
    const getInfo = async () => {
      if (connection && publicKey) {
        const info = await connection.getAccountInfo(publicKey);
        setBalance(info!.lamports / web3.LAMPORTS_PER_SOL);
      }
    };
    getInfo();
  }, [publicKey, connection]);

  return (
    <walletAdapterReact.ConnectionProvider endpoint={endpoint}>
      <walletAdapterReact.WalletProvider wallets={wallets}>
        <WalletModalProvider>
          <main className="min-h-screen text-white">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
              <div className="col-span-1 lg:col-start-2 lg:col-end-4 rounded-lg bg-[#2a302f] h-60 p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-semibold">account info ✨</h2>
                  {/* button component for connecting to solana wallet */}
                </div>

                <div className="mt-8 bg-[#222524] border-2 border-gray-500 rounded-lg p-2">
                  <ul className="p-2">
                    <li className="flex justify-between">
                      <p className="tracking-wider">Wallet is connected...</p>
                      <p className="text-helius-orange italic font-semibold">
                        {publicKey ? "yes" : "no"}
                      </p>
                    </li>

                    <li className="text-sm mt-4 flex justify-between">
                      <p className="tracking-wider">Balance...</p>
                      <p className="text-helius-orange italic font-semibold">
                        {balance}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </WalletModalProvider>
      </walletAdapterReact.WalletProvider>
    </walletAdapterReact.ConnectionProvider>
  );
};

export default Starter;
