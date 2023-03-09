import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import {
  DiamondCutFacet__factory,
  PoolConfigInitializer__factory,
} from "../../../../typechain";
import { getConfig } from "../../../utils/config";

const config = getConfig();

const treasury = "0xC44f82b07Ab3E691F826951a6E335E1bC1bB0B51"; // will ask B for this
const fundingInterval = 60 * 60; // 1 hour
const mintBurnFeeBps = 0; // 0% at launch
const taxBps = 0; // 0% at launch
const stableBorrowingRateFactor = 88; // 0.0088% / 1 hour
const fundingRateFactor = 20; // 0.0020% / 1 hour
const borrowingRateFactor = 88; // 0.0088% / 1 hour
const liquidationFeeUsd = ethers.utils.parseUnits("5", 30);

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const deployer = (await ethers.getSigners())[0];

  const poolDiamond = DiamondCutFacet__factory.connect(
    config.Pools.ALP.poolDiamond,
    deployer
  );

  await (
    await poolDiamond.diamondCut(
      [],
      config.Pools.ALP.facets.poolConfigInitializer,
      PoolConfigInitializer__factory.createInterface().encodeFunctionData(
        "initialize",
        [
          treasury,
          fundingInterval,
          mintBurnFeeBps,
          taxBps,
          stableBorrowingRateFactor,
          borrowingRateFactor,
          fundingRateFactor,
          liquidationFeeUsd,
        ]
      )
    )
  ).wait();

  console.log(`Execute diamondCut for InitializePoolConfig`);
};

export default func;
func.tags = ["ExecuteDiamondCut-InitializePoolConfig"];
