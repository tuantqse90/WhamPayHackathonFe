// lib/batchBalances.ts
import { ethers } from "ethers";

export const BASE_MAINNET_RPC_URL = "https://testnet-passet-hub-eth-rpc.polkadot.io";
export const provider = new ethers.JsonRpcProvider(BASE_MAINNET_RPC_URL);
export const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";
export const MULTICALL_ABI_ETHERS = [
  "function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)",
];
export const ERC20_ABI = ["function balanceOf(address owner) view returns (uint256)"];
export const ERC20_INFO_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

export type TokenInfo = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  success: boolean;
};

export const batchBalancesOf = async (
  calls: Array<{ address: string; token: string }>
): Promise<{ address: string; token: string; balance: bigint; success: boolean }[]> => {
  if (calls.length === 0) return [];

  const multicall = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI_ETHERS, provider);
  const erc20Interface = new ethers.Interface(ERC20_ABI);

  const multicallData = calls.map((call) => ({
    target: call.token,
    allowFailure: true,
    callData: erc20Interface.encodeFunctionData("balanceOf", [call.address]),
  }));

  try {
    const results = await multicall.aggregate3.staticCall(multicallData);
    return calls.map((call, index) => {
      const result = results[index];
      let balance = BigInt(0);
      let success = false;
      if (result.success && result.returnData !== "0x") {
        try {
          const decoded = erc20Interface.decodeFunctionResult("balanceOf", result.returnData);
          balance = BigInt(decoded[0]);
          success = true;
        } catch {}
      }
      return {
        address: call.address,
        token: call.token,
        balance,
        success,
      };
    });
  } catch (error) {
    console.error("Batch balances failed:", error);
    return calls.map((call) => ({
      address: call.address,
      token: call.token,
      balance: BigInt(0),
      success: false,
    }));
  }
};
// Fetch balance for a single wallet + token
export async function fetchWalletBalance(
  walletAddress: string,
  tokenAddress: string,
  decimals: number = 18
): Promise<string> {
  if (!walletAddress || !tokenAddress) return "0";
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await contract.balanceOf(walletAddress);
    return ethers.formatUnits(balance, decimals);
  } catch (e) {
    return "0";
  }
}
export const fetchEthBalances = async (addresses: string[]) => {
  if (!addresses.length) return [];
  const balances = await Promise.all(
    addresses.map(async (address) => {
      try {
        const balance = await provider.getBalance(address);
        return {
          address,
          ethBalance: ethers.formatUnits(balance, 18),
        };
      } catch {
        return { address, ethBalance: "--" };
      }
    })
  );
  return balances;
};
export const fetchWalletBalances = async ({
  addresses,
  buyToken,
  sellToken,
  buyTokenDecimals = 18,
  sellTokenDecimals = 18,
}: {
  addresses: string[];
  buyToken?: string;
  sellToken?: string;
  buyTokenDecimals?: number;
  sellTokenDecimals?: number;
}) => {
  if (!addresses.length) return [];

  const calls: Array<{ address: string; token: string }> = [];
  if (buyToken) {
    calls.push(...addresses.map((address) => ({ address, token: buyToken })));
  }
  if (sellToken && sellToken !== buyToken) {
    calls.push(...addresses.map((address) => ({ address, token: sellToken })));
  }
  if (!calls.length) return [];

  const balances = await batchBalancesOf(calls);

  return addresses.map((address) => {
    let sellTokenBalance = "0";
    let buyTokenBalance = "0";
    if (sellToken) {
      const sell = balances.find((b) => b.address === address && b.token === sellToken);
      sellTokenBalance = sell?.success ? ethers.formatUnits(sell.balance, sellTokenDecimals) : "0";
    }
    if (buyToken) {
      const buy = balances.find((b) => b.address === address && b.token === buyToken);
      buyTokenBalance = buy?.success ? ethers.formatUnits(buy.balance, buyTokenDecimals) : "0";
    }
    return {
      id: address,
      address,
      sellTokenBalance,
      buyTokenBalance,
    };
  });
};

export const getTokenInfo = async (tokenAddress: string): Promise<TokenInfo> => {
  try {
    if (!ethers.isAddress(tokenAddress)) throw new Error("Not a valid address");
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_INFO_ABI, provider);

    const [name, symbol, decimals] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
    ]);

    return {
      address: tokenAddress,
      name,
      symbol,
      decimals,
      success: true,
    };
  } catch (error) {
    console.error("Error getting token info:", error);
    throw error;
  }
};

export const getBatchTokenInfo = async (tokens: string[]): Promise<TokenInfo[]> => {
  if (tokens.length === 0) return [];

  const multicall = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI_ETHERS, provider);
  const erc20Interface = new ethers.Interface(ERC20_INFO_ABI);

  const multicallData: Array<{ target: string; allowFailure: boolean; callData: string }> = [];

  tokens.forEach((token) => {
    multicallData.push({
      target: token,
      allowFailure: true,
      callData: erc20Interface.encodeFunctionData("name", []),
    });
    multicallData.push({
      target: token,
      allowFailure: true,
      callData: erc20Interface.encodeFunctionData("symbol", []),
    });
    multicallData.push({
      target: token,
      allowFailure: true,
      callData: erc20Interface.encodeFunctionData("decimals", []),
    });
  });

  try {
    const results = await multicall.aggregate3.staticCall(multicallData);

    return tokens.map((token, i) => {
      const [nameResult, symbolResult, decimalsResult] = [
        results[i * 3],
        results[i * 3 + 1],
        results[i * 3 + 2],
      ];
      let name = "",
        symbol = "";
      let decimals = 0;
      let success = false;

      try {
        if (nameResult.success && nameResult.returnData !== "0x")
          name = erc20Interface.decodeFunctionResult("name", nameResult.returnData)[0];
        if (symbolResult.success && symbolResult.returnData !== "0x")
          symbol = erc20Interface.decodeFunctionResult("symbol", symbolResult.returnData)[0];
        if (decimalsResult.success && decimalsResult.returnData !== "0x")
          decimals = Number(
            erc20Interface.decodeFunctionResult("decimals", decimalsResult.returnData)[0]
          );
        success = symbolResult.success && decimalsResult.success;
      } catch (e) {
        // Ignore decode errors
      }
      return { address: token, name, symbol, decimals, success };
    });
  } catch (err) {
    console.error("Batch token info failed:", err);
    return tokens.map((token) => ({
      address: token,
      name: "",
      symbol: "",
      decimals: 0,
      success: false,
    }));
  }
};
