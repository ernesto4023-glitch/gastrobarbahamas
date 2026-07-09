const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Carpetas
const publicPath = path.join(__dirname, "public");
const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");

const categoriasPath = path.join(uploadsPath, "categorias");
const flyersPath = path.join(uploadsPath, "flyers");
const productosPath = path.join(uploadsPath, "productos");
const comprobantesPath = path.join(uploadsPath, "comprobantes");

[
  uploadsPath,
  categoriasPath,
  flyersPath,
  productosPath,
  comprobantesPath
].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Crear carpeta uploads/categorias si no existe
if (!fs.existsSync(categoriasPath)) {
  fs.mkdirSync(categoriasPath, { recursive: true });
}

// Archivos estáticos
app.use(express.static(publicPath));
app.use("/uploads", express.static(uploadsPath));

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
});

app.use((err, req, res, next) => {
  console.error("🔥 ERROR BACKEND:", err);
  res.status(500).json({
    message: "Error interno",
    error: err.message
  });
});

// Páginas
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(publicPath, "admin.html"));
});

/* =========================
   FLYERS
========================= */

if (!fs.existsSync(flyersPath)) {
  fs.mkdirSync(flyersPath, { recursive: true });
}

const storageFlyers = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, flyersPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, nombreArchivo);
  },
});

const uploadFlyer = multer({
  storage: storageFlyers,
});

app.get("/flyers", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM flyers ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/flyers", uploadFlyer.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "La imagen es obligatoria",
      });
    }

    const imagen = `uploads/flyers/${req.file.filename}`;

    const [result] = await db.query(
      "INSERT INTO flyers(imagen) VALUES (?)",
      [imagen]
    );

    res.json({
      id: result.insertId,
      imagen,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.delete("/flyers/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM flyers WHERE id = ?", [id]);

    res.json({
      message: "Flyer eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/flyers/:id", uploadFlyer.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        message: "Debes subir una imagen"
      });
    }

    const imagen = `uploads/flyers/${req.file.filename}`;

    await db.query(
      "UPDATE flyers SET imagen = ? WHERE id = ?",
      [imagen, id]
    );

    res.json({
      message: "Flyer actualizado correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

/* =========================
   MULTER CATEGORÍAS
========================= */

const storageCategorias = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoriasPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");

    cb(null, nombreArchivo);
  },
});

const uploadCategoria = multer({
  storage: storageCategorias,
});

/* =========================
   CATEGORÍAS
========================= */

app.get("/categorias", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categorias ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post("/categorias", uploadCategoria.single("imagen"), async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre || !req.file) {
      return res.status(400).json({
        message: "Nombre e imagen son obligatorios",
      });
    }

    const imagen = `uploads/categorias/${req.file.filename}`;

    const [result] = await db.query(
      "INSERT INTO categorias(nombre, imagen) VALUES (?, ?)",
      [nombre, imagen]
    );

    res.json({
      id: result.insertId,
      nombre,
      imagen,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

app.put("/categorias/:id", uploadCategoria.single("imagen"), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    let query = "UPDATE categorias SET nombre = ? WHERE id = ?";
    let values = [nombre, id];

    if (req.file) {
      const imagen = `uploads/categorias/${req.file.filename}`;
      query = "UPDATE categorias SET nombre = ?, imagen = ? WHERE id = ?";
      values = [nombre, imagen, id];
    }

    await db.query(query, values);

    res.json({
      message: "Categoría actualizada correctamente"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

/*==========================
   ELIMINAR CATEGORIA
========================= */

app.delete("/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT imagen FROM categorias WHERE id = ?",
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        message: "Categoría no encontrada",
      });
    }

    // opcional: borrar archivo físico si quieres
    // fs.unlinkSync(rows[0].imagen)

    await db.query("DELETE FROM categorias WHERE id = ?", [id]);

    res.json({
      message: "Categoría eliminada correctamente",
    });

  } catch (error) {
    console.error("ERROR DELETE CATEGORIA:", error);

    res.status(500).json({
      message: "Error al eliminar categoría",
      error: error.message
    });
  }
});

/* =========================
   PRODUCTOS
========================= */

if (!fs.existsSync(productosPath)) {
  fs.mkdirSync(productosPath, { recursive: true });
}

const storageProducto = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productosPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, nombreArchivo);
  },
});

const uploadProducto = multer({
  storage: storageProducto,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

app.get("/productos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        productos.*,
        categorias.nombre AS categoria
      FROM productos
      LEFT JOIN categorias
      ON productos.categoria_id = categorias.id
      ORDER BY productos.id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.get("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        productos.*,
        categorias.nombre AS categoria
      FROM productos
      LEFT JOIN categorias
      ON productos.categoria_id = categorias.id
      WHERE productos.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.post(
  "/productos",
  uploadProducto.fields([{ name: "imagenes", maxCount: 6 }]),
  async (req, res) => {
    try {
      const {
        nombre,
        precio,
        precio_combo,
        descripcion,
        categoria_id,
        stock
      } = req.body;

      // VALIDACIÓN LIMPIA
      if (!nombre || !precio || !descripcion || !categoria_id) {
        return res.status(400).json({
          message: "Faltan campos obligatorios"
        });
      }

      let imagenes = [];

      if (req.files && req.files.imagenes) {
        imagenes = req.files.imagenes.map(
          file => `uploads/productos/${file.filename}`
        );
      }

      const imagenPrincipal = imagenes[0] || null;

      await db.query(
        `INSERT INTO productos 
        (nombre, precio, precio_combo, descripcion, categoria_id, stock, imagen, imagenes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre,
          precio,
          precio_combo || null,
          descripcion,
          categoria_id,
          stock || 0,
          imagenPrincipal,
          JSON.stringify(imagenes)
        ]
      );

      res.json({
        message: "Producto creado correctamente"
      });

    } catch (error) {
      console.error("ERROR BACKEND PRODUCTOS:", error);
      res.status(500).json({
        message: "Error al crear producto",
        error: error.message
      });
    }
  }
);


app.delete("/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [producto] = await db.query(
      "SELECT imagen, imagenes FROM productos WHERE id = ?",
      [id]
    );

    if (producto.length === 0) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    await db.query("DELETE FROM productos WHERE id = ?", [id]);

    res.json({
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.put("/productos/:id", uploadProducto.array("imagenes", 6), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      precio,
      precio_combo,
      descripcion,
      categoria_id,
      stock
    } = req.body;

    // VALIDACIÓN LIMPIA
    if (!nombre || !precio || !descripcion || !categoria_id) {
      return res.status(400).json({
        message: "Faltan campos obligatorios"
      });
    }

    let imagenPrincipal = req.body.imagenActual || "";
    let imagenes = req.body.imagenesActuales || "[]";

    // NUEVAS IMÁGENES
    if (req.files && req.files.length > 0) {
      const nuevasImagenes = req.files.map(
        file => `uploads/productos/${file.filename}`
      );

      imagenPrincipal = nuevasImagenes[0];
      imagenes = JSON.stringify(nuevasImagenes);
    }

    await db.query(
      `UPDATE productos SET
        nombre = ?,
        precio = ?,
        precio_combo = ?,
        descripcion = ?,
        categoria_id = ?,
        stock = ?,
        imagen = ?,
        imagenes = ?
      WHERE id = ?`,
      [
        nombre,
        precio,
        precio_combo || null,
        descripcion,
        categoria_id,
        stock || 0,
        imagenPrincipal,
        imagenes,
        id
      ]
    );

    res.json({
      message: "Producto actualizado correctamente"
    });

  } catch (error) {
    console.error("ERROR REAL:", error);

    res.status(500).json({
      message: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

app.post("/productos/vender", async (req, res) => {

  try {
    const { id, cantidad = 1 } = req.body;

    // validar stock primero
    const [rows] = await db.query(
      "SELECT stock, vendidos FROM productos WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const producto = rows[0];

    if (producto.stock <= 0) {
      return res.status(400).json({ message: "Agotado" });
    }

    // actualizar
    await db.query(
      `UPDATE productos 
       SET stock = stock - ?, 
           vendidos = vendidos + ?
       WHERE id = ?`,
      [cantidad, cantidad, id]
    );

    res.json({ message: "Venta realizada" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en venta" });
  }
});

/* =========================
   PEDIDOS
========================= */

const storageComprobantes = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, comprobantesPath);
  },
  filename: (req, file, cb) => {
    const nombreArchivo = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, nombreArchivo);
  }
});

const uploadComprobante = multer({
  storage: storageComprobantes
});

app.post("/pedidos", uploadComprobante.single("comprobante"), async (req, res) => {
  try {
    const {
      nombre,
      whatsapp,
      correo,
      direccion,
      ciudad,
      metodo_pago,
      productos,
      total,
      moneda,
      notas
    } = req.body;

    if (!nombre || !whatsapp || !direccion || !ciudad || !metodo_pago || !productos || !total) {
      return res.status(400).json({
        message: "Faltan campos obligatorios",
        recibido: req.body,
        archivos: req.files
      });
    }

    const comprobante = req.file
      ? `uploads/comprobantes/${req.file.filename}`
      : null;

    const [result] = await db.query(
      `INSERT INTO pedidos
      (
        nombre, whatsapp, correo, direccion, ciudad,
        metodo_pago, comprobante, productos, total, moneda, notas
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        whatsapp,
        correo || "",
        direccion,
        ciudad,
        metodo_pago,
        comprobante,
        productos,
        total,
        moneda || "COP",
        notas || ""
      ]
    );

    res.json({
      id: result.insertId,
      message: "Pedido creado correctamente"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.get("/pedidos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM pedidos
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.put("/pedidos/:id/estado", async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = ["Activo", "Revisado", "En camino", "Entregado"];

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        message: "Estado no válido"
      });
    }

    await db.query(
      "UPDATE pedidos SET estado = ? WHERE id = ?",
      [estado, id]
    );

    res.json({
      message: "Estado actualizado correctamente",
      estado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

app.delete("/pedidos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      "DELETE FROM pedidos WHERE id = ?",
      [id]
    );

    res.json({
      message: "Pedido eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar pedido:", error);

    res.status(500).json({
      message: "No se pudo eliminar el pedido",
      error: error.message
    });
  }
});

/* =========================
   VISITAS PÁGINA
========================= */

app.post("/visitas", async (req, res) => {
  try {
    const { ruta } = req.body;

    await db.query(
      `
      INSERT INTO visitas_pagina
      (ruta, user_agent, ip)
      VALUES (?, ?, ?)
      `,
      [
        ruta || "/",
        req.headers["user-agent"] || "",
        req.ip || ""
      ]
    );

    res.json({
      message: "Visita registrada"
    });

  } catch (error) {
    console.error("Error al registrar visita:", error);

    res.status(500).json({
      message: "Error al registrar visita",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

/* =========================
   DASHBOARD MÉTRICAS
========================= */

app.get("/dashboard-metricas", async (req, res) => {
  try {
    const [[visitas]] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM visitas_pagina
    `);

    const [[productos]] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM productos
    `);

    const [[pedidos]] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM pedidos
    `);

    const [[ventas]] = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS total 
      FROM pedidos
    `);

    res.json({
      ventas_totales: Number(ventas.total || 0),
      pedidos: Number(pedidos.total || 0),
      visitas: Number(visitas.total || 0),
      productos: Number(productos.total || 0),
      columna_total_usada: "total"
    });

  } catch (error) {
    console.error("Error al cargar métricas del dashboard:", error);

    res.status(500).json({
      message: "Error al cargar métricas del dashboard",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});

/* =========================
   DASHBOARD GRÁFICAS
========================= */

app.get("/dashboard-graficas", async (req, res) => {
  try {
    const periodo = req.query.periodo || "dia";

    let groupBy = "";
    let label = "";
    let whereFechaVisitas = "";
    let whereFechaPedidos = "";

    if (periodo === "dia") {
      groupBy = "DATE(v.created_at)";
      label = "DATE_FORMAT(v.created_at, '%d/%m')";
      whereFechaVisitas = "v.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)";
      whereFechaPedidos = "created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)";
    } else if (periodo === "mes") {
      groupBy = "DATE_FORMAT(v.created_at, '%Y-%m')";
      label = "DATE_FORMAT(v.created_at, '%m/%Y')";
      whereFechaVisitas = "v.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
      whereFechaPedidos = "created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
    } else if (periodo === "anio") {
      groupBy = "YEAR(v.created_at)";
      label = "YEAR(v.created_at)";
      whereFechaVisitas = "v.created_at >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)";
      whereFechaPedidos = "created_at >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)";
    } else {
      return res.status(400).json({
        message: "Periodo no válido"
      });
    }

    const [barras] = await db.query(`
      SELECT 
        ${label} AS etiqueta,
        COUNT(*) AS total
      FROM visitas_pagina v
      WHERE ${whereFechaVisitas}
      GROUP BY ${groupBy}
      ORDER BY MIN(v.created_at) ASC
    `);

    const [pedidosRows] = await db.query(`
      SELECT productos
      FROM pedidos
      WHERE ${whereFechaPedidos}
    `);

    const categoriasConteo = {};

    pedidosRows.forEach(pedido => {
      try {
        const productosPedido = JSON.parse(pedido.productos);

        if (!Array.isArray(productosPedido)) return;

        productosPedido.forEach(producto => {
          const categoria =
            producto.categoria ||
            producto.categoria_nombre ||
            producto.categoriaNombre ||
            producto.nombre_categoria ||
            producto.category ||
            "Sin categoría";

          categoriasConteo[categoria] = (categoriasConteo[categoria] || 0) + 1;
        });

      } catch (error) {
        categoriasConteo["Sin categoría"] = (categoriasConteo["Sin categoría"] || 0) + 1;
      }
    });

    const pastel = Object.entries(categoriasConteo).map(([etiqueta, total]) => ({
      etiqueta,
      total
    }));

    res.json({
      barras: {
        labels: barras.map(item => item.etiqueta),
        valores: barras.map(item => Number(item.total || 0))
      },
      pastel: {
        labels: pastel.map(item => item.etiqueta),
        valores: pastel.map(item => Number(item.total || 0))
      }
    });

  } catch (error) {
    console.error("Error al cargar gráficas:", error);

    res.status(500).json({
      message: "Error al cargar gráficas",
      sqlMessage: error.sqlMessage,
      code: error.code
    });
  }
});


/* =========================
   GET MESAS
========================= */
app.get("/mesas", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM mesas ORDER BY numero_mesa"
    );

    res.json(rows);

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
/* =========================
   POST RESERVA
========================= */
app.post("/reservas", async (req, res) => {
  try {
    const { nombre, cedula, mesa_id } = req.body;

    if (!nombre || !cedula || !mesa_id) {
      return res.status(400).json({ msg: "Datos incompletos" });
    }

    const [mesa] = await db.query(
      "SELECT * FROM mesas WHERE id=?",
      [mesa_id]
    );

    if (!mesa.length) {
      return res.status(404).json({ msg: "Mesa no existe" });
    }

    if (mesa[0].estado === "ocupado") {
      return res.status(400).json({ msg: "Mesa ocupada" });
    }

    await db.query(
      `UPDATE mesas 
       SET nombre_ocupante=?, cedula_ocupante=?, estado='ocupado' 
       WHERE id=?`,
      [nombre, cedula, mesa_id]
    );

    res.json({ msg: "Reserva creada" });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
/* =========================
   PUT MESAS (ADMIN)
========================= */
app.put("/mesas/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { estado } = req.body;

    if (estado === "disponible") {
      await db.query(
        `UPDATE mesas 
         SET estado='disponible', nombre_ocupante=NULL, cedula_ocupante=NULL 
         WHERE id=?`,
        [id]
      );
    } else {
      await db.query(
        "UPDATE mesas SET estado='ocupado' WHERE id=?",
        [id]
      );
    }

    res.json({ msg: "Actualizado" });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});