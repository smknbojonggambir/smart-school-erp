// GANTI DENGAN URL WEB APP DEPLOYMENT ANDA
const API_URL = 'https://script.google.com/macros/s/AKfycbzxCXDm8xZfUn9LhsndU_2q1eg2GJ8khurCHZOclN2JI9djIv_RM18M0JL1xY21leqjag/exec'; 

const API = {
  // Fungsi utama untuk memanggil GAS REST API
  request: async function(action, payload = {}) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Plain text menghindari preflight CORS issue di GAS
        },
        body: JSON.stringify({ action: action, ...payload })
      });

      const result = await response.json();
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'Terjadi kesalahan pada server');
      }
      
      return result.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
};
