// npm i ethers@6
import { ethers } from "ethers";

// Passet Hub testnet RPC + chain info
// Chain ID: 420420422 ; RPC: https://testnet-passet-hub-eth-rpc.polkadot.io
const RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
const provider = new ethers.JsonRpcProvider(RPC_URL, {
    chainId: 420420422,
    name: "PassetHub-Testnet",
});

const CONTRACT = "0x491D33b74f483b67523b215B5cd7B879B137ca51";

// Minimal ABIs
const ERC165 = [
    "function supportsInterface(bytes4 interfaceId) view returns (bool)"
];

const ERC721_MIN = [
    ...ERC165,
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function tokenURI(uint256 tokenId) view returns (string)",
];

const ERC721_ENUM = [
    "function totalSupply() view returns (uint256)",
    "function tokenByIndex(uint256 index) view returns (uint256)"
];

const ERC1155_MIN = [
    ...ERC165,
    "function uri(uint256 id) view returns (string)"
];

// Event topics
const ERC721_TRANSFER = ethers.id("Transfer(address,address,uint256)");
const ERC1155_TRANSFER_SINGLE = ethers.id("TransferSingle(address,address,address,uint256,uint256)");
const ERC1155_TRANSFER_BATCH = ethers.id("TransferBatch(address,address,address,uint256[],uint256[])");

// Interface IDs
const IID_ERC721 = "0x80ac58cd";
const IID_ERC721_ENUM = "0x780e9d63";
const IID_ERC1155 = "0xd9b67a26";

async function main() {
    const base = new ethers.Contract(CONTRACT, ERC165, provider);

    const [is721, is1155] = await Promise.all([
        base.supportsInterface(IID_ERC721).catch(() => false),
        base.supportsInterface(IID_ERC1155).catch(() => false),
    ]);

    if (!is721 && !is1155) {
        console.log("Contract does not report ERC-721 nor ERC-1155 via ERC165.");
        console.log("Falling back to event scan heuristics (may still work).");
    }

    if (is721) {
        const erc721 = new ethers.Contract(CONTRACT, ERC721_MIN, provider);
        const name = await erc721.name().catch(() => "");
        const symbol = await erc721.symbol().catch(() => "");
        const hasEnum = await base.supportsInterface(IID_ERC721_ENUM).catch(() => false);
        console.log(`ERC-721 ${name} (${symbol})  ${hasEnum ? "[Enumerable]" : ""}`);

        let tokenIds: bigint[] = [];
        if (hasEnum) {
            // Use Enumerable: totalSupply + tokenByIndex
            const enumView = new ethers.Contract(CONTRACT, ERC721_ENUM, provider);
            const total = await enumView.totalSupply();
            for (let i = 0n; i < total; i++) {
                const id = await enumView.tokenByIndex(i);
                tokenIds.push(id);
            }
        } else {
            // No Enumerable: derive IDs from Transfer events
            tokenIds = await collectTokenIdsFromEvents_ERC721(CONTRACT);
        }

        // Fetch tokenURIs if available
        const out = [];
        for (const id of Array.from(new Set(tokenIds)).sort((a, b) => (a < b ? -1 : 1))) {
            let uri = "";
            try { uri = await erc721.tokenURI(id); } catch { }
            out.push({ tokenId: id.toString(), tokenURI: uri || undefined });
        }
        console.log(out);
        return;
    }

    // ERC-1155 path
    if (is1155) {
        const erc1155 = new ethers.Contract(CONTRACT, ERC1155_MIN, provider);
        const ids = await collectTokenIdsFromEvents_ERC1155(CONTRACT);
        const out = [];
        for (const id of Array.from(ids).sort((a, b) => (a < b ? -1 : 1))) {
            let uri = "";
            try { uri = await erc1155.uri(id); } catch { }
            out.push({ tokenId: id.toString(), uri: uri || undefined });
        }
        console.log("ERC-1155 instances:", out);
        return;
    }

    // Fallback (unknown): try both event patterns to discover IDs
    const ids721 = await collectTokenIdsFromEvents_ERC721(CONTRACT);
    const ids1155 = await collectTokenIdsFromEvents_ERC1155(CONTRACT);
    console.log({
        maybe721TokenIds: Array.from(new Set(ids721)).map(String),
        maybe1155TokenIds: Array.from(ids1155).map(String),
    });
}

async function collectTokenIdsFromEvents_ERC721(address: string): Promise<bigint[]> {
    const latest = await provider.getBlockNumber();
    const step = 5_000; // tune to avoid provider limits
    const ids: bigint[] = [];

    for (let from = 0; from <= latest; from += step) {
        const to = Math.min(from + step - 1, latest);
        const logs = await provider.getLogs({
            address,
            fromBlock: from,
            toBlock: to,
            topics: [ERC721_TRANSFER],
        });
        for (const log of logs) {
            // tokenId is the 3rd indexed topic
            const tokenId = BigInt(log.topics[3]);
            ids.push(tokenId);
        }
    }
    return ids;
}

async function collectTokenIdsFromEvents_ERC1155(address: string): Promise<Set<bigint>> {
    const latest = await provider.getBlockNumber();
    const step = 5_000;
    const ids = new Set<bigint>();

    for (let from = 0; from <= latest; from += step) {
        const to = Math.min(from + step - 1, latest);

        // TransferSingle
        {
            const logs = await provider.getLogs({
                address,
                fromBlock: from,
                toBlock: to,
                topics: [ERC1155_TRANSFER_SINGLE],
            });
            for (const log of logs) {
                // decode data: (id, value) are in data; but id is also topic[3] for many impls; be safe and decode
                const [id] = new ethers.AbiCoder().decode(["uint256", "uint256"], log.data);
                ids.add(id);
            }
        }

        // TransferBatch
        {
            const logs = await provider.getLogs({
                address,
                fromBlock: from,
                toBlock: to,
                topics: [ERC1155_TRANSFER_BATCH],
            });
            for (const log of logs) {
                const [idsArr] = new ethers.AbiCoder().decode(["uint256[]", "uint256[]"], log.data);
                for (const id of idsArr as bigint[]) ids.add(id);
            }
        }
    }
    return ids;
}

main().catch(console.error);
