import { useMoralis } from "react-moralis";
import { useEffect } from "react";

export default function ManualHeader() {
  const {
    enableWeb3, //开启web3
    account, //账户
    isWeb3Enabled, //判断web3是否开启
    Moralis, //道德(框架)
    deactivateWeb3, //  停止使用web3
    isWeb3EnableLoading, // 检查是否弹出小狐狸
  } = useMoralis();

  useEffect(() => {
    // 检查是否开启we3
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      // 连接之后会存入一个数值，检测这个数值有没有，有的话就开启。
      if (window.localStorage.getItem("connected")) {
        // 开启Web3
        enableWeb3();
      }
    }
  }, [isWeb3Enabled]);

  useEffect(() => {
    // 切换账户输出(切换账户会调用此方法)
    Moralis.onAccountChanged((account) => {
      console.log(`账户输出：${account}`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        // 停止使用Web3
        deactivateWeb3();
        console.log("空账户");
      }
    });
  });

  return account ? (
    <div>
      已经连接上账户：
      {account.slice(0, 6)}...
      {account.slice(account.length - 4, account.length)}
    </div>
  ) : (
    <div>
      <button
        onClick={async () => {
          await enableWeb3();
          if (typeof window !== "undefined") {
            window.localStorage.setItem("connected", "injected");
          }
        }}
        disabled={isWeb3EnableLoading} //等于是web三启动加载 ：这里的意思这个按钮点击加载了，按钮会变成灰色。
      >
        连接小狐狸
      </button>
    </div>
  );
}
