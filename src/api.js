const API_URL = "https://script.google.com/macros/s/AKfycbxbrS1RbuWqTB1VcR3t6eBmHX2jb-LqoMX9t6osoClDTl47ng8gqUHoApfa5aYYKXbt9A/exec";

export const api = async (action, data = {}) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action, ...data })
    });

    const json = await res.json();
    return json;
  } catch (err) {
    return { success: false, error: "Network error: " + err.message };
  }
};