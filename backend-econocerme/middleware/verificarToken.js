import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

// Clave de encriptación (debe ser la misma que usas en el frontend)
const SECRET_KEY = "8468700lp"; 

const desencriptar = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

const verificarToken = (req, res, next) => {
  console.log('Verificando token...');
  const encryptedCookie = req.cookies?.auth; // Lee la cookie 'auth'
  console.log('Cookie encriptada recibida:', encryptedCookie);

  if (!encryptedCookie) return res.status(403).send('Cookie requerida');

  try {
    const decryptedData = desencriptar(encryptedCookie);
    const token = decryptedData.token; // Extrae el token

    if (!token) return res.status(403).send('Token requerido');

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).send('Token inválido.');
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error('Error al desencriptar la cookie:', error);
    res.status(500).send('Error interno del servidor');
  }
};

export default verificarToken;
