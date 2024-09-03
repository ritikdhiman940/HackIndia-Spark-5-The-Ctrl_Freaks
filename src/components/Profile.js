import Navbar from "./Navbar";
import { useState, useEffect } from "react";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import NFTTile from "./NFTTile";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Profile() {
    const [data, updateData] = useState([]);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNFTData() {
            const ethers = require("ethers");
            let sumPrice = 0;

            try {
                // Initialize provider and contract
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const addr = await signer.getAddress();
                const contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

                // Fetch NFTs
                let transaction = await contract.getMyNFTs();
                const items = await Promise.all(transaction.map(async (i) => {
                    const tokenURI = await contract.tokenURI(i.tokenId);
                    const response = await axios.get(GetIpfsUrlFromPinata(tokenURI));
                    const meta = response.data;

                    const price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                    sumPrice += Number(price);

                    return {
                        price,
                        tokenId: i.tokenId.toNumber(),
                        seller: i.seller,
                        owner: i.owner,
                        image: GetIpfsUrlFromPinata(meta.image),
                        name: meta.name,
                        description: meta.description,
                    };
                }));

                // Update state
                updateData(items);
                updateAddress(addr);
                updateTotalPrice(sumPrice.toFixed(2));
            } catch (error) {
                console.error("Error fetching NFT data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchNFTData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="flex flex-col items-center mt-10 px-5">
                <div className="text-center mb-6 md:text-2xl">
                    <h2 className="font-bold text-xl">Wallet Address</h2>
                    <p>{address}</p>
                </div>

                <div className="flex flex-col md:flex-row text-center justify-center mb-6 md:text-xl">
                    <div className="md:mr-20">
                        <h2 className="font-bold">No. of NFTs</h2>
                        <p>{data.length}</p>
                    </div>
                    <div>
                        <h2 className="font-bold">Total Value</h2>
                        <p>{totalPrice} ETH</p>
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="font-bold text-xl mb-6">Your NFTs</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : data.length === 0 ? (
                        <p className="text-red-500">Oops, No NFT data to display (Are you logged in?)</p>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-4">
                            {data.map((item) => (
                                <NFTTile data={item} key={item.tokenId} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
