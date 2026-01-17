
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const storage = {
  
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Greška pri čuvanju tokena:', error);
    }
  },

 
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Greška pri učitavanju tokena:', error);
      return null;
    }
  },

  
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Greška pri brisanju tokena:', error);
    }
  },

  
  setUser: (user: any): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Greška pri čuvanju korisnika:', error);
    }
  },

  
  getUser: (): any | null => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Greška pri učitavanju korisnika:', error);
      return null;
    }
  },

 
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Greška pri brisanju korisnika:', error);
    }
  },


  clearAuth: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Greška pri brisanju podataka:', error);
    }
  },

 
  isAuthenticated: (): boolean => {
     return !!storage.getToken();
  }
};