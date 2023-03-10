import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";
import { ERC20__factory, Orderbook__factory } from "../../typechain";
import { getConfig } from "../utils/config";

const config = getConfig();

const ORDERBOOK = config.Pools.ALP.orderbook;
const COLLATERAL_TOKEN = config.Tokens.BTCB;
const INDEX_TOKEN = config.Tokens.BTCB;
const isLong = true;

enum Exposure {
  LONG,
  SHORT,
}

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const deployer = (await ethers.getSigners())[0];
  const orderbook = Orderbook__factory.connect(ORDERBOOK, deployer);
  const collateralToken = ERC20__factory.connect(COLLATERAL_TOKEN, deployer);
  const decimals = await collateralToken.decimals();

  await (
    await collateralToken.approve(
      orderbook.address,
      ethers.constants.MaxUint256
    )
  ).wait();

  await (
    await orderbook.executeIncreaseOrder(
      deployer.address,
      1,
      0,
      deployer.address
    )
  ).wait();
  console.log(`Execute executeIncreaseOrder`);
};

export default func;
func.tags = ["ExecuteIncreaseLimitOrder"];
