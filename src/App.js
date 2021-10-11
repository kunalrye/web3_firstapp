import React, { useEffect, useState } from "react";
// import * as React from 'react';
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
    /*
    * Just a state variable we use to store our user's public wallet.
    */
    
    const [currentAccount, setCurrentAccount] = useState("");
    const [allWaves, setAllWaves] = useState([]);
    const contractAddress = '0x36ac6Df722E7b9B0FFE5c441026EB5035557ABAf';
    const [MsgValue, setMsgValue] = React.useState("")

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

    const contractABI = abi.abi;

    const checkIfWalletIsConnected = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                console.log("Make sure you have metamask!");
                return;
            } else {
                console.log("We have the ethereum object", ethereum);
            }

            /*
            * Check if we're authorized to access the user's wallet
            */
            const accounts = await ethereum.request({ method: 'eth_accounts' });

            if (accounts.length !== 0) {
                const account = accounts[0];
                console.log("Found an authorized account:", account);
                setCurrentAccount(account)
                getAllWaves();
            } else {
                console.log("No authorized account found")
            }
        } catch (error) {
            console.log(error);
        }
    }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
      // getAllWaves();
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);


        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        // const waveTxn = await wavePortalContract.wave("this is a message")
        const waveTxn = await wavePortalContract.wave(MsgValue,{gasLimit:300000});
        
        // const waveTxn = await wavePortalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      setMsgValue("Failed...")
    }
      finally {
        setMsgValue("");
      }
  }
  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        🤝 Let's make a deal
        </div>

        <div className="bio">
        Wanna make a deal with me via ETH?
        </div>

        <textarea name="msgArea"
            placeholder="what are the terms of this deal?"
            type="text"
            className="message"
            value={MsgValue}
            onChange={e => setMsgValue(e.target.value)} />

        <button className="waveButton" onClick={wave}>
          You 🤝 Me
        </button>

        <div className="bio2">
        To be forever sealed in the testnet
        </div>
        
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <div className='bio3'> View Previous Deals 👀</div>

        <div className='history'>
        {allWaves.map((wave, index) => {
          return (
            
            <div key={index} style={{ marginTop: "16px", padding: "10px",borderRadius:'10px', backgroundColor: '#BCD9FF', fontSize:'10px'}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
        </div>

      </div>
    </div>
  );
}

export default App