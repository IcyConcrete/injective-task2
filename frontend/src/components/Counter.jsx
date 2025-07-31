import { useState, useEffect } from 'react';
import { getCounterValue, incrementCounter, decrementCounter, resetCounter } from '../utils/contract';

const Counter = ({ contract }) => {
  const [count, setCount] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txStatus, setTxStatus] = useState('');

  // 重置所有状态
  const resetState = () => {
    setCount(0);
    setIsOwner(false);
    setError('');
    setTxStatus('');
    setLoading(false);
  };

  // 加载计数器值和检查是否是合约拥有者
  useEffect(() => {
    let isMounted = true;
    
    // 如果合约为null，重置状态并返回
    if (!contract) {
      resetState();
      return;
    }
    
    const loadCounterData = async () => {
      try {
        // 获取计数器值
        const value = await getCounterValue(contract);
        if (isMounted) setCount(value);
        
        // 检查是否是合约拥有者
        try {
          const owner = await contract.owner();
          const signer = await contract.signer.getAddress();
          if (isMounted) setIsOwner(owner.toLowerCase() === signer.toLowerCase());
        } catch (ownerErr) {
          console.error('检查所有者失败:', ownerErr);
          if (isMounted) setIsOwner(false);
        }
      } catch (err) {
        console.error('加载计数器数据失败:', err);
        if (isMounted) {
          setError('加载数据失败');
          setCount(0);
        }
      }
    };

    loadCounterData();
    
    // 清理函数
    return () => {
      isMounted = false;
    };
  }, [contract]);

  // 监听ValueChanged事件
  useEffect(() => {
    // 如果合约为null，不添加事件监听器
    if (!contract) return;

    let eventListener = null;
    
    try {
      const valueChangedFilter = contract.filters.ValueChanged();
      
      const handleValueChanged = async (newValue) => {
        setCount(newValue.toNumber());
        setTxStatus('交易成功!');
        
        // 3秒后清除状态消息
        setTimeout(() => {
          setTxStatus('');
        }, 3000);
      };

      // 添加事件监听器
      contract.on(valueChangedFilter, handleValueChanged);
      eventListener = { filter: valueChangedFilter, handler: handleValueChanged };
    } catch (err) {
      console.error('添加事件监听器失败:', err);
    }

    // 清理函数
    return () => {
      try {
        if (contract && eventListener) {
          contract.off(eventListener.filter, eventListener.handler);
        }
      } catch (err) {
        console.error('移除事件监听器失败:', err);
      }
    };
  }, [contract]);

  // 增加计数器值
  const handleIncrement = async () => {
    if (!contract) return;
    
    setLoading(true);
    setError('');
    setTxStatus('交易处理中...');
    
    try {
      await incrementCounter(contract);
      // 更新会通过事件监听器处理
    } catch (err) {
      console.error('增加计数器值失败:', err);
      setError('交易失败: ' + (err.message || err));
      setTxStatus('');
    } finally {
      setLoading(false);
    }
  };

  // 减少计数器值
  const handleDecrement = async () => {
    if (!contract) return;
    
    setLoading(true);
    setError('');
    setTxStatus('交易处理中...');
    
    try {
      await decrementCounter(contract);
      // 更新会通过事件监听器处理
    } catch (err) {
      console.error('减少计数器值失败:', err);
      setError('交易失败: ' + (err.message || err));
      setTxStatus('');
    } finally {
      setLoading(false);
    }
  };

  // 重置计数器值
  const handleReset = async () => {
    if (!contract || !isOwner) return;
    
    setLoading(true);
    setError('');
    setTxStatus('交易处理中...');
    
    try {
      await resetCounter(contract);
      // 更新会通过事件监听器处理
    } catch (err) {
      console.error('重置计数器值失败:', err);
      setError('交易失败: ' + (err.message || err));
      setTxStatus('');
    } finally {
      setLoading(false);
    }
  };

  // 如果没有连接合约，显示提示信息
  if (!contract) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>请先连接钱包以使用计数器</p>
      </div>
    );
  }

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Injective 计数器</h2>
      
      <div style={{ 
        fontSize: '48px', 
        fontWeight: 'bold', 
        textAlign: 'center',
        margin: '30px 0',
        color: '#333'
      }}>
        {count}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <button 
          onClick={handleDecrement} 
          disabled={loading || count === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: count === 0 ? '#cccccc' : '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || count === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            width: '120px'
          }}
        >
          减少 (-1)
        </button>
        
        <button 
          onClick={handleIncrement} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            width: '120px'
          }}
        >
          增加 (+1)
        </button>
      </div>
      
      {isOwner && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={handleReset} 
            disabled={loading || count === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: count === 0 ? '#cccccc' : '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading || count === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            重置计数器
          </button>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            (仅合约拥有者可见)
          </p>
        </div>
      )}
      
      {txStatus && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '15px',
          padding: '8px',
          backgroundColor: txStatus.includes('成功') ? '#e8f5e9' : '#fff8e1',
          borderRadius: '4px',
          color: txStatus.includes('成功') ? '#2e7d32' : '#ff8f00'
        }}>
          {txStatus}
        </div>
      )}
      
      {error && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '15px',
          padding: '8px',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Counter;
