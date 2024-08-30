// import { log } from "console";

type FunctionNames =
  | "getBlock"
  | "getBlockReward"
  | "getBlocks"
  | "getGlobalCuttingBoardWeights"
  | "getFriendsOfTheChef"
  | "getTokenInformation"
  | "getUser"
  | "getValidator"
  | "getValidators"
  | "getVault"
  | "getBexGlobalDatas"
  | "getBexGlobalDayDatas"
  | "getPools"
  | "getVaultData"
  | "describeAndDebugTransaction";

export const functions: {
  name: FunctionNames;
  description: string;
  parameters: object;
}[] = [
  {
    name: "getBlock",
    description: "Retrieve detailed information about a specific block on the Berachain network, including its number, timestamp, and associated validator data.",
    parameters: {
      type: "object",
      properties: {
        blockId: {
          type: "string",
          description: "The unique identifier or number of the block",
        },
      },
      required: ["blockId"],
    },
  },
  {
    name: "getBlockReward",
    description: "Fetch information about the rewards distributed for a particular block, including the amount and recipients.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique identifier of the block reward",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "getBlocks",
    description: "Retrieve a list of recent blocks on the Berachain network, providing an overview of recent network activity and validator performance.",
    parameters: {
      type: "object",
      properties: {
        first: {
          type: "number",
          description: "The number of most recent blocks to retrieve",
        },
      },
      required: ["first"],
    },
  },
  {
    name: "getGlobalCuttingBoardWeights",
    description: "Obtain the current global cutting board weights, which determine the distribution of rewards across the network's validators and their delegators.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "getFriendsOfTheChef",
    description: "Retrieve information about the 'friends of the chef' for a specific address, showing relationships and connections within the Berachain ecosystem.",
    parameters: {
      type: "object",
      properties: {
        receiver: {
          type: "string",
          description: "The address of the receiver to query for friends of the chef",
        },
      },
      required: ["receiver"],
    },
  },
  {
    name: "getTokenInformation",
    description: "Fetch detailed information about a specific token on the Berachain network, including its name, symbol, total supply, and other relevant data.",
    parameters: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The unique identifier or address of the token",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "getUser",
    description: "Retrieve comprehensive information about a user, including their validator information, vault deposits, BGT earned, and LP staked data. This provides a holistic view of a user's activity and holdings on the Berachain network.",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The address of the user to query",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "getValidator",
    description: "Fetch detailed information about a specific validator, including their performance metrics, delegation data, BGT emission, and cutting board information. This function accepts either a validator's address or name.",
    parameters: {
      type: "object",
      properties: {
        input: {
          type: "string",
          description: "The address or name of the validator",
        },
      },
      required: ["input"],
    },
  },
  {
    name: "getValidators",
    description: "Retrieve a list of all active validators on the Berachain network, providing an overview of the network's validator set and their key metrics.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "getVault",
    description: "Obtain information about a specific vault, including its address, total value locked, and other relevant metrics.",
    parameters: {
      type: "object",
      properties: {
        address: {
          type: "string",
          description: "The address of the vault to query",
        },
      },
      required: ["address"],
    },
  },
  {
    name: "getBexGlobalDatas",
    description: "Retrieve global data for the Berachain Exchange (BEX), including total value locked, transaction count, and overall volume in USD.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "getBexGlobalDayDatas",
    description: "Fetch daily global data for the Berachain Exchange (BEX) for a specific date, providing insights into daily trading activity and metrics.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "The date for which to retrieve BEX global data (format: YYYY-MM-DD)",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "getPools",
    description: "Retrieve a list of liquidity pools available on the Berachain Exchange (BEX), including their token pairs, liquidity, and other relevant data.",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "getVaultData",
    description: "Fetch comprehensive data about a specific vault, including top BGT farmers, cumulative data, and reward sums. This provides deep insights into the vault's performance and user activity.",
    parameters: {
      type: "object",
      properties: {
        vaultName: {
          type: "string",
          description: "The name of the vault to query (e.g., 'BERPS', 'BEND', 'BEX HONEY-WBTC')",
        },
      },
      required: ["vaultName"],
    },
  },
  {
    name: "describeAndDebugTransaction",
    description: "Provide a detailed description and debug information for a specific transaction on the Berachain network. This includes a human-readable explanation of the transaction's purpose and technical details from the execution trace.",
    parameters: {
      type: "object",
      properties: {
        txHash: {
          type: "string",
          description: "The transaction hash to analyze and debug",
        },
      },
      required: ["txHash"],
    },
  },
];

// Create a generic function that can be used to run any function
export async function runFunction(name: string, args: any) {
  const baseUrl = 'http://localhost:3000';
  const endpointMap: { [key: string]: string } = {
    getBlock: 'block',
    getBlockReward: 'block-reward',
    getBlocks: 'blocks',
    getGlobalCuttingBoardWeights: 'global-cutting-board-weights',
    getFriendsOfTheChef: 'friends-of-the-chef',
    getTokenInformation: 'token-information',
    getUser: 'user',
    getValidator: 'validator',
    getValidators: 'validators',
    getVault: 'vault',
    getBexGlobalDatas: 'bex-global-datas',
    getBexGlobalDayDatas: 'bex-global-day-datas',
    getPools: 'pools',
    getVaultData: 'vault-data',
    describeAndDebugTransaction: 'describe-and-debug-transaction'
  };

  const endpoint = endpointMap[name];
  if (!endpoint) {
    throw new Error(`Unknown function: ${name}`);
  }

  try {
    let url = `${baseUrl}/${endpoint}`;
    let method = 'GET';
    let body;

    if (['getBlocks', 'getBexGlobalDayDatas'].includes(name)) {
      url += `?${new URLSearchParams(args).toString()}`;
    } else if (Object.keys(args).length > 0) {
      url += `/${Object.values(args)[0]}`;
    }

    const response = await fetch(url, { method });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error in runFunction for ${name}:`, error);
    throw error;
  }
}
