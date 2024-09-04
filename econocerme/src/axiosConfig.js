import axios from 'axios';
// Crear una instancia de Axios con configuración específica

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Cambia esto según tu URL base del backend
    withCredentials: true // Asegura que las cookies se envíen con cada solicitud
});

export default api;
