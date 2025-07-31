import { useState, useEffect } from 'react';
import WalletConnect from './components/WalletConnect';
import Counter from './components/Counter';
import { getContractInstance } from './utils/contract';

function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);

  // 处理钱包连接
  const handleConnect = (newProvider) => {
    // 先清理旧的状态
    if (!newProvider) {
      setContract(null);
      setProvider(null);
      return;
    }
    
    // 设置新的provider
    setProvider(newProvider);
    
    // 创建新的合约实例
    try {
      const contractInstance = getContractInstance(newProvider);
      setContract(contractInstance);
    } catch (error) {
      console.error('创建合约实例失败:', error);
      setContract(null);
    }
  };

  // 监听provider变化，确保合约实例同步更新
  useEffect(() => {
    if (!provider) {
      setContract(null);
    }
  }, [provider]);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          Injective 计数器 dApp
        </h1>
        <p style={{ color: '#666' }}>
          在 Injective 测试网上与智能合约交互
        </p>
      </header>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: '0', marginBottom: '20px', color: '#333' }}>
            钱包连接
          </h2>
          <WalletConnect onConnect={handleConnect} />
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <Counter contract={contract} />
        </div>
      </div>

      <footer style={{
        marginTop: '40px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <p>
          合约地址: 0x7504970cf3Ae75F67323Fb5a81660EB3665dCF47
        </p>
        <p>
          Injective 测试网 (Chain ID: 1439)
        </p>
      </footer>
    </div>
  );
}

export default App;
