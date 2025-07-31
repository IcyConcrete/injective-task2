import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletConnect = ({ onConnect }) => {
  const [account, setAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [network, setNetwork] = useState(null);

  // Injective测试网配置
  const injectiveTestnet = {
    chainId: '0x59F', // 1439的十六进制
    chainName: 'Injective Testnet',
    nativeCurrency: {
      name: 'INJ',
      symbol: 'INJ',
      decimals: 18,
    },
    rpcUrls: ['https://k8s.testnet.json-rpc.injective.network/'],
    blockExplorerUrls: ['https://testnet.blockscout.injective.network/'],
  };

  // 检查网络并切换到Injective测试网
  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      // 获取当前网络
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      setNetwork(network);
      
      // 如果不是Injective测试网，切换网络
      if (network.chainId !== 1439) {
        try {
          // 尝试切换到Injective测试网
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: injectiveTestnet.chainId }],
          });
          
          // 重新获取网络确认切换成功
          const updatedNetwork = await provider.getNetwork();
          setNetwork(updatedNetwork);
          
          return updatedNetwork.chainId === 1439;
        } catch (switchError) {
          // 如果用户没有Injective测试网，则添加它
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [injectiveTestnet],
              });
              
              // 重新获取网络确认添加成功
              const updatedNetwork = await provider.getNetwork();
              setNetwork(updatedNetwork);
              
              return updatedNetwork.chainId === 1439;
            } catch (addError) {
              console.error('添加网络失败:', addError);
              setError('无法添加Injective测试网: ' + (addError.message || addError));
              return false;
            }
          } else {
            console.error('切换网络失败:', switchError);
            setError('无法切换到Injective测试网: ' + (switchError.message || switchError));
            return false;
          }
        }
      }
      
      return network.chainId === 1439;
    } catch (err) {
      console.error('检查网络失败:', err);
      setError('检查网络失败: ' + (err.message || err));
      return false;
    }
  };

  // 检查是否已连接钱包
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            
            // 检查并切换网络
            const isCorrectNetwork = await checkAndSwitchNetwork();
            
            if (isCorrectNetwork) {
              const provider = new ethers.providers.Web3Provider(window.ethereum);
              onConnect(provider);
            } else {
              // 如果不是正确的网络，不连接合约
              onConnect(null);
            }
          }
        } catch (err) {
          console.error('检查钱包连接失败:', err);
          setError('检查钱包连接失败: ' + (err.message || err));
        }
      }
    };

    checkConnection();
  }, [onConnect]);

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          
          // 检查并切换网络
          const isCorrectNetwork = await checkAndSwitchNetwork();
          
          if (isCorrectNetwork) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            onConnect(provider);
          } else {
            // 如果不是正确的网络，不连接合约
            onConnect(null);
          }
        } else {
          setAccount('');
          onConnect(null);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [onConnect]);

  // 监听网络变化
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = async (chainIdHex) => {
        // 将十六进制转换为十进制
        const chainId = parseInt(chainIdHex, 16);
        
        if (chainId === 1439) {
          // 如果是Injective测试网，连接合约
          if (account) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            onConnect(provider);
          }
        } else {
          // 如果不是Injective测试网，不连接合约
          onConnect(null);
          setError('请切换到Injective测试网 (Chain ID: 1439)');
        }
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account, onConnect]);

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('请安装MetaMask钱包!');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      // 请求连接钱包
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      // 检查并切换网络
      const isCorrectNetwork = await checkAndSwitchNetwork();
      
      if (isCorrectNetwork) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        onConnect(provider);
      } else {
        // 如果不是正确的网络，不连接合约
        onConnect(null);
      }
    } catch (err) {
      console.error('连接钱包失败:', err);
      setError('连接钱包失败: ' + (err.message || err));
      onConnect(null);
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount('');
    setNetwork(null);
    onConnect(null);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      {!account ? (
        <button 
          onClick={connectWallet} 
          disabled={isConnecting}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6851FF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isConnecting ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {isConnecting ? '连接中...' : '连接钱包'}
        </button>
      ) : (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontWeight: 'bold' }}>已连接: </span>
            <span>{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span>
          </div>
          {network && (
            <div style={{ marginBottom: '10px', fontSize: '14px' }}>
              <span style={{ fontWeight: 'bold' }}>网络: </span>
              <span style={{ 
                color: network.chainId === 1439 ? '#4caf50' : '#f44336' 
              }}>
                {network.chainId === 1439 ? 'Injective 测试网' : `${network.name} (不兼容)`}
              </span>
            </div>
          )}
          <button 
            onClick={disconnectWallet}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            断开连接
          </button>
        </div>
      )}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default WalletConnect;
