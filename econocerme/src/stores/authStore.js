import { defineStore } from "pinia";
import axios from "axios";
import CryptoJS from "crypto-js";

const encriptar = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), "8468700lp").toString();
};

const desencriptar = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, "8468700lp");
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export const useAuthStore = defineStore("auth", {
  state: () => ({
    usuario: null,
    token: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    async login(email, contrasenia) {
      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/login",
          { email, contrasenia }
        );
        this.usuario = response.data.usuario;
        this.token = response.data.token;

        // Encriptar y guardar en una cookie
        const encryptedData = encriptar({
          usuario: this.usuario,
          token: this.token,
        });
        document.cookie = `auth=${encryptedData}; path=/;`;
        // console.log("Usuario:", this.usuario);
        // console.log("Token:", this.token);
        return response.data;
      } catch (error) {
        console.error("Error en login:", error);
        throw error;
      }
    },
    loadUser() {
      // Leer la cookie
      const cookies = document.cookie
        .split(";")
        .find((cookie) => cookie.trim().startsWith("auth="));
      if (cookies) {
        const encryptedValue = cookies.split("=")[1];
        try {
          const decryptedValue = desencriptar(encryptedValue);
          this.usuario = decryptedValue.usuario;
          this.token = decryptedValue.token;
          // console.log("Usuario cargado:", this.usuario);
          // console.log("Token cargado:", this.token);
        } catch (error) {
          console.error("Error al desencriptar la cookie:", error);
        }
      }
    },
    actualizarUsuario(usuarioActualizado) {
      this.usuario = { ...this.usuario, ...usuarioActualizado }; // Sobrescribe los campos del usuario con los nuevos datos
      const encryptedData = encriptar({
        usuario: this.usuario,
        token: this.token,
      });
      document.cookie = `auth=${encryptedData}; path=/;`; // Actualiza la cookie con los datos encriptados
    }, 
    logout() {
      this.usuario = null;
      this.token = null;
      document.cookie = "auth=; Max-Age=0; path=/;";
    },
  },
});
