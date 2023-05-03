// 彩票入口组件;
import { useWeb3Contract, useMoralis } from "react-moralis";
import { contractAddress, abi } from "../constants";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNotification } from "@web3uikit/core";

export default function LotteryEntrance() {
  const { chainId: chaiIdHex, isWeb3Enabled } = useMoralis();
  const chainId = parseInt(chaiIdHex);
  const raffleAddress =
    chainId in contractAddress ? contractAddress[chainId][0] : null;
  const [entranceFee, setEntranceFee] = useState("0"); // 前端门票存储
  const [numPlayer, setNumPlayer] = useState("0"); // 前端玩家存储
  const [recentWinner, setRecentWinner] = useState("0"); // 最近获胜者
  console.log(`合约地址：${raffleAddress}`);
  console.log(`链条id：${chainId}`);

  const dispatch = useNotification();

  // 抽奖
  const {
    data: date1,
    error: error1,
    runContractFunction: enterRaffle,
  } = useWeb3Contract({
    // 您可以使用useWeb3Contract挂钩来执行链上功能。您需要提供正确abi的合同、相应的contractAddress、functionName您想要执行的、以及params您需要随函数发送的任何参数 ()。
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "enterRaffle",
    params: {},
    msgValue: ethers.utils.parseEther(entranceFee),
  });
  console.log("错误");
  console.log(error1);
  console.log(date1);
  // 获取彩票的门票费 ，调用合约data, error, runContractFunction, isFetching, isLoading
  // 您可以使用useWeb3Contract挂钩来执行链上功能。您需要提供正确abi的合同、相应的contractAddress、functionName您想要执行的、以及params您需要随函数发送的任何参数 ()。
  const {
    data,
    error,
    runContractFunction: getEntranceFee,
    isFetching,
    isLoading,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getEntranceFee",
    params: {},
  });
  // 获取玩家数量
  const { runContractFunction: getNumberOfPlayers } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getNumberOfPlayers",
    params: {},
  });
  // 获取最近胜利者
  const { runContractFunction: getRecentWinner } = useWeb3Contract({
    abi: abi,
    contractAddress: raffleAddress,
    functionName: "getRecentWinner",
    params: {},
  });
  // 不要钱的 免费的
  async function updateUI() {
    const entranceFeeFromCall = (await getEntranceFee()).toString();
    const numPlayersFromCall = (await getNumberOfPlayers()).toString();
    const recentWinnerFromCall = await getRecentWinner();
    setEntranceFee(ethers.utils.formatUnits(entranceFeeFromCall, "ether")); //门票
    setNumPlayer(numPlayersFromCall); //玩家
    setRecentWinner(recentWinnerFromCall); // 胜利的玩家
  }

  useEffect(() => {
    if (isWeb3Enabled) {
      updateUI();
    }
  }, [isWeb3Enabled]);

  // 成功了会做一个提示
  const handleSuccess = async function (tx) {
    await tx.wait(1);
    // 处理新通知
    handleNewNotification(tx);
    updateUI();
  };
  const handleNewNotification = function () {
    dispatch({
      type: "info",
      message: "交易 Complete!",
      title: "Tx Notification",
      position: "topR",
      icon: "bell",
    });
  };

  return (
    <>
      彩票入口:
      {raffleAddress ? (
        <div className="border-b-2">
          入场费：{entranceFee}ETH
          <button
            onClick={async function () {
              await enterRaffle({
                onSuccess: handleSuccess,
              });
            }}
          >
            抽奖
          </button>
          玩家的数量：{numPlayer}
          胜利的玩家：{recentWinner}
        </div>
      ) : (
        <div>未检测到抽奖地址</div>
      )}
    </>
  );
}
