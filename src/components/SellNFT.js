import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { ethers } from "ethers";

export default function SellNFT() {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: '' });
    const [fileURL, setFileURL] = useState(null);
    const [message, updateMessage] = useState('');

    const disableButton = () => {
        const listButton = document.getElementById("list-button");
        listButton.disabled = true;
        listButton.style.backgroundColor = "grey";
        listButton.style.opacity = 0.3;
    };

    const enableButton = () => {
        const listButton = document.getElementById("list-button");
        listButton.disabled = false;
        listButton.style.backgroundColor = "#A500FF";
        listButton.style.opacity = 1;
    };

    const OnChangeFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            disableButton();
            updateMessage("Uploading image... Please don't click anything!");
            const response = await uploadFileToIPFS(file);
            if (response.success) {
                setFileURL(response.pinataURL);
                updateMessage("");
            }
        } catch (e) {
            console.error("Error during file upload:", e);
        } finally {
            enableButton();
        }
    };

    const uploadMetadataToIPFS = async () => {
        const { name, description, price } = formParams;
        if (!name || !description || !price || !fileURL) {
            updateMessage("Please fill all the fields!");
            return null;
        }

        const nftJSON = { name, description, price, image: fileURL };
        try {
            const response = await uploadJSONToIPFS(nftJSON);
            if (response.success) {
                return response.pinataURL;
            }
        } catch (e) {
            console.error("Error uploading JSON metadata:", e);
        }
        return null;
    };

    const listNFT = async (e) => {
        e.preventDefault();

        try {
            const metadataURL = await uploadMetadataToIPFS();
            if (!metadataURL) return;

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            disableButton();
            updateMessage("Uploading NFT... Please don't click anything!");

            const contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const price = ethers.utils.parseUnits(formParams.price, 'ether');
            const listingPrice = (await contract.getListPrice()).toString();

            const transaction = await contract.createToken(metadataURL, price, { value: listingPrice });
            await transaction.wait();

            alert("Successfully listed your NFT!");
            updateMessage("");
            updateFormParams({ name: '', description: '', price: '' });
            window.location.replace("/");
        } catch (e) {
            alert("Upload error: " + e.message);
        } finally {
            enableButton();
        }
    };

    return (
        <div>
            <Navbar />
            <div className="flex flex-col items-center mt-10" id="nftForm">
                <form className="bg-magenta-400 shadow-md rounded px-8 pt-4 pb-8 mb-4" onSubmit={listNFT}>
                    <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                    <div className="mb-4">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="name"
                            type="text"
                            placeholder="Axie#4563"
                            onChange={e => updateFormParams({ ...formParams, name: e.target.value })}
                            value={formParams.name}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                        <textarea
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            cols="40"
                            rows="5"
                            id="description"
                            placeholder="Axie Infinity Collection"
                            value={formParams.description}
                            onChange={e => updateFormParams({ ...formParams, description: e.target.value })}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            type="number"
                            placeholder="Min 0.01 ETH"
                            step="0.01"
                            value={formParams.price}
                            onChange={e => updateFormParams({ ...formParams, price: e.target.value })}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                        <input
                            type="file"
                            onChange={OnChangeFile}
                        />
                    </div>
                    <div className="text-red-00 text-center mb-4">{message}</div>
                    <button
                        type="submit"
                        className="font-bold mt-10 w-full bg-red-500 text-white rounded p-2 shadow-lg"
                        id="list-button"
                    >
                        List NFT
                    </button>
                </form>
            </div>
        </div>
    );
}
