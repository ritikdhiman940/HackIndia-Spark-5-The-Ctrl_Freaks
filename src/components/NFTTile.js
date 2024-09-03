import { Link } from "react-router-dom";
import { GetIpfsUrlFromPinata } from "../utils";

function NFTTile({ data }) {
    const { tokenId, image, name, description } = data;
    const newTo = `/nftPage/${tokenId}`;
    const IPFSUrl = GetIpfsUrlFromPinata(image);

    return (
        <Link to={newTo}>
            <div className="border-2 border-gray-700 ml-12 mt-5 mb-12 flex flex-col items-center rounded-lg w-48 md:w-72 shadow-lg transition-transform transform hover:scale-105">
                <img 
                    src={IPFSUrl} 
                    alt={name} 
                    className="w-full h-60 md:h-72 rounded-t-lg object-cover"
                    crossOrigin="anonymous" 
                />
                <div className="text-white w-full p-4 bg-gradient-to-t from-gray-800 to-transparent rounded-b-lg">
                    <strong className="text-xl">{name}</strong>
                    <p className="text-sm mt-2">{description}</p>
                </div>
            </div>
        </Link>
    );
}

export default NFTTile;
