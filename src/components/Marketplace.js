import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState, useEffect } from "react";
import { GetIpfsUrlFromPinata } from "../utils";
import { ethers } from "ethers";

export default function Marketplace() {
    const sampleData = [
        {
            "name": "NFT#1",
            "description": "First NFT",
            "website":"http://axieinfinity.io",
            "image":"https://gateway.pinata.cloud/ipfs/QmZfY1YBrWc57B8a9hzF1z9W7qWCV1Jb2N1ooz6t4APdMV",
            "price":"0.03ETH",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
        },
        {
            "name": "NFT#2",
            "description": "Second NFT",
            "website":"http://axieinfinity.io",
<<<<<<< HEAD
            "image":"https://gateway.pinata.cloud/ipfs/QmZfY1YBrWc57B8a9hzF1z9W7qWCV1Jb2N1ooz6t4APdMV",
=======
            "image":"https://gateway.pinata.cloud/ipfs/QmSVyaqvz5jtFTyYhDGthX1czErZC75kdRcEdqVehihabN",
>>>>>>> aefa198cefa6abeba1080aa1f6099cf519cb521c
            "price":"0.03ETH",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        },
        {
            "name": "NFT#3",
            "description": "Third NFT",
            "website":"http://axieinfinity.io",
<<<<<<< HEAD
            "image":"https://gateway.pinata.cloud/ipfs/QmZfY1YBrWc57B8a9hzF1z9W7qWCV1Jb2N1ooz6t4APdMV",
=======
            "image":"https://gateway.pinata.cloud/ipfs/QmYqNxqX59PgLPBVG6K9kaQbtbkGkLk9S577bZ8Sv5AhZ3",
>>>>>>> aefa198cefa6abeba1080aa1f6099cf519cb521c
            "price":"0.03ETH",
            "currentlySelling":"True",
            "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
        },
    ];

    const [data, updateData] = useState(sampleData);
    const [dataFetched, updateFetched] = useState(false);

    useEffect(() => {
        async function fetchNFTs() {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
            let transaction = await contract.getAllNFTs();

            const items = await Promise.all(transaction.map(async i => {
                var tokenURI = await contract.tokenURI(i.tokenId);
                tokenURI = GetIpfsUrlFromPinata(tokenURI);
                let meta = await axios.get(tokenURI);
                meta = meta.data;

                let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
                let item = {
                    price,
                    tokenId: i.tokenId.toNumber(),
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.image,
                    name: meta.name,
                    description: meta.description,
                }
                return item;
            }));

            updateFetched(true);
            updateData(items);
        }

        if (!dataFetched) {
            fetchNFTs();
        }
    }, [dataFetched]);

    return (
        <div className="bg-gray-900 min-h-screen">
            <Navbar />
            <div className="flex flex-col items-center mt-20 p-4">
                <h1 className="text-3xl font-bold text-white mb-8">Top NFTs</h1>
                <div className="flex flex-wrap justify-center gap-6">
                    {data.map((value, index) => (
                        <NFTTile data={value} key={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
