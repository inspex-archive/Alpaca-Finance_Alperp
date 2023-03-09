import { getImplementationAddress } from "@openzeppelin/upgrades-core";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, tenderly, upgrades } from "hardhat";
import { getConfig, writeConfigFile } from "../utils/config";

const config = getConfig();

const REWARD_TOKEN: string = config.Tokens.USDC;
const POOL: string = config.Pools.ALP.poolDiamond;
const POOL_ROUTER: string = config.PoolRouter;
const ALP_STAKING_PROTOCOL_REVENUE_REWARDER: string = (
  config.Staking.ALPStaking.rewarders.find(
    (o) => o.name === "ALP Staking Protocol Revenue"
  ) as any
).address;
const DEV_FUND_BPS: number = 1400; // 15%
const ALP_STAKING_BPS: number = 7000; // 70%
const GOV_BPS: number = 1000; // 10%
const MERKLE_AIRDROP: string = config.MerkleAirdrop.address;
const REFERRAL_REVENUE_MAX_THRESHOLD: number = 3000; // 30%

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const deployer = (await ethers.getSigners())[0];
  const RewardDistributor = await ethers.getContractFactory(
    "RewardDistributor",
    deployer
  );
  console.log(`> Deploying RewardDistributor Contract`);
  const rewardDistributor = await upgrades.deployProxy(RewardDistributor, [
    REWARD_TOKEN,
    POOL,
    POOL_ROUTER,
    ALP_STAKING_PROTOCOL_REVENUE_REWARDER,
    ALP_STAKING_BPS,
    deployer.address, // TODO: dev fund address
    DEV_FUND_BPS,
    deployer.address, // TODO: gov feeder address
    GOV_BPS,
    deployer.address, // TODO: burner address
    MERKLE_AIRDROP,
    REFERRAL_REVENUE_MAX_THRESHOLD,
  ]);
  console.log(`> ⛓ Tx submitted: ${rewardDistributor.deployTransaction.hash}`);
  console.log(`> Waiting for tx to be mined...`);
  await rewardDistributor.deployTransaction.wait();
  console.log(`> Deployed at: ${rewardDistributor.address}`);

  config.Staking.RewardDistributor.address = rewardDistributor.address;
  config.Staking.RewardDistributor.deployedAtBlock = String(
    await ethers.provider.getBlockNumber()
  );
  writeConfigFile(config);

  const implAddress = await getImplementationAddress(
    ethers.provider,
    rewardDistributor.address
  );

  console.log(`> Verifying contract on Tenderly`);
  await tenderly.verify({
    address: implAddress,
    name: "RewardDistributor",
  });
  console.log(`> ✅ Verified`);
};

export default func;
func.tags = ["RewardDistributor"];
