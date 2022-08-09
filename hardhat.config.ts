import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-vyper";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
// import "@openzeppelin/contracts-upgradeable";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs: any, hre: any) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// process.env.NODE_ENV= "development";
// console.log(process.env);

const accounts = process.env.PRIVATE_KEY !== undefined ? [ process.env.PRIVATE_KEY ] : [];

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
            // version: "0.7.6",
            version: "0.8.8",
            settings: {
                optimizer: {
                enabled: true,
                runs: 200,
                },
            },
            },
        ],
    },
    vyper: {
        compilers: [
            { version: "0.3.4" }, 
            { version: "0.3.1" }, 
            { version: "0.2.7" }
        ],
    },
    networks: {
        hardhat: {},
        ropsten: {
            url: process.env.ROPSTEN_URL || "",
            accounts,
        },
        mainnet: {
            url: "https://rpc.ankr.com/eth",
            chainId: 1,
            accounts,
        },
        mainnet_fork_10548: {
            url: process.env.MAINNET_FORK_10548_URL || "",
            chainId: 10548,
            accounts,
        },
        mainnet_fork_10547: {
            url: process.env.MAINNET_FORK_10547_URL || "",
            chainId: 10547,
            accounts,
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    mocha: {
        timeout: 400000,
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
};

export default config;
