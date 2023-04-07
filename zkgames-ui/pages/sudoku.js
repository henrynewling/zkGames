import Board from "../components/sudoku/board";
import React, { useContext, useEffect, useState } from "react";
import NumbersKeyboard from "../components/sudoku/numbersKeyboard";
import Head from "next/head";
import GoBack from "../components/goBack";
import styles from "../styles/Sudoku.module.css";
import {
  useAccount,
  useConnect,
  useContract,
  useProvider,
  useSigner,
  useContractEvent,
  useNetwork,
} from "wagmi";

import { switchNetwork } from "../utils/switchNetwork";

import networks from "../utils/networks.json";

import { sudokuCalldata } from "../zkproof/sudoku/snarkjsSudoku";

import contractAddress from "../utils/contractaddress.json";

import sudokuContractAbi from "../utils/abiFiles/Sudoku/Sudoku.json";

import IconService from 'icon-sdk-js';
import { StoreContext } from "../store/useStore";
import BigNumber from 'bignumber.js';

const provider = new IconService.HttpProvider(networks['39'].rpcUrls[0]);
const iconService = new IconService(provider);

let sudokuBoolInitialTemp = [
  [false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false],
  [false, false, false, false, false, false, false, false, false],
];

export default function Sudoku() {
  const [sudokuInitial, setSudokuInitial] = useState([]);
  const [sudoku, setSudoku] = useState([]);
  const [sudokuBoolInitial, setSudokuBoolInitial] = useState(
    sudokuBoolInitialTemp
  );
  const [selectedPosition, setSelectedPosition] = useState([]);

  const [connectQuery, connect] = useConnect();
  const [accountQuery, disconnect] = useAccount();
  const [{ data, error, loading }] = useNetwork();

  const [loadingVerifyBtn, setLoadingVerifyBtn] = useState(false);
  const [loadingVerifyAndMintBtn, setLoadingVerifyAndMintBtn] = useState(false);
  const [loadingStartGameBtn, setLoadingStartGameBtn] = useState(false);

  const { state, dispatch } = useContext(StoreContext)
  const { walletAddress } = state

  const { IconConverter } = IconService;

  // const [signer] = useSigner();

  // const provider = useProvider();

  // const contract = useContract({
  //   addressOrName: contractAddress.sudokuContract,
  //   contractInterface: sudokuContractAbi.abi,
  //   signerOrProvider: signer.data || provider,
  // });

  // const contractNoSigner = useContract({
  //   addressOrName: contractAddress.sudokuContract,
  //   contractInterface: sudokuContractAbi.abi,
  //   signerOrProvider: provider,
  // });

  const updatePosition = (number) => {
    if (selectedPosition.length > 0) {
      if (!sudokuBoolInitial[selectedPosition[0]][selectedPosition[1]]) return;
      const temp = [...sudoku];
      temp[selectedPosition[0]][selectedPosition[1]] = number;
      setSudoku(temp);
      console.log("sudoku", sudoku);
    }
  };

  const convertToBigInt = (elem) => {
    if (Array.isArray(elem)) {
        return elem.map(convertToBigInt);
    } else {
        return  IconConverter.toHex(elem)
    }
  };

  const calculateProof = async () => {
    setLoadingVerifyBtn(true);
    console.log("sudokuInitial", sudokuInitial);
    console.log("sudoku", sudoku);
    let calldata = await sudokuCalldata(sudokuInitial, sudoku);
    console.log(calldata, ':call')

    

    if (!calldata) {
      setLoadingVerifyBtn(false);
      return "Invalid inputs to generate witness.";
    }

    const bigIntCallData = convertToBigInt(calldata);

    // console.log("calldata", calldata);

    try {
      let result;
      if (
        walletAddress
      ) {
        // result = await contract.verifySudoku(
        //   calldata[0],
        //   calldata[1],
        //   calldata[2],
        //   calldata[3]
        // );
        let verifyParams = {
          "a" : bigIntCallData[0],
          "b" : bigIntCallData[1],
          "c" : bigIntCallData[2],
          "input" : bigIntCallData[3].map((item) => '0x' + item.padStart(64, '0'))
        }
        result = await contractFunctionCallHelper(contractAddress.sudokuContract, 'verifySudoku', verifyParams, networks[`${networks.selectedChain}`].rpcUrls[0])
        console.log(result, ':res')
      } 
      console.log("result", result);
      if(!result) throw ('Error')
      setLoadingVerifyBtn(false);
      alert("Successfully verified");
    } catch (error) {
      setLoadingVerifyBtn(false);
      alert("Wrong solution");
    }
  };

  const verifySudoku = async () => {
    // console.log("Address", accountQuery.data?.address);
    calculateProof();
  };

  const calculateProofAndMintNft = async () => {
    setLoadingVerifyAndMintBtn(true);
    console.log("sudokuInitial", sudokuInitial);
    console.log("sudoku", sudoku);
    let calldata = await sudokuCalldata(sudokuInitial, sudoku);

    if (!calldata) {
      setLoadingVerifyAndMintBtn(false);
      return "Invalid inputs to generate witness.";
    }

    // console.log("calldata", calldata);

    try {
      let txn = await contract.verifySudokuAndMintNft(
        calldata[0],
        calldata[1],
        calldata[2],
        calldata[3]
      );
      await txn.wait();
      setLoadingVerifyAndMintBtn(false);
      alert(
        `Successfully verified! The NFT has been minted and sent to your wallet. You can see the contract here: ${
          networks[networks.selectedChain].blockExplorerUrls[0]
        }address/${contractAddress.sudokuContract}`
      );
    } catch (error) {
      setLoadingVerifyAndMintBtn(false);
      alert("Wrong solution");
    }
  };

  const verifySudokuAndMintNft = async () => {
    console.log("Address", accountQuery.data?.address);
    calculateProofAndMintNft();
  };

  const renderVerifySudoku = () => {
    return (
      <button
        className="flex justify-center items-center disabled:cursor-not-allowed space-x-3 verify-btn text-lg font-medium rounded-md px-5 py-3 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
        onClick={verifySudoku}
        disabled={loadingVerifyBtn}
      >
        {loadingVerifyBtn && <div className={styles.loader}></div>}
        <span>Verify Sudoku</span>
      </button>
    );
  };

  const renderVerifySudokuAndMintNft = () => {
    if (!accountQuery.data?.address) {
      return (
        <button
          className="text-lg font-medium rounded-md px-5 py-3 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
          onClick={() => {
            connect(connectQuery.data.connectors[0]);
          }}
        >
          Connect Wallet to Verify Sudoku & Mint NFT
        </button>
      );
    } else if (
      accountQuery.data?.address &&
      data.chain.id.toString() !== networks.selectedChain
    ) {
      return (
        <button
          className="text-lg font-medium rounded-md px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
          onClick={() => {
            switchNetwork();
          }}
        >
          Switch Network to Verify Sudoku & Mint NFT
        </button>
      );
    } else {
      return (
        <button
          className="flex justify-center items-center disabled:cursor-not-allowed space-x-3 verify-btn text-lg font-medium rounded-md px-5 py-3 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
          onClick={verifySudokuAndMintNft}
          disabled={loadingVerifyAndMintBtn}
        >
          {loadingVerifyAndMintBtn && <div className={styles.loader}></div>}
          <span>Verify Sudoku & Mint NFT</span>
        </button>
      );
    }
  };

  const contractFunctionCallHelper = async (scoreAddr, method, params, url) => {
    try {
      const provider = new IconService.HttpProvider(url ?? null);
      const iconService = new IconService(provider);
  
      const callObj = new IconService.IconBuilder.CallBuilder().to(scoreAddr).method(method).params(params).build();
      console.log(callObj, ':callObj')
      let res =  await iconService.call(callObj).execute();
      console.log(res)
      return res
    } catch (error) {
      console.log(error)
    }
    
  };

  const initializeBoard = async () => {
    try {
      let board;

      if (
        walletAddress
      ) {
        board = await contractFunctionCallHelper(contractAddress.sudokuContract, 'generateSudokuBoard', {  stringTime: new Date().toString() }, networks[`${networks.selectedChain}`].rpcUrls[0]);
      } 

      console.log("result", board);
      let numBoard = board?.map((item, idx) => {
        let itemNum = item?.map((hexNum) => {
          let toDec = new BigNumber(hexNum).toNumber()
          return toDec
        })
        return itemNum
      })


      setSudokuInitial(numBoard);

      let newArray = numBoard.map((arr) => {
        return arr.slice();
      });
      setSudoku(newArray);

      const temp = [
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false, false],
      ];
      for (let i = 0; i < numBoard.length; i++) {
        for (let j = 0; j < numBoard.length; j++) {
          if (numBoard[i][j] === 0) {
            temp[i][j] = true;
          }
        }
      }
      setSudokuBoolInitial(temp);
    } catch (error) {
      alert("Failed fetching Sudoku board");
    }
  };

  const renderNewGame = () => {
    return (
      <button
        className="flex justify-center items-center disabled:cursor-not-allowed space-x-3 verify-btn text-lg font-medium rounded-md px-5 py-3 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
        onClick={async () => {
          setLoadingStartGameBtn(true);
          await initializeBoard();
          setLoadingStartGameBtn(false);
        }}
        disabled={loadingStartGameBtn}
      >
        {loadingStartGameBtn && <div className={styles.loader}></div>}
        <span>New Game</span>
      </button>
    );
  };

  const renderSudoku = () => {
    if (sudoku.length !== 0) {
      return (
        <>
          <div>
            <Board
              sudoku={sudoku}
              setSelectedPosition={(pos) => setSelectedPosition(pos)}
              selectedPosition={selectedPosition}
              sudokuBoolInitial={sudokuBoolInitial}
            />
          </div>
          <div>
            <div className="flex justify-center items-center my-10">
              {renderNewGame()}
            </div>
            <NumbersKeyboard updatePosition={updatePosition} />
            <div className="flex justify-center items-center my-10">
              {renderVerifySudoku()}
            </div>
            <div className="flex justify-center items-center my-10">
              {renderVerifySudokuAndMintNft()}
            </div>
          </div>
        </>
      );
    } else {
      return (
        <div className="flex justify-center items-center space-x-3">
          <div className={styles.loader}></div>
          <div>Loading Game</div>
        </div>
      );
    }
  };

  useEffect(() => {
    console.log("Sudoku page");

    initializeBoard();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div>
      <Head>
        <title>zkGames - Sudoku</title>
        <meta name="title" content="zkGames - Sudoku" />
        <meta
          name="description"
          content="Zero Knowledge Games Platform - Sudoku"
        />
      </Head>
      <div className="mb-10">
        <GoBack />
      </div>
      <div className="flex">
        <div className="mx-5 mb-10 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
          Sudoku
        </div>
      </div>
      <div className="flex flex-wrap gap-20 justify-center items-center text-slate-300">
        {renderSudoku()}
      </div>
      <div className="flex place-content-center mt-20 text-lg text-slate-300">
        <div className="md:w-6/12">
          <div className="text-center my-5 font-semibold">Sudoku rules:</div>
          <div className="space-y-5">
            <p>
              <span className="font-semibold">Sudoku</span> (also known as
              &quot;Number Place&quot;) is a placement puzzle. The puzzle is
              most frequently a 9 x 9 grid made up of 3 x 3 subgrids (called
              &quot;regions&quot;). Some cells already contain numbers, known as
              &quot;givens&quot;.
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                The goal is to fill in the empty cells, one number in each, so
                that each column, row, and region contains the numbers 1 through
                9 exactly once.
              </li>
              <li>
                Each number in the solution therefore occurs only once in each
                of three &quot;directions&quot;, hence the &quot;single
                numbers&quot; implied by the puzzle&apos;s name.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
