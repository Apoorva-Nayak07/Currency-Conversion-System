import React, { useState, useEffect } from 'react';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currencies, setCurrencies] = useState([]);

  // Fetch available currencies on component mount
  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Fetch exchange rate when currencies or amount change
  useEffect(() => {
    if (fromCurrency && toCurrency) {
      fetchExchangeRate();
    }
  }, [fromCurrency, toCurrency]);

  // Calculate converted amount when exchange rate or amount changes
  useEffect(() => {
    if (exchangeRate !== null && amount) {
      setConvertedAmount((amount * exchangeRate).toFixed(2));
    }
  }, [amount, exchangeRate]);

  const fetchCurrencies = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const currencyList = Object.keys(data.rates);
      setCurrencies(currencyList);
    } catch (err) {
      console.error('Error fetching currencies:', err);
      // Fallback to common currencies if API fails
      setCurrencies(['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN']);
    }
  };

  const fetchExchangeRate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rate');
      }
      
      const data = await response.json();
      const rate = data.rates[toCurrency];
      setExchangeRate(rate);
    } catch (err) {
      setError('Failed to fetch exchange rate. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || !isNaN(value)) {
      setAmount(value);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="currency-converter">
      <div className="converter-card">
        <h1 className="title">Currency Converter</h1>
        
        <div className="converter-body">
          {/* Amount Input */}
          <div className="input-group">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          {/* From Currency */}
          <div className="input-group">
            <label htmlFor="from-currency">From</label>
            <select
              id="from-currency"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="swap-container">
            <button 
              className="swap-button" 
              onClick={handleSwapCurrencies}
              aria-label="Swap currencies"
            >
              ⇅
            </button>
          </div>

          {/* To Currency */}
          <div className="input-group">
            <label htmlFor="to-currency">To</label>
            <select
              id="to-currency"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          {/* Result Display */}
          <div className="result-container">
            {loading && <p className="loading">Loading...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && convertedAmount && (
              <div className="result">
                <p className="result-text">
                  <span className="amount-from">
                    {amount} {fromCurrency}
                  </span>
                  <span className="equals">=</span>
                  <span className="amount-to">
                    {convertedAmount} {toCurrency}
                  </span>
                </p>
                {exchangeRate && (
                  <p className="exchange-rate">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
