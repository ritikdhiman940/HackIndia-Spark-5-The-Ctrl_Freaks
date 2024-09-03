import fullLogo from '../full_logo.png';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Navbar() {
  const [connected, setConnected] = useState(false);
  const [currAddress, setCurrAddress] = useState('0x');
  const location = useLocation();

  const getAddress = async () => {
    const ethers = require('ethers');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setCurrAddress(address);
  };

  const updateButton = () => {
    const ethereumButton = document.querySelector('.enableEthereumButton');
    if (ethereumButton) {
      ethereumButton.textContent = 'Connected';
      ethereumButton.classList.remove('bg-blue-500', 'hover:bg-blue-700');
      ethereumButton.classList.add('bg-green-500', 'hover:bg-green-700');
    }
  };

  const connectWebsite = async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0xaa36a7') { // Sepolia chain ID
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      });
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' })
      .then(() => {
        updateButton();
        setConnected(true);
        getAddress();
        window.location.replace(location.pathname);
      });
  };

  useEffect(() => {
    if (window.ethereum === undefined) return;

    const checkConnection = async () => {
      const isConnected = window.ethereum.isConnected();
      if (isConnected) {
        await getAddress();
        setConnected(true);
        updateButton();
      }
    };

    checkConnection();

    window.ethereum.on('accountsChanged', () => {
      window.location.replace(location.pathname);
    });
  }, [location.pathname]);

  return (
    <nav className="w-full bg-gray-900 text-white">
      <ul className="flex items-center justify-between py-3 px-5">
        <li className="flex items-center">
          <Link to="/" className="flex items-center">
            <img src={fullLogo} alt="Logo" width={120} height={120} className="mr-2" />
            <div className="text-xl font-bold">NFT Marketplace</div>
          </Link>
        </li>
        <li className="flex-grow">
          <ul className="flex justify-center space-x-4 text-lg font-bold">
            <li className={location.pathname === '/' ? 'border-b-2 border-white' : ''}>
              <Link to="/">Marketplace</Link>
            </li>
            <li className={location.pathname === '/sellNFT' ? 'border-b-2 border-white' : ''}>
              <Link to="/sellNFT">List My NFT</Link>
            </li>
            <li className={location.pathname === '/profile' ? 'border-b-2 border-white' : ''}>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <button
                className={`enableEthereumButton ${connected ? 'bg-green-500 hover:bg-green-700' : 'bg-blue-500 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded text-sm`}
                onClick={connectWebsite}
              >
                {connected ? 'Connected' : 'Connect Wallet'}
              </button>
            </li>
          </ul>
        </li>
      </ul>
      <div className="text-right px-5 text-sm">
        {currAddress !== '0x' ? `Connected to ${currAddress.substring(0, 15)}...` : 'Not Connected. Please login to view NFTs'}
      </div>
    </nav>
  );
}

export default Navbar;
