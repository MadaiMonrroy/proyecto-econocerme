// middleware/verificarToken.js
import jwt from 'jsonwebtoken'; // Cambia a import

const verificarToken = (req, res, next) => {
  console.log('Verificando token...');
  const token = req.headers['authorization']?.split(' ')[1];
  console.log('Token recibido:', token);
  if (!token) return res.status(403).send('Token requerido');

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send('Token inválido.');
    req.userId = decoded.id;
    next();
  });
};

export default verificarToken; // Cambia a export default
