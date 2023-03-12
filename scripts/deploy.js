// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, upgrades, run , network} = require("hardhat");
require("@openzeppelin/hardhat-upgrades");

async function main() {
	/* const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = hre.ethers.utils.parseEther("1"); */

	const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
	const nftMarket = await upgrades.deployProxy(NFTMarketplace, []);
	//const upg = await hre.upgrades.upgradeProxy("0x5FbDB2315678afecb367f032d93F642f64180aa3", RizanUG);
	//const rizanug = await RizanUG.deploy();
	await nftMarket.deployed();
	console.log(`NFT Marketplace deployed to: ${nftMarket.address}`);

  if (network.config.chainId == 5 && process.env.ETHERSCAN_API_KEY != undefined) {
    await nftMarket.deployTransaction.wait(4);
    await verify(nftMarket.address, []);
  } else {
    console.log("Contract not verified on Etherscan.");
  }
}

async function verify(contractAddress, args) {
	console.log("Verifying contract on Etherscan...");
	try {
		await run("verify:verify", {
			address: contractAddress,
			constructorArguments: args,
		});
	} catch (e) {
		if (e.message.toLowerCase().includes("already verified")) {
			console.log("Contract already verified on Etherscan.");
		} else {
			console.log("Error while verifying contract on Etherscan.");
		}
	}
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
