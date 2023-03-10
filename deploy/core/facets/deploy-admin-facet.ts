import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers, tenderly } from "hardhat";
import { getConfig, writeConfigFile } from "../../utils/config";

const config = getConfig();

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const deployer = (await ethers.getSigners())[0];
  const AdminFacet = await ethers.getContractFactory("AdminFacet", deployer);
  const adminFacet = await AdminFacet.deploy();
  console.log(`Deploying AdminFacet Contract`);
  await adminFacet.deployed();
  console.log(`Deployed at: ${adminFacet.address}`);

  config.Pools.ALP.facets.admin = adminFacet.address;
  writeConfigFile(config);

  await tenderly.verify({
    address: adminFacet.address,
    name: "AdminFacet",
  });
};

export default func;
func.tags = ["AdminFacet"];
