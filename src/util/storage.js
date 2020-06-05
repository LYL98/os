export default {
  get: (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : '';
  },

  set: (key, value) => {
    if (!value) {
      value = '';
    }
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },

  clear: () => {
    localStorage.clear();
  },
};
