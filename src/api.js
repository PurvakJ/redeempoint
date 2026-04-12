const API_URL = "https://script.google.com/macros/s/AKfycbwZVZN9XwqQsWMtbLRI2eCmIQ_NwfmCbOqE0CeBq0L5YDTM0rpTzMr6JHG3zgu3VvUGsQ/exec";

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