import axios from "axios";

const EXCHANGE_RATE_API_KEY = "YOUR_API_KEY"; // You'll need to get this from exchangeratesapi.io
const BASE_URL = "https://api.exchangeratesapi.io/v1";

export const getExchangeRate = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/latest`, {
      params: {
        access_key: EXCHANGE_RATE_API_KEY,
        base: "USD",
        symbols: "KES",
      },
    });
    return response.data.rates.KES;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    // Fallback rate in case API fails
    return 150; // 1 USD = 150 KES (approximate)
  }
};

export const convertUSDToKES = async (usdAmount) => {
  const rate = await getExchangeRate();
  return (usdAmount * rate).toFixed(2);
};
