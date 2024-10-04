import connection from "../db.js";

// Función para obtener el carrito del usuario
export const obtenerCarrito = async (req, res) => {
  const { idUsuario } = req.params;
  try {
    const [carrito] = await connection.query('SELECT * FROM carrito WHERE idUsuario = ?', [idUsuario]);
    res.json(carrito);
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).send("Error en el servidor");
  }
};

// Función para agregar un producto al carrito
export const agregarProductoCarrito = async (req, res) => {
  const { idUsuario, idProducto } = req.body; // Asegúrate de que el cuerpo de la solicitud contenga estos datos
  try {
    // Verifica si el carrito ya existe
    const [carrito] = await connection.query('SELECT * FROM carrito WHERE idUsuario = ?', [idUsuario]);

    if (carrito.length > 0) {
      // Si el carrito existe, agrega el producto
      await connection.query('INSERT INTO carrito_items (idCarrito, idProducto) VALUES (?, ?)', [carrito[0].idCarrito, idProducto]);
    } else {
      // Si no existe, crea uno nuevo y luego agrega el producto
      const [nuevoCarrito] = await connection.query('INSERT INTO carrito (idUsuario) VALUES (?)', [idUsuario]);
      await connection.query('INSERT INTO carrito_items (idCarrito, idProducto) VALUES (?, ?)', [nuevoCarrito.insertId, idProducto]);
    }

    res.status(201).send("Producto agregado al carrito");
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    res.status(500).send("Error en el servidor");
  }
};

// Función para eliminar un producto del carrito
export const eliminarProductoCarrito = async (req, res) => {
  const { idCarrito, idProducto } = req.body; // Asegúrate de que el cuerpo de la solicitud contenga estos datos
  try {
    await connection.query('DELETE FROM carrito_items WHERE idCarrito = ? AND idProducto = ?', [idCarrito, idProducto]);
    res.send("Producto eliminado del carrito");
  } catch (error) {
    console.error("Error al eliminar del carrito:", error);
    res.status(500).send("Error en el servidor");
  }
};

// Función para vaciar el carrito
export const vaciarCarrito = async (req, res) => {
  const { idUsuario } = req.params;
  try {
    // Obtener el carrito del usuario
    const [carrito] = await connection.query('SELECT * FROM carrito WHERE idUsuario = ?', [idUsuario]);

    if (carrito.length > 0) {
      await connection.query('DELETE FROM carrito_items WHERE idCarrito = ?', [carrito[0].idCarrito]);
      res.send("Carrito vacío");
    } else {
      res.status(404).send("Carrito no encontrado");
    }
  } catch (error) {
    console.error("Error al vaciar el carrito:", error);
    res.status(500).send("Error en el servidor");
  }
};
// Función para obtener los detalles del curso por ID
export const obtenerDetalleCurso = async (req, res) => {
    const { cursoId } = req.params;
    console.log(cursoId)

    try {
      const [curso] = await connection.query('SELECT idCurso, titulo, precio, especialidad, duracion, descripcion, ultimaActualizacion, miniatura, estado FROM curso WHERE idCurso = ?', [cursoId]);
  
      if (curso.length === 0) {
        return res.status(203).json({ message: 'Curso no encontrado' });
      }
  
      // Aquí puedes agregar más lógica si necesitas unir datos de otras tablas, como módulos, etc.
  
      res.json(curso[0]); // Devolvemos el primer curso encontrado
    } catch (error) {
      console.error('Error al obtener el curso:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };