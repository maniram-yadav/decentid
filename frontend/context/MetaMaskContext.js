"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import DecentralizedIdentity from '../artifacts/contracts/DecentralizedIdentity.sol/DecentralizedIdentity.json';

const MetaMaskContext = createContext({
  isConnected: false,
  account: null,
  balance: null,
  identity: null,
  contract: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
  createIdentity: () => {},
  updateIdentity: () => {},
  deleteIdentity: () => {},
  refreshIdentity: () => {},
  provider: null,
});

export const MetaMaskProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [logEnabled , setLogEnabled] = useState(true);

  // Contract address - replace with your deployed contract address
  const contractAddress = "0xfabfd950a9a566a8844a7d948a4c91002941e85d"; // Hardhat default

  useEffect(() => {
    const initialize = async () => {
      const provider = await detectEthereumProvider();
      logEnabled && console.log('provider ',provider);
      if (provider) {
        setProvider(provider);
        
        const accounts = await provider.request({ method: 'eth_accounts' });
        logEnabled && console.log('accounts ',accounts);
        if (accounts.length > 0) {
          await handleConnection(accounts[0], provider);
        }
        
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('chainChanged', () => window.location.reload());
      }
    };
    
    initialize();
    
    return () => {
      if (provider) {
        logEnabled && console.log('remove listener');
        provider.removeListener('accountsChanged', handleAccountsChanged);
        provider.removeListener('chainChanged', () => window.location.reload());
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
        logEnabled && console.log('disconnect');
      disconnectWallet();
    } else {
      handleConnection(accounts[0], provider);
    }
  };

  const handleConnection = async (account, provider) => {
    setAccount(account);
    setIsConnected(true);
    logEnabled && console.log('handleconnection',account);
    const web3Provider = new ethers.BrowserProvider(provider);
    const balance = await web3Provider.getBalance(account);
    setBalance(ethers.formatEther(balance));
    
    // Initialize contract
    const signer = await web3Provider.getSigner();
    logEnabled && console.log('signer ',signer);
    const identityContract = new ethers.Contract(
      contractAddress,
      DecentralizedIdentity.abi,
      signer
    );
    setContract(identityContract);
    
    // Check if identity exists
    await refreshIdentity(identityContract, account);
  };

  const connectWallet = async () => {
    try {
      if (!provider) {
        alert('MetaMask is not installed. Please install it to use this feature.');
        return;
      }
      
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      await handleConnection(accounts[0], provider);
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setIdentity(null);
    setContract(null);
    setIsConnected(false);
  };

  const refreshIdentity = async (contractInstance, accountAddress) => {
    try {
      const exists = await contractInstance.registeredAddresses(accountAddress);
      if (exists) {
        const identityData = await contractInstance.getIdentity(accountAddress);
        setIdentity({
          name: identityData.name,
          email: identityData.email,
          age: identityData.age.toString(),
          country: identityData.country,
          exists: identityData.exists
        });
      } else {
        setIdentity(null);
      }
    } catch (error) {
      console.error("Error fetching identity:", error);
      setIdentity(null);
    }
  };

  const createIdentity = async (name, email, age, country) => {
    try {
      const tx = await contract.createIdentity(name, email, age, country);
      await tx.wait();
      await refreshIdentity(contract, account);
      return true;
    } catch (error) {
      console.error("Error creating identity:", error);
      return false;
    }
  };

  const updateIdentity = async (name, email, age, country) => {
    try {
      const tx = await contract.updateIdentity(name, email, age, country);
      await tx.wait();
      await refreshIdentity(contract, account);
      return true;
    } catch (error) {
      console.error("Error updating identity:", error);
      return false;
    }
  };

  const deleteIdentity = async () => {
    try {
      const tx = await contract.deleteIdentity();
      await tx.wait();
      setIdentity(null);
      return true;
    } catch (error) {
      console.error("Error deleting identity:", error);
      return false;
    }
  };

  return (
    <MetaMaskContext.Provider
      value={{
        isConnected,
        account,
        balance,
        identity,
        contract,
        connectWallet,
        disconnectWallet,
        createIdentity,
        updateIdentity,
        deleteIdentity,
        refreshIdentity: () => refreshIdentity(contract, account),
        provider,
      }}
    >
      {children}
    </MetaMaskContext.Provider>
  );
};

export const useMetaMask = () => useContext(MetaMaskContext);