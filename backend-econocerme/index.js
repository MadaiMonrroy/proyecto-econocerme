import {PORT} from './config.js'
import app from './server.js';
import dotenv from 'dotenv';

dotenv.config();

app.listen(PORT, () =>{
  console.log(`Corriendo en el puerto ${PORT}`);
});