'use client';
import React, { useEffect, useRef, useState, Fragment } from "react";
import TokenList from "../assets/token_list.json";
import { MdContentCopy } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { addBscNetwork, addEthNetwork, switchNetwork } from "../helpers/useMetamask";
import { ethers } from "ethers";
import { ContractAddress, chain, swapAPI } from "../configs/config"
import api from "../apis/api";

const erc20Abi = require("../abis/erc20Abi.json");
const hiveSwapAbi = require("../abis/hiveSwidge.json").abi;
const {SWIDGE}: any = ContractAddress

const Hive = () => {

  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const [width , setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const useEffectAsync = (effect: any, deps = []) => {
    useEffect(() => {
      effect();
    }, deps);
  };

  const handleWindowResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
  }
  useEffect(() => {
      handleWindowResize()
      window.addEventListener('resize' , handleWindowResize);
      return () => window.removeEventListener('resize' , handleWindowResize);
  }, []);

  function useClickOutside(ref: any, callback: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      }
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const networks = [
    {
      id: 1,
      name: "Ethereum",
      logo: "./ETH.png",
      symbol: "eth",
      displaySymbol: "ETH",
      currency: "ETH",
      rpc_url: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API}`,
      explorer: "https://etherscan.io/",
      allowed: true,
    },
    {
      id: 56,
      name: "Binance Smart Chain",
      logo: "./BNB2.png",
      symbol: "bsc",
      displaySymbol: "BSC",
      currency: "BNB",
      rpc_url: "https://bsc-dataseed.binance.org/",
      explorer: "https://bscscan.com/",
      allowed: true,
    },
  ];
  const [selectedToNetwork, setSelectedToNetwork] = useState({
    symbol: "HIVE",
    logo: "/svgFiles/hive.png",
    name: "HIVE",
  });

  const [networkData, setNetworkData]: any = useState();
  const [isFromNetworkOpen, setIsFromNetworkOpen] = useState(false);
  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
  const [isToCoinOpen, setIsToCoinOpen] = useState(false);
  const [fromTokenData, setFromTokenData]: any = useState({});
  const [coins, setCoins] = useState(TokenList);
  const [toCoins, setToCoins] = useState({symbol: "HIVE", name: "HIVE", logoURI: "/coins/HIVE.png"});
  const [step, setStep] = useState(0);
  const [isconvert, setIsConvert] = useState<boolean>(false);
  const [isapproved, setIsApproved] = useState(false);
  const [isPendingSwap, setIsPendingSwap] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);
  const [getRecieve, setGetRecieve] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [isShown, setIsShown] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<any>(networks[1]);
  const [selectedCoin, setSelectedCoin]: any = useState();
  const [selectedToCoin, setSelectedToCoin]: any = useState(toCoins);

  const [onMobile, setOnMobile] = useState<any>(width > 700 ? false : true);
  const [openSidebar, setOpenSidebar] = useState<boolean>(false);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [convertToken, setConvertToken] = useState(false);

  //details
  const [username, setUsername] = useState<string>("");
  const [fromTokenAmount, setFromTokenAmount] = useState<any>(0.01);
  const [toTokenAmount, setToTokenAmount] = useState<any>(0);

  const [isTokenRelease, setIsTokenRelease] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvalHash, setApprovalHash] = useState<any>();
  const [swapHash, setSwapHash] = useState<any>();
  const [devWidth, setDevWidth] = useState(width);


  const [hiveEx, setHiveEx] = useState<any>(0);

  const prevHiveEx: any = useRef(null);

  const ParseEthUtil = (amount: any, decimal: any) => {
    let response: number = Number(amount) * 10 ** decimal;
    return response;
  };
  let ethereum: any = null;
  if (typeof window !== "undefined") {
    // Boom
    // const { ethereum } = window;
    ethereum = window?.ethereum;
  }


  const getUsdtToHive = async () => {
    if (prevHiveEx.current == null){
      let {data} = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd`);
      let temp = data?.['hive']?.['usd'];
      let res = Number(1/temp);
      prevHiveEx.current = res;
      setHiveEx(res);
    }else {
      setHiveEx(prevHiveEx.current);
    }
  }

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 100) {
      clearInterval(interval);
      setSeconds(0);
    } else if (isActive) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    }else {
      clearInterval(interval);
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);


  useEffect(()=> {
    setOnMobile(width > 700 ? false : true);
    setDevWidth(width);
  },[width])

  useEffect(() => {
    fromTokenData.approvedAmount >= fromTokenAmount ? setIsApproved(true) : setIsApproved(false);
  },[fromTokenData])

  useEffect(() => {
    getUsdtToHive();
  },[])

  let timerId: any;
  useEffect(() => {
    clearTimeout(timerId);
    setGetRecieve(false);
    timerId = setTimeout(async () => {
      try {
        getSwappedPrice(selectedCoin, selectedToCoin);
        setGetRecieve(true);
      } catch (error) {
        console.error("Error:", error);
        setGetRecieve(false);
      }
    }, 1200);
    return () => clearTimeout(timerId);
  }, [selectedCoin, selectedToCoin, fromTokenAmount]);

  const handleChange = (event: any) => {
    setLoading(true);
    setFromTokenAmount(event.target.value);
  };

  const loadWallet = async (networkId?: number) => {
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      const accounts = await signer?.getAddress();
      const { chainId } = await provider.getNetwork();
      const network = {
        account: accounts[0],
        provider: provider,
        chainId: chainId,
        chainName: chain[chainId]?.name,
        graphApi: chain[chainId]?.graphApi,
        proxy: chain[chainId]?.proxy,
        icon: chain[chainId]?.icon,
        txApi: chain[chainId]?.txApi,
      };
      return network;
    } catch (err: any) {
      toastError("user disconnected");
      disconnect();
      return;
    }
  };

  if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
    ethereum.on("chainChanged", () => {
      loadWallet().then((res) => {
        setNetworkData(res);
      });
    });
    ethereum.on("accountsChanged", () => {
      loadWallet().then((res) => {
        setNetworkData(res);
      });
    });
  }

  const getTxn = async () => {
    const Provider = networkData?.provider;
    const swidgeInterface = new ethers.utils.Interface(hiveSwapAbi);
    let usdt = TokenList.filter((el: any) => el?.symbol == "USDT" && el?.chainId == selectedNetwork?.id)[0];
    let txData: any = await axios.get(
      swapAPI +
        "?buyToken=" +
        usdt.address +
        "&sellToken=" +
        selectedCoin?.address +
        "&sellAmount=" +
        ParseEthUtil(fromTokenAmount, selectedCoin?.decimals).toLocaleString("en", { useGrouping: false }) +
        "&chainId=" +
        selectedNetwork?.id
    );
    txData = txData?.data;
    if (txData) {
      let finalTxData = swidgeInterface?.encodeFunctionData("lockHive", [txData?.message?.calldata, username.toLowerCase()]);
      const feeData = await Provider.getFeeData();
      let tx = {
        to: SWIDGE[selectedNetwork?.id],
        data: finalTxData,
        gasLimit: 700000,
        gasPrice: feeData.gasPrice,
        value: selectedCoin.address.toLowerCase() == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ? fromTokenAmount * 10 ** 18 + "" : "0",
      };
      return tx;
    }
  };

  const getSwapData = async () => {
    let tx = null;
    tx = await getTxn();
    console.log("tx", tx);
    return {
      selectedFromToken: selectedCoin,
      selectedToToken: selectedToCoin,
      tx: tx,
      fromAmount: fromTokenAmount + "",
      toAmount: toTokenAmount + "",
    };
  };

  const getFromData = async () => {
    try {
      const fromTokenContract = await new ethers.Contract(selectedCoin?.address, erc20Abi, networkData?.provider);
      let approvedAmount = 0;
      let balance = 0;
      if (selectedCoin?.address.toLowerCase() == "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
        approvedAmount = 1000000000;
        balance = Number(await networkData?.provider.getBalance(networkData?.account)) / 10 ** 18;
        console.log("reached code if", approvedAmount, balance);
      } else {
        approvedAmount = Number(await fromTokenContract.allowance(networkData?.account, SWIDGE[selectedNetwork?.id])) / 10 ** selectedCoin?.decimals;
        balance = Number(await fromTokenContract.balanceOf(networkData?.account)) / 10 ** selectedCoin?.decimals;
        console.log("reached code else", approvedAmount, balance);
      }
      setFromTokenData({
        approvedAmount: approvedAmount,
        balance: balance,
      });

    } catch (err) {
      console.log("reached code err to getFromData function: ", err);
    }
  };

  useEffect(() => {
    getFromData();
  }, [selectedCoin, selectedNetwork, fromTokenAmount, convertToken]);


  useEffectAsync(async () => {
    if (isConnected) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const { chainId } = await provider.getNetwork();

      const network = {
        account: accounts[0],
        provider: provider,
        chainId: chainId,
        chainName: chain[chainId]?.name,
        graphApi: chain[chainId]?.graphApi,
        proxy: chain[chainId]?.proxy,
        icon: chain[chainId]?.icon,
        txApi: chain[chainId]?.txApi,
      };
      setNetworkData(network);
      if (!window.ethereum){
        await addEthNetwork();
        await addBscNetwork();
      }
      setSelectedNetwork(networks.filter((net: any) => net?.id == network?.chainId)[0]);
      switchNetwork(networks.filter((net: any) => net?.id == network?.chainId)[0]?.id);
      const chainCoinsTBC = coins?.filter((coin: any) => coin?.chainId == selectedNetwork?.id && coin?.symbol == "TBC");
      const chainCoins = coins?.filter((coin: any) => coin?.chainId == selectedNetwork?.id);
      setSelectedCoin(selectedCoin ? chainCoins[0] : chainCoinsTBC[0]);
      // setSelectedToCoin(toCoins?.filter((coin: any) => (coin?.symbol == "SPS" || coin?.symbol == "DEC") && coin?.chainId == selectedNetwork?.id)[0]);
    } else {
      setNetworkData();
      setSelectedNetwork(null);
    }
  }, []);

  useEffect(() => {
    switchNetwork(selectedNetwork?.id);
    const chainCoinsTBC = coins?.filter((coin: any) => coin?.chainId == selectedNetwork?.id && coin?.symbol == "TBC");
    const chainCoins = coins?.filter((coin: any) => coin?.chainId == selectedNetwork?.id);
    // setSelectedCoin(selectedCoin ? chainCoins[0] : chainCoinsTBC[0]);
    setSelectedCoin(selectedNetwork.displaySymbol == "ETH" ? chainCoins[0] : chainCoinsTBC[0]);
    // setSelectedToCoin(toCoins?.filter((coin: any) => (coin?.symbol == "SPS" || coin?.symbol == "DEC") && coin?.chainId == selectedNetwork?.id)[0]);
    setIsFromNetworkOpen(false);
  }, [selectedNetwork]);

  const toastError = (textData: any) =>
    toast.error(textData, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const toastProcess = (textData: any) =>
    toast.info(textData, {
      toastId: 2,
      autoClose: 5000,
      position: "top-right",
      hideProgressBar: true,
      closeOnClick: true,
      draggable: true,
      isLoading: true,
      progress: undefined,
    });

  const toastSuccess = (textData: any) =>
    toast.success(textData, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

  const getSwappedPrice = async (fromCoin: any, toCoin: any) => {
    let usdt = TokenList.filter((el) => el?.symbol == "USDT" && el?.chainId == selectedNetwork?.id)[0];
    let amount: number = Number(fromTokenAmount * 10 ** fromCoin?.decimals);
    const params = {
      sellToken: fromCoin?.address,
      buyToken: usdt?.address,
      sellAmount: amount.toLocaleString("en", { useGrouping: false }),
      chainId: selectedNetwork?.id,
    };
    try {
      const { data }: any = await axios.get(swapAPI, { params: params });
      let res = (data?.message?.quote / 10 ** usdt?.decimals) * hiveEx;
      res = res - res*(0.7/100);
      setToTokenAmount(Number(res));
      setLoading(false);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const handleSwap = async () => {
    setStep((prev) => prev + 1);
    try {
      let res = await getSwapData();
      setIsConvert(true);
      sendTransaction(res);
    } catch (err: any) {
      toastError(err?.message.split("(")[0]);
      setStep((prev) => prev - 1);
    }
  };

  const handleSwapClick = async () => {
    fromTokenAmount > Number(fromTokenData?.balance) ? toast.warn("Insufficient Amount") : handleSwap();
  };

  const sendTransaction = async (data: any) => {
    try {
      const provider = networkData?.provider;
      const signer = provider.getSigner();
      const tx = await signer.sendTransaction(data.tx);
      toastProcess("Transaction in Progress");
      setIsPendingSwap(true);
      getTransactionReceiptMined(tx.hash, "continue");
      setSwapHash(tx.hash);
    } catch (err: any) {
      toastError(err.message.split("(")[0]);
      setStep((prev) => prev - 1);
    }
  };

  const isTransactionMined = async (txHash: any) => {
    const provider = networkData?.provider;
    const txReceipt = await provider.getTransactionReceipt(txHash);
    if (txReceipt && txReceipt.blockNumber) {
      return txReceipt;
    }
    return null;
  };

  function getTransactionReceiptMined(txHash: any, type: string) {
    const interval = setInterval(function () {
      isTransactionMined(txHash).then((res) => {
        if (res) {
          clearInterval(interval);
          if (res.status == 1) {
            toastSuccess("Transaction Successful");
            toast.dismiss(2);
            if (type === "continue") {
              setIsSwapped(true);
              handleRelease(txHash);
            } else {
              setIsApproved(true);
            }
          } else {
            toast.dismiss(2);
            toastError("Transaction Failed");
          }
        } else {
        }
      });
    }, 3000);
  }

  const handleRelease = async (hash: any) => {
    try {
      setIsActive(true);
      setIsTokenRelease(false);
      await new Promise((r) => setTimeout(r, 6000)); // wait 4 seconds for rpc syncer to put lockhash in db
      let releaseTxId = null;
      while (!releaseTxId) {
        const data = await api.status({ lockHash: hash });
        if (data.response.data.processed && data.response.data.releaseHash !== "0x0") {
          releaseTxId = data.response.data.releaseHash;
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
      toastSuccess("Tokens Released on Hive Successfully"); 
      setIsActive(false);
      setIsTokenRelease(true);
    } catch (err: any) {
      console.error(err.message);
      handleRelease(hash);
      setIsTokenRelease(false);
      setIsActive(false);
    }
  };

  const approveAmount = async () => {
    try {
      const Provider = networkData.provider;
      const Signer = await Provider.getSigner();
      const fromTokenContract = await new ethers.Contract(selectedCoin?.address, erc20Abi, Signer);
      toastProcess("Confirming Transaction");
      const res = await fromTokenContract.approve(SWIDGE[selectedNetwork?.id], ethers.utils.parseEther("1000000000"));
      setApprovalHash(res.hash);
      getTransactionReceiptMined(res.hash, "approved");
    } catch (err: any) {
      toastError("Transaction Rejected!");
      console.log("error mesage: ", err?.message);
    }
  };
  

  function useOutsideAlerter(ref: any, func: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          func();
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  const verifyPlayerName = async () => {
    try{
      const { response }: any = await api.verifyPlayerName({ account: username.toLowerCase() });
      return response.data?.exists;
    }catch(err){
      toastError("User not verified");
      return false;
    }
  };

  const [verifieduser, setVerfiedUser] = useState(false);
  const verifyuser = async (step: number) => {
    if (!username) {
      toastError(`Please enter a username ${username}`);
      return false;
    }
    if ((await verifyPlayerName())) {
      setStep(step);
      setVerfiedUser(true);
      toastSuccess("user verified");
    }else {
      toastError("user not verified");
    }
  };


  function addCommas(number: number) {
    let parts = number.toString().split(".");
    let integerPart = parts[0];
    let decimalPart = parts[1] || "";

    let reversedInteger: any = integerPart.split("").reverse().join("");
    let commaInteger: any = reversedInteger.match(/\d{1,3}/g).join(",");

    let result = commaInteger.split("").reverse().join("");
    if (decimalPart !== "") {
      result += "." + decimalPart;
    }
    // Return the final result
    return result;
  }

  const [isOpenProfile, setIsProfileOpen] = useState(false);
  const wrapperRef: any = useRef();
  let isOpenRef: any = useRef();
  let showRef: any = useRef();

  let profiletimerId:any;
  useEffect(() => {
    isOpenRef.current = isOpenProfile;

    if (isOpenProfile === true){
      profiletimerId = setTimeout(()=> {
        setShowProfile(true);
      },500)
    }else {
      clearTimeout(profiletimerId);
    }
  }, [isOpenProfile]);

  useClickOutside(wrapperRef, () => {
    if (isOpenRef.current) {
      setIsProfileOpen(false);
    }
  });

  useClickOutside(wrapperRef, () => {
    if (showRef.current){
      setIsShown(false);
    }
  })

  const hashDataCopy = (data: any) => {
    navigator.clipboard.writeText(data);
    setIsProfileOpen(false);
    toastSuccess("address Copied!");
  };

  function OutsideAlerter(props: any) {
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, props.func);

    return <div ref={wrapperRef}>{props.children}</div>;
  }

  const navOptions = [
    {
      name: "Swidge",
      link: "/",
      active: true,
    },
    {
      name: "DEX Proposal",
      link: "https://peakd.com/hive/@terablock-hive/reimbursement-proposal-for-hive-crossdex-milestone-1",
      active: false,
    },
    {
      name: "Rewards",
      link: "https://app.terablock.com/earn",
      active: false,
    },{
      name: "Hive Blog",
      link: "https://peakd.com/@terablock-hive",
      active: false,
    },
    {
      name: "Help Center",
      link: "https://terablock.com/help",
      active: false,
    }
  ]

  const [fromCoinSearch, setFromCoinSearch] = useState("");

  return (
    <div className="w-[100%] h-[100vh] flex flex-col justify-between bg-[#EFEEF5]">
      <nav className="sticky z-[100] top-0 w-[100%] h-[7vh] bg-[#2d3135] flex justify-center">
        <div className="w-[clamp(800px,80%,80%)] h-[100%] flex flex-row justify-between items-center px-5 relative">
          <div className={`w-[100%] h-[100%] flex flex-row ${width > 400 ? "justify-start" : "justify-center"} items-center`}>
            <img className="bg-[#2d3135] h-[50%] w-[auto]" src="/icons/hivelogo02.png" alt="hive"/>
          </div>

          <div className="flex flex-row gap-[1.2rem] items-center justify-end h-[100%] text-[0.8rem]">
            {!(onMobile || width < 700) && navOptions.map((el, ind) => {
              return <div key={ind} className={`cursor-pointer whitespace-nowrap ${width > 800 ? "text-[0.9rem]" : "text-[0.75rem]"} font-semibold font-primary hover:text-[#e31337] transition-all duration-100 ${el?.active ? "text-[#e31337]" : "text-white"}`} onClick={() => {
                el?.link !== "/" && window.open(el?.link)
              }}>{el?.name}</div>
            })}
            {((onMobile || width < 700) || width < 700) ? <div className={`${devWidth > 440 ? "h-[100%] gap-[0.4rem]" : "h-[80%] gap-[0.25rem]"} w-[fit-content] flex flex-col justify-center items-center cursor-pointer z-[10]`} onClick={() => {
            setOpenSidebar(!openSidebar);
          }}>
            {[1,2,3].map((el: number) => {
              return <div key={el} className={`${devWidth > 440 ? "w-[30px] h-[2.5px]" : "w-[20px] h-[2px]"} bg-[#e31337]`}></div>
            })}
            </div> : !isConnected ? (
              <button className={`relative w-[170px] h-[70%] ${width > 800 ? "text-[0.9rem]" : "text-[0.75rem]"} flex flex-row justify-center items-center aspect-rect px-4 text-[white] font-bold text-center bg-[#e31337] rounded-sm hover:bg-[#e31336c8] z-[10]`} onClick={() => {
                connect();
              }}>
                Connect Wallet
              </button>
            ) : (
              <>
              <div className={`relative ${!showProfile && "overflow-hidden"} h-[70%]`}>
                <button className={`flex items-center justify-between h-[100%] bg-[#e31337] w-[170px] transition-all cursor-pointer rounded-md ${isOpenProfile && "rounded-b-none"} duration-200 z-[12] relative`} onClick={() => setIsProfileOpen(!isOpenProfile)}>
                    <div className="w-[100%] rounded-sm relative h-[100%] gap-2 flex flex-row justify-between px-5 z-[10] bg-[#e31337] items-center">
                      <p className="relative bg-[#e31337] h-[100%] z-[10] flex items-center font-semibold text-[white]">{address ? `${address.slice(0, 5)}...${address.slice(-4)}` : ""}</p>
                      <img src="./icons/drop-down-white.png" className={`bg-[#e31337] relative z-[10] w-4 h-4 ${isOpenProfile ? "rotate-[180deg]" : "rotate-[0deg]"} transition-all duration-300`} />
                    </div>
                    <div className={`w-[100%] z-[4] absolute bg-[#e31337] ${showProfile ? "top-[30px]" : "top-[-100px]"} ${isOpenProfile ? "opacity-[1]" : "opacity-[0]"} transition-all duration-500 right-[0px] bg-[#e31337] h-[fit-content] flex flex-col items-center py-2 rounded-sm rounded-t-none`}>
                      <div className="border-t-[2px] w-[80%] border-t-[#ffffff] px-2 pt-2 pb-1 text-center flex flex-col gap-1">
                        <p className="text-[white] font-semibold font-primary text-base cursor-pointer" onClick={() => hashDataCopy('0xEeeEeeeEeeeeEe')}>
                            Copy Address
                        </p>
                        <p className="text-[white] font-semibold font-primary text-base cursor-pointer" onClick={() => open('https://terablock.com/help')} >
                            Contact Support
                        </p>
                        <p className="text-[white] font-semibold font-primary text-base cursor-pointer" onClick={() => {
                          disconnect();
                          setStep(0);
                        }}>
                            Logout
                        </p>
                      </div>
                    </div>
                </button>
              </div>
              </>
            )}
          </div>
        </div>
      </nav>
      {(onMobile || width < 700) && <div className={`fixed w-[200px] z-[101] h-[100%] ${openSidebar ? "right-[0px]" : "right-[-300px]"} ${openSidebar ? "visible" : "hidden"} top-[0px] transition-all duration-500 bg-[#2d3135] py-[1rem]`}>
        <div className="w-[80%] h-[fit-content] flex flex-col gap-[1rem] items-center m-[auto] mt-0 mb-0">
          {isConnected ? <button className="flex items-center gap-2 bg-[#e31337] transition-all relative w-[150px] aspect-rect px-4 md:px-8 py-2 my-1 text-[white] font-bold text-center rounded-sm hover:bg-[#e31336c3] text-sm sm:text-base z-[10]">
            <p className="font-semibold text-[white]">{address ? `${address.slice(0, 5)}...${address.slice(-4)}` : ""}</p>
            <MdContentCopy className="-rotate-90 scale-x-125 scale-y-95 h-[20px] text-[white]" onClick={() => hashDataCopy(address)}/>
          </button> : <button className={`relative w-[150px] aspect-rect px-4 md:px-8 py-2 my-1 text-[white] font-bold text-center rounded-sm bg-[#e31337] hover:bg-[#e31336c8] text-sm sm:text-base z-[10]`} onClick={() => connect()}>
            Connect Wallet
          </button>}
          <div className="flex flex-col gap-3 w-[100%]">
          {navOptions.map((el, ind) => {
          return <div key={ind} className={`cursor-pointer font-normal font-primary hover:text-[#e31337] transition-all duration-100 ${el?.active ? "text-[#e31337]" : "text-white"}`} onClick={() => {
            el?.link !== "/" && window.open(el?.link)
          }}>{el?.name}</div>
          })}
          </div>
        {isConnected && <p className="text-[white] hover:scale-[1.02] transition-all duration-100 mt-3 w-[100%] text-left font-semibold cursor-pointer" onClick={() => {
          disconnect();
          setStep(0);
          setOpenSidebar(false);
        }}>Logout</p>}

        <div className="w-[40px] h-[40px] mt-[2rem] rounded-full border-[1px] border-[white] flex justify-center items-center text-[white] cursor-pointer" onClick={() => setOpenSidebar(false)}>X</div>
      </div>
      </div>}

      <main className="w-[100%] h-[fit-content] flex justify-center py-[2rem] text-[black] my-[2.5rem]">
        <div className={`w-[clamp(350px,80%,400px)] rounded-sm shadow-lg bg-white h-[fit-content] ${width > 300 ? "p-[2.5rem]" : "p-[1.8rem]"} flex flex-col justify-between items-center gap-[1.5rem]`}>
          <div className="flex flex-col text-center w-[100%] gap-[0.5rem]">
            <p className="text-black font-semibold text-[1.5rem] leading-none">Swidge</p>
            <p className="text-black font-[440] text-sm">Buy HIVE with a single click</p>
          </div>
          {step == 0 && <div className="text-[black]">
            <div className="flex flex-col mt-6">
              <label htmlFor="username" className={`${devWidth > 440 ? "text-sm" : "text-xs"} mb-1 font-medium`}>
                Hive Username
              </label>
              <input className={`!outline-none bg-[#f0f0f8] py-[0.5rem] rounded-sm px-4 text-left font-medium ${devWidth < 440 ? "text-[0.7rem]" : "text-[0.9rem]"}`} value={username} onChange={(e: any) => setUsername(e.target.value)} />
              <p className={`text-center ${devWidth < 440 ? "text-[0.65rem]" : "text-[0.7rem]"} mt-1 font-normal`}>Your tokens will be sent here after the conversion</p>
            </div>
            <button
              className={`bg-[#e31337] rounded-sm text-white w-full py-[0.5rem] mt-6 ${devWidth < 440 && "text-[0.8rem]"}`}
              onClick={() => {
                !isConnected && connect();
                verifyuser(1);
              }}
            >
              Continue
            </button>
            <p className={`text-center ${devWidth < 440 ? "text-[0.6rem]" : "text-[0.75rem]"} mt-[2rem] font-bold`}>
              {"Still haven't join hive? join "}
              <a rel="noreferrer" className="underline font-semibold text-[#e31337]" href="https://www.hive.io/wallets/" target="_blank">
                here
              </a>
            </p>
          </div>}
          {(step == 1 && verifieduser) && <div className="flex flex-col w-[100%]">
            <div className="flex justify-between items-center">
              <p className={`${devWidth > 440 ? "text-sm" : "text-xs"}`}>From</p>
              <div className="relative">
                <div className={`flex items-center bg-[#f0f0f8] px-2 py-1 rounded-sm cursor-pointer w-32`} onClick={() => setIsFromNetworkOpen(true)}>
                  <img src={selectedNetwork?.logo} className={`rounded-full ${devWidth < 440 ? "w-3 h-3" : "w-4 h-4"}`} />
                  <p className={`${devWidth > 440 ? "text-sm" : "text-xs"} font-semibold text-[black] px-2 flex-1`}>{selectedNetwork?.displaySymbol}</p>
                  <img src="/drop-down-black.png" className="w-4 h-4" />
                </div>
                {isFromNetworkOpen && (
                  <OutsideAlerter func={() => setIsFromNetworkOpen(false)}>
                    <div className={`${devWidth > 440 ? "w-[230px]" : "w-[200px]"} bg-[#f0f0f8] absolute top-0 right-0 z-30 rounded-b-sm shadow-md rounded-sm p-2 opacity-100`}>
                      <div className="flex justify-between text-[10px] items-center">
                        <p>Popular blockchains</p>
                        <p className="text-sm cursor-pointer" onClick={() => setIsFromNetworkOpen(false)}>
                          x
                        </p>
                      </div>
                      {networks?.map((chain, index) => (
                        <div
                          key={index}
                          className={`flex items-center cursor-pointer text-[black] py-1 pt-2 ${index == networks?.length - 1 && "rounded-b-sm"}`}
                          onClick={async () => {
                            setSelectedNetwork(chain);
                          }}
                        >
                          <img src={chain?.logo} className={`${devWidth > 440 ? "w-4 h-4" : "w-3 h-3"} rounded-full mr-4`} />
                          <p className={`${devWidth > 440 ? "text-xs mr-8" : "text-[0.65rem] mr-4"} font-semibold`}>{chain?.displaySymbol}</p>
                          <p className={`${devWidth > 440 ? "text-xs" : "text-[0.65rem]"} font-semibold`}>{chain?.name}</p>
                        </div>
                      ))}
                    </div>
                  </OutsideAlerter>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center bg-[#f0f0f8] px-3 py-2 rounded-sm mt-2">
              <div className="flex justify-between items-center w-full">
                <p className={`${devWidth > 440 ? "text-sm" : "text-xs"}`}>Convert</p>
                <p className={`${devWidth > 440 ? "text-[0.65rem]" : "text-[0.6rem]"} underline cursor-pointer`} onClick={() => setFromTokenAmount(fromTokenData?.balance || 0)}>
                  Max: {Number(fromTokenData?.balance) == 0 ? 0 : Number(fromTokenData?.balance).toFixed(4) || 0}
                </p>
              </div>
              <div className="mt-2 flex justify-between items-center w-full">
                <input
                  className={`${width < 440 && "text-[0.9rem]"} w-[calc(100%-5rem)] !outline-none bg-[#f0f0f8] text-[black] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                  onChange={handleChange}
                  type="number"
                  placeholder="0"
                  value={fromTokenAmount}
                />
                <div className="relative">
                  <div className={`flex items-center py-1 rounded-md cursor-pointer z-[10] ${devWidth > 440 ? "w-20" : "w-18"}`} onClick={() => setIsFromCoinOpen(true)}>
                    <img src={selectedCoin?.logoURI} className={`${devWidth > 440 ? "w-4 h-4" : "w-4 h-4"} rounded-full`} />
                    <p className={`${devWidth > 440 ? "text-sm" : "text-xs"} font-semibold text-[black] px-2 flex-1`}>{selectedCoin?.symbol}</p>
                    <img src="/drop-down-black.png" className={`${devWidth > 440 ? "w-4 h-4" : "w-3 h-3"}`} />
                  </div>
                  {isFromCoinOpen && (
                    <OutsideAlerter func={() => setIsFromCoinOpen(false)}>
                      <div className="w-[230px] bg-[#f0f0f8] absolute top-0 -right-3 z-30 rounded-b-sm shadow-md rounded-sm border border-[#e31337] opacity-100">
                        <div className="flex items-center justify-between border-b border-[#e31337] pt-2 px-2 pb-1">
                          <img src="/search.svg" className="w-4 h-4" />
                          <input
                            placeholder="Type a Cryptocurrency or Ticker"
                            className="p-1 bg-transparent !outline-none text-xs flex-1 text-[black]"
                            value={fromCoinSearch}
                            key="fromToken"
                            autoFocus={true}
                            onChange={(e) => setFromCoinSearch(e.target.value)}
                          />
                          <p className="text-sm cursor-pointer" onClick={() => setFromCoinSearch("")}>
                            x
                          </p>
                        </div>

                        <div className="max-h-40 overflow-y-auto px-2 mt-2">
                          {coins
                            ?.filter((coin: any) => coin?.symbol == "ETH" || coin?.symbol == "BNB" || coin?.symbol == "USDC" || coin?.symbol == "TBC")
                            ?.filter((coin: any) => coin?.symbol?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase()) || coin?.name?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase()))
                            .length > 0 && (
                            <div className="flex justify-between text-[10px] items-center pb-1">
                              <p>Popular Cryptocurrencies</p>
                            </div>
                          )}
                          {coins
                            ?.filter((coin: any) => coin?.symbol == "ETH" || coin?.symbol == "BNB" || coin?.symbol == "USDC" || coin?.symbol == "TBC")
                            ?.filter((coin: any) => coin?.chainId == selectedNetwork?.id)
                            ?.filter((coin: any) => coin?.symbol?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase()) || coin?.name?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase()))
                            ?.map((crypto: any, index: number) => (
                              <div
                                key={index}
                                className={`flex p-1 items-center cursor-pointer`}
                                onClick={() => {
                                  setSelectedCoin(crypto);
                                  setLoading(true);
                                  setIsFromCoinOpen(false);
                                }}
                              >
                                <img src={crypto?.logoURI} className="w-5 h-5 rounded-full mr-2" />
                                <p className="text-[black] text-xs font-semibold w-[55px]">{crypto?.symbol}</p>
                                <p className="text-[black] text-xs font-semibold">{crypto?.name}</p>
                              </div>
                            ))}
                          {coins
                            ?.filter((coin: any) => coin?.symbol != "ETH" && coin?.symbol != "BNB" && coin?.symbol != "USDC" && coin?.symbol != "TBC")
                            ?.filter((coin: any) => coin?.symbol?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase()) || coin?.name?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase()))
                            .length > 0 && (
                            <div className="flex justify-between text-[10px] items-center pb-1 mt-1">
                              <p>All Cryptocurrencies</p>
                            </div>
                          )}
                          {coins
                            ?.filter((coin: any) => coin?.symbol != "ETH" && coin?.symbol != "BNB" && coin?.symbol != "USDC" && coin?.symbol != "TBC")
                            ?.filter((coin: any) => coin?.chainId == selectedNetwork?.id)
                            ?.filter((coin: any) => coin?.symbol?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase()) || coin?.name?.toLowerCase()?.includes(fromCoinSearch?.toLowerCase()))
                            ?.map((crypto: any, index) => (
                              <div
                                key={index}
                                className={`flex p-1 items-center cursor-pointer`}
                                onClick={() => {
                                  setSelectedCoin(crypto);
                                  setLoading(true);
                                  setIsFromCoinOpen(false);
                                }}
                              >
                                <img src={crypto?.logoURI} className="w-5 h-5 rounded-full mr-2" />
                                <p className="text-[black] text-xs font-semibold w-[55px]">{crypto?.symbol}</p>
                                <p className="text-[black] text-xs font-semibold">{crypto?.name}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    </OutsideAlerter>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6">
              <p className={`${devWidth > 440 ? "text-sm" : "text-xs"}`}>To</p>
              <div className="relative">
                <div className="flex items-center bg-[#f0f0f8] px-2 py-1 rounded-sm w-32">
                  <img src={selectedToNetwork?.logo} className={`${devWidth > 440 ? "w-4 h-4" : "w-3 w-3"} rounded-full`} />
                  <p className={`${devWidth > 440 ? "text-sm" : "text-xs"} font-semibold text-[black] px-2`}>{selectedToNetwork?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center bg-[#f0f0f8] px-3 py-2 rounded-sm mt-2">
              <div className="flex justify-between items-center w-full">
                <p className={`${devWidth > 440 ? "text-sm" : "text-xs"}`}>Receive (estimated)</p>
              </div>
              <div className="mt-2 flex justify-between items-center w-full">
                <p className={`flex-1 ${devWidth < 440 && "text-[0.9rem]"}`}>
                  {loading
                    ? "---.--"
                    : fromTokenAmount == 0 || isNaN(Number(fromTokenAmount)) || fromTokenAmount == null || fromTokenAmount == undefined
                    ? "---,--"
                    : getRecieve
                    ? !loading && addCommas(Number(Number(toTokenAmount * 0.99).toFixed(4)))
                    : "..."}
                </p>
                <div className="relative">
                  <div className={`flex items-center py-1 rounded-md cursor-pointer ${devWidth > 440 ? "w-20" : "w-18"}`} onClick={() => setIsToCoinOpen(true)}>
                    <img src={selectedToCoin?.logoURI} className="w-4 h-4 rounded-full" />
                    <p className={`${devWidth > 440 ? "text-sm" : "text-xs"} font-semibold text-[black] px-2 flex-1`}>{selectedToCoin?.symbol}</p>
                    <img src="/drop-down-black.png" className={`${devWidth > 440 ? "w-4 h-4" : "w-3 h-3"}`} />
                  </div>
                  {isToCoinOpen && (
                    <OutsideAlerter func={() => setIsToCoinOpen(false)}>
                      <div className="w-[230px] bg-[#f0f0f8] absolute top-0 -right-3 z-30 rounded-b-sm shadow-md rounded-sm border border-[#e31337] opacity-100 py-1.5 px-2">
                        <div className="flex justify-between text-[10px] items-center mb-1">
                          <p>Tokens</p>
                          <p className="text-sm cursor-pointer" onClick={() => setIsToCoinOpen(false)}>
                            x
                          </p>
                        </div>
                          <div
                            className={`flex p-1 items-center cursor-pointer`}
                            onClick={() => {
                              setSelectedToCoin(toCoins);
                              setLoading(true);
                              setIsToCoinOpen(false);
                            }}
                          >
                            <img src={toCoins?.logoURI} className="w-5 h-5 rounded-full mr-2" />
                            <p className="text-[black] text-xs font-semibold w-[55px]">{toCoins?.symbol}</p>
                            <p className="text-[black] text-xs font-semibold">{toCoins?.name}</p>
                          </div>
                      </div>
                    </OutsideAlerter>
                  )}
                </div>
              </div>
            </div>
            {isapproved ? (
              <button
                onClick={() => {
                  setIsConvert(false);
                  setIsPendingSwap(false);
                  setIsTokenRelease(false);
                  setIsApproved(false);
                  handleSwapClick();
                }}
                disabled={!networkData || !fromTokenAmount || !toTokenAmount}
                className={`${
                  !networkData || !fromTokenAmount || !toTokenAmount ? "bg-[#e31336c9]" : "bg-[#e31337]"
                } ${devWidth < 440 && "text-[0.85rem]"} text-white w-full py-[0.5rem] rounded-sm mt-6`}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={() => {
                  approveAmount();
                }}
                disabled={!networkData || !fromTokenAmount || !toTokenAmount}
                className={`${
                  !networkData || !fromTokenAmount || !toTokenAmount ? "bg-[#e31336c9]" : "bg-[#e31337]"
                } ${devWidth < 440 && "text-[0.9rem]"} text-white w-full py-[0.5rem] rounded-sm mt-6`}
              >
                Approve
              </button>
            )}
          </div>}
          {step == 2 && <div className="flex flex-col w-[100%] gap-[1rem]">

            {/* VerifyUser */}
            <div className="flex w-full items-center px-4 bg-[#f0f0f8] rounded-md">
              {verifieduser ? (
                <img src="/icons/check-mark.png" className={`aspect-square ${devWidth < 440 ? "w-4" : "w-5"}`} />
              ) : (
                <div className="animate-slow">
                  <img src="/icons/loader.png" className={`aspect-square ${devWidth < 440 ? "w-4" : "w-5"}`} />
                </div>
              )}
              <p className={`text-center w-full py-3 font-semibold ${devWidth < 440 ? "text-[0.7rem]" : "text-[0.8rem]"}`}>
                Username: <span className={`text-[#e31337] font-semibold`}>{username}</span>
              </p>
            </div>
            
            {/* Conversion  */}
            <div className="flex items-center justify-between px-4 bg-[#f0f0f8] rounded-md">
              {isconvert ? (
                <img src="/icons/check-mark.png" className={`${devWidth > 440 ? "w-5" : "w-4"} aspect-square`} />
              ) : (
                <div className="animate-slow">
                  <img src="/icons/loader.png" className={`${devWidth > 440 ? "w-5" : "w-4"} aspect-square`} />
                </div>
              )}
              <p className={`w-full text-center font-semibold py-3 ${devWidth < 440 ? "text-[0.7rem]" : "text-[0.8rem]"}`}>
                Swap:{" "}
                <span className={`text-[#e31337] font-semibold`}>
                  {fromTokenAmount} {selectedCoin?.symbol} to {selectedToCoin?.symbol}
                </span>
              </p>
              <div></div>
            </div>

            {/* Transaction Approval  */}
            <div className="bg-[#f0f0f8] px-4 flex items-center justify-between rounded-md">
              {isPendingSwap ? (
                <img src="/icons/check-mark.png" className={`${devWidth > 440 ? "w-5" : "w-4"} aspect-square`} />
              ) : (
                <div className="animate-slow">
                  <img src="/icons/loader.png" className={`${devWidth > 440 ? "w-5" : "w-4"} aspect-square`} />
                </div>
              )}
              <p className={`text-center text-[#e31337] font-semibold py-3 ${devWidth < 440 ? "text-[0.7rem]" : "text-[0.8rem]"}`}>Transaction Approval</p>
              <div className={`${devWidth > 440 ? "w-5 h-5" : "w-4 h-4"}`}>
                {approvalHash && (
                  <a rel="noreferrer" href={`${selectedNetwork?.explorer}tx/${approvalHash}`} target="_blank">
                    <img className="w-[100%]" src="/link.png" />
                  </a>
                )}
              </div>
            </div>

            {/* Swap Successfull  */}
            <div className="bg-[#f0f0f8] px-4 flex items-center justify-between rounded-md">
              {isSwapped ? (
                <img src="/icons/check-mark.png" className={`${devWidth > 440 ? "w-5" : "w-4"} aspect-square`} />
              ) : (
                <div className="animate-slow">
                  <img src="/icons/loader.png" className={`${devWidth > 440 ? "w-5" : "w-4"} aspect-square`} />
                </div>
              )}
              <p className={`text-center py-3 text-[#e31337] font-semibold ${devWidth < 440 ? "text-[0.7rem]" : "text-[0.8rem]"}`}>Tokens Swap </p>
              <div className={`${devWidth > 440 ? "w-5 h-5" : "w-4 h-4"}`}>
                {swapHash && (
                  <a rel="noreferrer" href={`${selectedNetwork?.explorer}tx/${swapHash}`} target="_blank">
                    <img className="w-[100%]" src="/link.png" />
                  </a>
                )}
              </div>
            </div>
            
            {/* Token Release  */}
            <div className="bg-[#f0f0f8] px-4 flex items-center justify-between rounded-md">
              <div>
                {isTokenRelease ? (
                  <img src="/icons/check-mark.png" className={`${devWidth > 440 ? "w-5" : "w-4"} aspect-square`} />
                ) : (
                  <div className="animate-slow">
                    <img src="/icons/loader.png" className={`${devWidth > 440 ? "w-5" : "w-4"} aspect-square`} />
                  </div>
                )}
              </div>
              <p className={`text-center py-3 font-semibold text-[#e31337] ${devWidth < 440 ? "text-[0.7rem]" : "text-[0.8rem]"}`}>Tokens Release on HIVE</p>
              {(isSwapped && !isTokenRelease) ? <div className={`text-[#e31337] font-semibold font-primary`}>{seconds}</div> : <div></div>}
            </div>

            <div className="flex justify-center mt-6">
              <button
                className={`bg-[#e31337] py-2 text-white w-3/4 rounded-sm ${devWidth < 440 ? "text-[0.7rem]" : "text-[0.8rem]"}`}
                onClick={() => {
                  setIsConvert(false);
                  setIsPendingSwap(false);
                  setIsTokenRelease(false);
                  setIsApproved(false);
                  setStep(1);
                  setConvertToken(!convertToken)
                }}
              >
                Convert Again
              </button>
            </div>
          </div>}
        </div>
      </main>
      <footer className="w-[100%] h-[fit-content] bg-[#2d3135] flex justify-center py-[1rem]">
        <div className={`w-[clamp(800px,80%,80%)] h-[100%] flex ${width > 700 ? "flex-row" : "flex-col gap-[1rem]"} justify-between items-center px-5`}>
          <div className={`${width > 700 ? "w-[50%]" : "w-[100%]"} h-[100%] flex flex-col justify-center gap-[1rem]`}>
            <div className={`w-[100%] flex flex-row ${width > 440 ? "justify-start" : "justify-center"}`}>
              <img className="w-40" src="./icons/terablock.png" alt="" />
            </div>
            <p className={`text-white font-normal ${width < 440 ? "text-center" : "text-justify"} ${width > 700 ? "w-[70%] text-[0.85rem]" : "w-[100%] text-[0.7rem]"} ${width < 440 ? "text-center" : "text-justify"}`}>TeraBlock streamlines DeFi by enabling effortless fiat-to-crypto transactions across any blockchain, merging Web2 simplicity with Web3 innovation. Central to our approach is the Swidge Protocol, which simplifies blockchain interactions with a single click, offering a seamless user experience.</p>
            {!(onMobile || width < 700) && <div className="flex flex-row gap-2 justify-start items-center">
              <img className="h-7 rounded-sm aspect-square cursor-pointer" src="/icons/social/P.png" alt="pinterest" onClick={() => window.open("https://peakd.com/@terablock-hive")}/>
              <img className="h-7 rounded-sm aspect-square cursor-pointer" src="/icons/social/X.png" alt="X" onClick={() => window.open("https://twitter.com/myterablock")} />
              <img className="h-7 rounded-sm aspect-square cursor-pointer" src="/icons/social/Li.png" alt="linkedin" onClick={() => window.open("https://www.linkedin.com/company/myTeraBlock/")} />
              <img className="h-7 rounded-sm aspect-square cursor-pointer" src="/icons/social/Tw.png" alt="twitter" onClick={() => window.open("https://t.me/TeraBlock")} />
            </div>}
          </div>
          <div className={`flex ${width > 700 ? "w-[50%] flex-row justify-end gap-[2rem]" : width > 440 ? "w-[100%] flex-row justify-between gap-[2rem]" : "flex-col gap-[1rem]"} items-center h-[100%]`}>
            <div className={`${width > 440 ? "w-[clamp(230px,50%,280px)]" : "w-[100%]"} ${width > 700 ? "text-[0.85rem]" : "text-[0.7rem]"} h-[fit-content] rounded-md border-[2px] border-[#0052ff] flex flex-col items-center gap-[0.8rem] py-[1rem] px-3`}> 
              <p className="text-white font-semibold text-center leading-4">Get 40% Discount on Transaction Fees</p>
              <p className="text-white font-normal text-center">Stake TeraBlock TBC token and avail upto 40% discount on transaction fees, along withattractive APY earnings</p>
              <button className="bg-[#0052ff] text-white cursor-pointer font-semibold rounded-sm w-[120px] py-1 text-[0.8rem]" onClick={() => {
                window.open(`https://app.terablock.com/earn`)
              }}>Stake Now</button>
            </div>
            <div className={`${width > 440 ? "w-[clamp(230px,50%,280px)]" : "w-[100%]"} ${width > 700 ? "text-[0.85rem]" : "text-[0.7rem]"} h-[fit-content] border-[2px] rounded-md border-[#e31337] flex flex-col items-center gap-[0.8rem] py-[1rem] px-3`}>
              <p className="text-white font-semibold text-center leading-4">Your Vote Matters for HIVE zkCrossDEX</p>
              <p className="text-white font-normal text-center">Shape Hive’s DeFi future! Vote on Hive zkCrossDEX proposal to drive innovation and growth.</p>
              <button className="bg-[#e31337] text-white font-semibold cursor-pointer rounded-sm w-[120px] py-1 text-[0.8rem]" onClick={() => {
                window.open(`https://peakd.com/hive/@terablock-hive/reimbursement-proposal-for-hive-crossdex-milestone-1`)
              }}>Vote Now</button>
            </div>
          </div>
          {(width < 700) && <div className="flex flex-row gap-2 justify-start items-center">
              <img className="h-7 rounded-sm aspect-square cursor-pointer" src="/icons/social/P.png" alt="pinterest" onClick={() => window.open("https://peakd.com/@terablock-hive")}/>
              <img className="h-7 rounded-sm aspect-square cursor-pointer" src="/icons/social/X.png" alt="X" onClick={() => window.open("https://twitter.com/myterablock")} />
              <img className="h-7 rounded-sm aspect-square cursor-pointer" src="/icons/social/Li.png" alt="linkedin" onClick={() => window.open("https://www.linkedin.com/company/myTeraBlock/")} />
              <img className="h-7 rounded-sm aspect-square cursor-pointer" src="/icons/social/Tw.png" alt="twitter" onClick={() => window.open("https://t.me/TeraBlock")} />
            </div>}
        </div>
      </footer>
    </div>
  );
};

export default Hive;
