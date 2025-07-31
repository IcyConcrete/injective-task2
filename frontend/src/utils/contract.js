import { ethers } from 'ethers';

// 合约地址 - 已部署到Injective测试网
export const CONTRACT_ADDRESS = '0x7504970cf3Ae75F67323Fb5a81660EB3665dCF47';

// 合约ABI
export const CONTRACT_ABI = [
  // 读取计数器值
  {
    "inputs": [],
    "name": "getValue",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // 增加计数器值
  {
    "inputs": [],
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 减少计数器值
  {
    "inputs": [],
    "name": "decrement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 重置计数器值
  {
    "inputs": [],
    "name": "reset",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // 获取合约拥有者
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // 值改变事件
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newValue",
        "type": "uint256"
      }
    ],
    "name": "ValueChanged",
    "type": "event"
  }
];

// 创建合约实例
export const getContractInstance = (provider) => {
  // 严格检查provider是否存在
  if (!provider) return null;
  
  try {
    const signer = provider.getSigner();
    // 确保signer存在
    if (!signer) return null;
    
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  } catch (error) {
    console.error('创建合约实例失败:', error);
    return null;
  }
};

// 读取计数器值
export const getCounterValue = async (contract) => {
  // 严格检查contract是否存在
  if (!contract) return 0;
  
  try {
    const value = await contract.getValue();
    return value.toNumber();
  } catch (error) {
    console.error('读取计数器值失败:', error);
    return 0;
  }
};

// 增加计数器值
export const incrementCounter = async (contract) => {
  if (!contract) return false;
  try {
    const tx = await contract.increment();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('增加计数器值失败:', error);
    return false;
  }
};

// 减少计数器值
export const decrementCounter = async (contract) => {
  if (!contract) return false;
  try {
    const tx = await contract.decrement();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('减少计数器值失败:', error);
    return false;
  }
};

// 重置计数器值
export const resetCounter = async (contract) => {
  if (!contract) return false;
  try {
    const tx = await contract.reset();
    await tx.wait();
    return true;
  } catch (error) {
    console.error('重置计数器值失败:', error);
    return false;
  }
};