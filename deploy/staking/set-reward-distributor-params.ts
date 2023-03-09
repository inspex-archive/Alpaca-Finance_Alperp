import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { RewardDistributor__factory } from "../../typechain";
import { getConfig } from "../utils/config";

interface RewardDistributorSetParamsArgs {
  rewardToken?: string;
  pool?: string;
  poolRouter?: string;
  alpStakingProtocolRevenue?: string;
  alpStakingBps?: string;
  devFundAddress?: string;
  devFundBps?: string;
  govFeederAddress?: string;
  govBps?: string;
  burner?: string;
  merkleAirdrop?: string;
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const config = getConfig();
  const deployer = (await ethers.getSigners())[0];

  const args: RewardDistributorSetParamsArgs = {
    alpStakingProtocolRevenue: config.Staking.RewardDistributor.address,
    alpStakingBps: "7000",
    devFundAddress: deployer.address, // TODO: devFund address here
    devFundBps: "1400",
    govFeederAddress: deployer.address, // TODO: govFeer address here
    govBps: "1000",
    burner: deployer.address, // TODO: burner address here
  };

  const rewardDistributor = RewardDistributor__factory.connect(
    config.Staking.RewardDistributor.address,
    deployer
  );

  const [
    prevRewardToken,
    prevPool,
    prevPoolRouter,
    prevAlpStakingProtocolRevenue,
    prevAlpStakingBps,
    prevDevFundAddress,
    prevDevFundBps,
    prevGovFeederAddress,
    prevGovBps,
    prevBurner,
    prevMerkleAirdrop,
  ] = await Promise.all([
    await rewardDistributor.rewardToken(),
    await rewardDistributor.pool(),
    await rewardDistributor.poolRouter(),
    await rewardDistributor.alpStakingProtocolRevenueRewarder(),
    await rewardDistributor.alpStakingBps(),
    await rewardDistributor.devFundAddress(),
    await rewardDistributor.devFundBps(),
    await rewardDistributor.govFeeder(),
    await rewardDistributor.govBps(),
    await rewardDistributor.burner(),
    await rewardDistributor.merkleAirdrop(),
  ]);

  console.log(`> Setting reward distributor params`);
  const tx = await rewardDistributor.setParams(
    args.rewardToken || prevRewardToken,
    args.pool || prevPool,
    args.poolRouter || prevPoolRouter,
    args.alpStakingProtocolRevenue || prevAlpStakingProtocolRevenue,
    args.alpStakingBps || prevAlpStakingBps,
    args.devFundAddress || prevDevFundAddress,
    args.devFundBps || prevDevFundBps,
    args.govFeederAddress || prevGovFeederAddress,
    args.govBps || prevGovBps,
    args.burner || prevBurner,
    args.merkleAirdrop || prevMerkleAirdrop
  );
  console.log(`> ⛓ Tx submitted: ${tx.hash}`);
  console.log(`> Waiting for tx to be mined...`);
  await tx.wait();
  console.log(`> Tx is mined`);
  console.log(`> ✅ Done`);
};

export default func;
func.tags = ["SetRewardDistributorParams"];
