import Navbar from "./Navbar";
import { useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage() {
    const [data, updateData] = useState({});
    const [dataFetched, updateDataFetched] = useState(false);
    const [message, updateMessage] = useState("");
    const [currAddress, updateCurrAddress] = useState("0x");

    const { tokenId } = useParams();

    useEffect(() => {
        async function fetchNFTData() {
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const addr = await signer.getAddress();
            const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

            try {
                let tokenURI = await contract.tokenURI(tokenId);
                const listedToken = await contract.getListedTokenForId(tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;

                let item = {
                    price: meta.price,
                    tokenId: tokenId,
                    seller: listedToken.seller,
                    owner: listedToken.owner,
                    image: GetIpfsUrlFromPinata(meta.image),
                    name: meta.name,
                    description: meta.description,
                };
                updateData(item);
                updateDataFetched(true);
                updateCurrAddress(addr);
            } catch (error) {
                console.error("Error fetching NFT data:", error);
                updateMessage("Error fetching NFT data.");
            }
        }

        fetchNFTData();
    }, [tokenId]);

    const buyNFT = async () => {
        try {
            const ethers = require("ethers");
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            const salePrice = ethers.utils.parseUnits(data.price, 'ether');

            updateMessage("Buying the NFT... Please Wait (Up to 5 mins)");

            const transaction = await contract.executeSale(tokenId, { value: salePrice });
            await transaction.wait();

            alert('You successfully bought the NFT!');
            updateMessage("");
        } catch (error) {
            console.error("Error buying NFT:", error);
            alert("Purchase Error: " + error.message);
            updateMessage("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-800 text-white">
            <Navbar />
            <div className="flex flex-col items-center mt-10 p-5">
                <div className="flex flex-col md:flex-row max-w-4xl w-full">
                    <img src={data.image} alt={data.name} className="w-full md:w-2/5 rounded-lg shadow-lg" />
                    <div className="md:ml-10 mt-5 md:mt-0 p-5 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
                        <h2 className="text-2xl font-bold mb-4">{data.name}</h2>
                        <p className="mb-4"><span className="font-semibold">Description:</span> {data.description}</p>
                        <p className="mb-4"><span className="font-semibold">Price:</span> {data.price} ETH</p>
                        <p className="mb-4"><span className="font-semibold">Owner:</span> <span className="text-sm">{data.owner}</span></p>
                        <p className="mb-4"><span className="font-semibold">Seller:</span> <span className="text-sm">{data.seller}</span></p>
                        {currAddress !== data.owner && currAddress !== data.seller ? (
                            <button
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                                onClick={buyNFT}
                            >
                                Buy this NFT
                            </button>
                        ) : (
                            <p className="text-emerald-700">You are the owner of this NFT</p>
                        )}
                        {message && <div className="text-green-500 mt-3 text-center">{message}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
