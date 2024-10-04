import { defineStore } from "pinia";
import axios from "axios";
import CryptoJS from "crypto-js";
import api from "@/axiosConfig.js";

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
    carrito: [], // Estado para el carrito de compras
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.usuario?.tipoUsuario || "", // Agregar getter para el rol
    // Devuelve la cantidad de cursos en el carrito
    carritoCantidad: (state) => state.carrito.length,
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

        // Cargar el carrito del localStorage basado en idUsuario
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

          // Cargar el carrito del localStorage basado en idUsuario
          this.cargarCarrito();
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
      const userId = this.usuario?.id; // Asegúrate de que el ID del usuario esté disponible

      this.usuario = null;
      this.token = null;
      this.carrito = []; // Vaciar el carrito al cerrar sesión

      document.cookie = "auth=; Max-Age=0; path=/;";
      // Limpiar el carrito del localStorage
      localStorage.removeItem(`carrito_${userId}`); // Asegúrate de que estés utilizando el localStorage para el carrito

    },
    async cargarCarrito() {
      const userId = this.usuario?.id; // Asegúrate de que el ID del usuario esté disponible
      // Primero intenta cargar del localStorage
      const carritoLocal = localStorage.getItem(`carrito_${userId}`);
      if (carritoLocal) {
        this.carrito = JSON.parse(carritoLocal);
      } else if (this.usuario?.tipoUsuario === "usuario") {
        // Si no hay carrito en localStorage, consulta a la base de datos
        try {
          const response = await api.get(
            `/carritos/carrito/${userId}`
          );
          const carritoDB = response.data;

          // Suponiendo que el campo idCurso es un JSON array
          if (carritoDB && carritoDB[0].idCurso) {
            const cursoIds = carritoDB[0].idCurso;
            // Cargar los detalles de los cursos en base a los IDs
            const cursos = await this.cargarCursos(cursoIds);

            this.carrito = cursos;

            // Guarda en localStorage
            localStorage.setItem(`carrito_${userId}`, JSON.stringify(cursos));
          }
        } catch (error) {
          console.error(
            "Error al cargar el carrito de la base de datos:",
            error
          );
        }
      }
    },
    async cargarCursos(cursoIds) {
      const cursoPromises = cursoIds.map(async (id) => {
        const response = await api.get(
          `/carritos/obtenerDetalleCurso/${id}`
        );
        return response.data; // Devuelve los datos del curso
      });
      console.log(await Promise.all(cursoPromises)); // Para verificar los datos de los cursos

      return Promise.all(cursoPromises);
    },
  },
});
