import { ethers } from 'ethers';

// 合约地址 - 已部署到Injective测试网
export const CONTRACT_ADDRESS = '0x7504970cf3Ae75F67323Fb5a81660EB3665dCF47';

// 备用RPC节点
const BACKUP_RPC_URLS = [
  'https://testnet.injective.network',
  'https://testnet.rpc.injective.network',
  'https://k8s.testnet.json-rpc.injective.network'
];

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

// 创建备用提供者
const createBackupProvider = async () => {
  for (const rpcUrl of BACKUP_RPC_URLS) {
    try {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      // 测试连接
      await provider.getNetwork();
      console.log(`使用备用RPC: ${rpcUrl}`);
      return provider;
    } catch (error) {
      console.warn(`RPC ${rpcUrl} 连接失败:`, error);
    }
  }
  return null;
};

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

// 使用备用RPC尝试读取合约
const tryWithBackupProvider = async (contractMethod) => {
  const backupProvider = await createBackupProvider();
  if (!backupProvider) return null;
  
  try {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, backupProvider);
    return await contractMethod(contract);
  } catch (error) {
    console.error('备用RPC调用失败:', error);
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
    
    // 尝试使用备用RPC
    console.log('尝试使用备用RPC读取计数器值...');
    const backupValue = await tryWithBackupProvider(async (c) => await c.getValue());
    if (backupValue !== null) {
      return backupValue.toNumber();
    }
    
    return 0;
  }
};

// 获取合约拥有者
export const getContractOwner = async (contract) => {
  if (!contract) return null;
  
  try {
    return await contract.owner();
  } catch (error) {
    console.error('获取合约拥有者失败:', error);
    
    // 尝试使用备用RPC
    console.log('尝试使用备用RPC获取合约拥有者...');
    return await tryWithBackupProvider(async (c) => await c.owner());
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