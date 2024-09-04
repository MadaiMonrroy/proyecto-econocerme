// stores/authStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
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
                const response = await axios.post('http://localhost:3000/api/auth/login', { email, contrasenia });
                this.usuario = response.data.usuario;
                this.token = response.data.token;
                localStorage.setItem('usuario', JSON.stringify(this.usuario));
                localStorage.setItem('token', this.token); 
                console.usuario = JSON.stringify(this.usuario);
                return response.data;
            } catch (error) {
                console.error('Error en login:', error);
                throw error; // Propaga el error
            }
        },
        async registro(usuarioData) {
            try {
                const response = await axios.post('http://localhost:3000/api/auth/registro', usuarioData);
                return response.data; // Retorna la respuesta para manejarla en la UI
            } catch (error) {
                console.error('Error en registro:', error);
                throw error; // Propaga el error
            }
        },
        logout() {
            this.usuario = null;
            this.token = null;
            localStorage.removeItem('usuario');
            localStorage.removeItem('token');
        },
        loadUser() {
            const storedUser = localStorage.getItem('usuario');
            const storedToken = localStorage.getItem('token');

            if (storedUser) {
                this.usuario = JSON.parse(storedUser);
            }
            if (storedToken) {
                this.token = storedToken; // Aquí puedes cargar el token si decides usarlo.
            }
        }
    },
});