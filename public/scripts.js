
const hostname = window.location.hostname;

const esLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.") ||
  hostname.startsWith("10.") ||
  hostname.startsWith("172.");

const API_URL = esLocal
  ? `http://${hostname}:3000`
  : window.location.origin;

let imagenesPreviewProducto = [];
let imagenArrastrandoIndex = null;
let producto = null;

function formatearPrecio(precio) {
  const precioNum = Number(precio);

  if (isNaN(precioNum)) return "$0";

  return new Intl.NumberFormat("es-CO").format(precioNum);
}

let categoriaEditandoId = null;
let productoEditandoId = null;
let imagenActualProducto = "";
let imagenesActualesProducto = "[]";
let imagenesActualesPreview = [];

/* =========================
   ADMIN: FLYERS
========================= */

const abrirModalFlyer = document.getElementById("abrirModalFlyer");
const cerrarModalFlyer = document.getElementById("cerrarModalFlyer");
const modalFlyer = document.getElementById("modalFlyer");
const formFlyer = document.getElementById("formFlyer");
const imagenFlyer = document.getElementById("imagenFlyer");
const contenedorFlyers = document.getElementById("contenedorFlyers");

if (
  abrirModalFlyer &&
  cerrarModalFlyer &&
  modalFlyer &&
  formFlyer &&
  imagenFlyer &&
  contenedorFlyers
) {
  abrirModalFlyer.addEventListener("click", () => {
    modalFlyer.classList.add("activo");
  });

  cerrarModalFlyer.addEventListener("click", () => {
    modalFlyer.classList.remove("activo");
  });

  formFlyer.addEventListener("submit", async e => {
    e.preventDefault();

    const archivo = imagenFlyer.files[0];

    if (!archivo) {
      alert("Selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("imagen", archivo);

    await guardarFlyer(formData);

    formFlyer.reset();
    modalFlyer.classList.remove("activo");
  });

  cargarFlyersAdmin();
}

async function guardarFlyer(formData) {
  try {
    const url = flyerEditandoId
      ? `${API_URL}/flyers/${flyerEditandoId}`
      : `${API_URL}/flyers`;

    const method = flyerEditandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al guardar flyer");
    }

    await cargarFlyersAdmin();
    await cargarFlyersIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar el flyer");
  }
}

async function cargarFlyersAdmin() {
  if (!contenedorFlyers) return;

  try {
    const res = await fetch(`${API_URL}/flyers`);
    const flyers = await res.json();

    contenedorFlyers.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>Flyer</th>
            <th>Título</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Prioridad</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${flyers.map(flyer => `
            <tr>
              <td>
                <img 
                  src="${API_URL}/${flyer.imagen}" 
                  alt="Flyer"
                  class="flyer-admin-img"
                >
              </td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>Flyer #${flyer.id}</h4>
                    <span>Promocional</span>
                  </div>
                </div>
              </td>

              <td>
                <span class="estado-producto activo">
                  Activo
                </span>
              </td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <span class="prioridad-media">Media</span>
              </td>

              <td>
                <div class="admin-actions">
                  <button onclick="editarFlyer(${flyer.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button>
                    <i class="bi bi-eye"></i>
                  </button>

                  <button class="delete" onclick="eliminarFlyer(${flyer.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error(error);
  }
}
async function eliminarFlyer(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este flyer?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/flyers/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar flyer");
    }

    await cargarFlyersAdmin();
    await cargarFlyersIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el flyer");
  }
}

/* =========================
   INDEX: SWIPER FLYERS
========================= */

async function cargarFlyersIndex() {
  const contenedor = document.getElementById("flyersSwiper");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/flyers`);
    const flyers = await res.json();

    contenedor.innerHTML = flyers.map(flyer => `
      <div class="swiper-slide">
        <img src="${API_URL}/${flyer.imagen}" alt="Flyer">
      </div>
    `).join("");

    new Swiper(".header-swiper", {
      loop: flyers.length > 1,
      autoplay: {
        delay: 8000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
    });
  } catch (error) {
    console.error(error);
  }
}

cargarFlyersIndex();
/* =========================
   ELEMENTOS ADMIN
========================= */

const abrirModalCategoria = document.getElementById("abrirModalCategoria");
const cerrarModalCategoria = document.getElementById("cerrarModalCategoria");
const modalCategoria = document.getElementById("modalCategoria");
const formCategoria = document.getElementById("formCategoria");
const nombreCategoria = document.getElementById("nombreCategoria");
const imagenCategoria = document.getElementById("imagenCategoria");
const contenedorCategorias = document.getElementById("contenedorCategorias");

let categorias = [];

/* =========================
   ADMIN: CATEGORÍAS
========================= */

if (
  abrirModalCategoria &&
  cerrarModalCategoria &&
  modalCategoria &&
  formCategoria &&
  nombreCategoria &&
  imagenCategoria &&
  contenedorCategorias
) {
  abrirModalCategoria.addEventListener("click", () => {
    modalCategoria.classList.add("activo");
  });

  cerrarModalCategoria.addEventListener("click", () => {
    modalCategoria.classList.remove("activo");
  });

  formCategoria.addEventListener("submit", async e => {
    e.preventDefault();

    const nombre = nombreCategoria.value.trim();
    const archivo = imagenCategoria.files[0];

    if (!nombre) {
      alert("Escribe el nombre de la categoría");
      return;
    }

    if (!archivo) {
      alert("Selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("imagen", archivo);

    await guardarCategoria(formData);

    formCategoria.reset();
    modalCategoria.classList.remove("activo");
  });

  cargarCategoriasAdmin();
}


async function guardarCategoria(formData) {
  try {
    const url = categoriaEditandoId
      ? `${API_URL}/categorias/${categoriaEditandoId}`
      : `${API_URL}/categorias`;

    const method = categoriaEditandoId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al guardar la categoría");
    }

    await cargarCategoriasAdmin();

  } catch (error) {
    console.error(error);
    alert("No se pudo guardar la categoría");
  }
}
async function cargarCategoriasAdmin() {
  if (!contenedorCategorias) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();

    contenedorCategorias.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Productos</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${categorias.map(categoria => `
            <tr>
              <td>
                <img 
                  src="${API_URL}/${categoria.imagen}" 
                  alt="${categoria.nombre}"
                  class="categoria-admin-img"
                >
              </td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>${categoria.nombre}</h4>
                    <span>ID: ${categoria.id}</span>
                  </div>
                </div>
              </td>

              <td>0</td>

              <td>
                <span class="estado-producto activo">
                  Activa
                </span>
              </td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <div class="admin-actions">

                  <button onclick="editarCategoria(${categoria.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <button class="delete" onclick="eliminarCategoria(${categoria.id})">
                    <i class="bi bi-trash"></i>
                  </button>

                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error(error);
  }
}

function mostrarCategoriasAdmin() {
  if (!contenedorCategorias) return;

  contenedorCategorias.innerHTML = "";

  categorias.forEach(categoria => {
    contenedorCategorias.innerHTML += `
      <div class="categoria-card">
        <button class="eliminar-categoria" onclick="eliminarCategoria(${categoria.id})">X</button>
        <img src="${API_URL}/${categoria.imagen}" alt="${categoria.nombre}">
        <h3>${categoria.nombre}</h3>
      </div>
    `;
  });
}

async function eliminarCategoria(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar esta categoría?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/categorias/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar la categoría");
    }

    await cargarCategoriasAdmin();
    categoriaEditandoId = null;
    await cargarCategoriasIndex();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar la categoría");
  }
}

async function editarCategoria(id) {
  const res = await fetch(`${API_URL}/categorias`);
  const categorias = await res.json();

  const categoria = categorias.find(c => c.id == id);

  if (!categoria) return;

  categoriaEditandoId = id;
  nombreCategoria.value = categoria.nombre;
  modalCategoria.classList.add("activo");
}
/* =========================
   INDEX: CATEGORÍAS
========================= */

async function cargarCategoriasIndex() {
  const contenedor = document.getElementById("categoriasIndex");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);

    if (!res.ok) {
      throw new Error("Error al cargar categorías");
    }

    const categoriasIndex = await res.json();

    contenedor.innerHTML = categoriasIndex.map(categoria => `
      <a href="catalogo.html?categoria=${categoria.id}" class="categoria-card categoria-link">
        <img src="${API_URL}/${categoria.imagen}" alt="${categoria.nombre}">
        <h3>${categoria.nombre}</h3>
      </a>
    `).join("");

  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudieron cargar las categorías.</p>";
  }
}

cargarCategoriasIndex();


function editarFlyer(id) {
  flyerEditandoId = id;
  modalFlyer.classList.add("activo");
}

/* =========================
   MODAL PRODUCTO
========================= */

const abrirModalProducto = document.getElementById("abrirModalProducto");
const cerrarModalProducto = document.getElementById("cerrarModalProducto");
const modalProducto = document.getElementById("modalProducto");
const cancelarProducto = document.getElementById("cancelarProducto");
const formProducto = document.getElementById("formProducto");

/* =========================
   CAMPOS SIMPLES
========================= */

const nombreProducto = document.getElementById("nombreProducto");
const precioProducto = document.getElementById("precioProducto");
const precioComboProducto = document.getElementById("precioComboProducto");
const descripcionProducto = document.getElementById("descripcionProducto");
const categoriaProducto = document.getElementById("categoriaProducto");
const stockProducto = document.getElementById("stockProducto");
const contenedorProductos = document.getElementById("contenedorProductos");
/* =========================
   IMÁGENES (NO TOCAR)
========================= */

const imagenesProducto = document.getElementById("imagenesProducto");
const previewGaleria = document.getElementById("previewGaleria");
const contadorImagenes = document.getElementById("contadorImagenes");

/* estado imágenes (se mantiene porque tu sistema lo usa) */
let imagenesSeleccionadas = [];

/* =========================
   ABRIR MODAL
========================= */

if (abrirModalProducto && modalProducto) {
  abrirModalProducto.addEventListener("click", () => {
    modalProducto.classList.add("activo");
    cargarCategoriasSelectProducto();
  });
}

/* =========================
   CERRAR MODAL
========================= */

function cerrarModalProductoAdmin() {
  if (!modalProducto || !formProducto) return;

  modalProducto.classList.remove("activo");
  formProducto.reset();

  productoEditandoId = null;

  /* reset imágenes sin romper lógica */
  imagenesSeleccionadas = [];
  imagenesActualesProducto = "[]";
  imagenesActualesPreview = [];
  imagenesPreviewProducto = [];

  mostrarPreviewImagenes();
}

if (cerrarModalProducto) {
  cerrarModalProducto.addEventListener("click", cerrarModalProductoAdmin);
}

if (cancelarProducto) {
  cancelarProducto.addEventListener("click", cerrarModalProductoAdmin);
}


/* =========================
   IMÁGENES (LIMPIO)
========================= */

if (imagenesProducto) {
  imagenesProducto.addEventListener("change", e => {
    const archivos = Array.from(e.target.files || []);
    if (archivos.length === 0) return;

    const totalActual =
      imagenesActualesPreview.length +
      imagenesSeleccionadas.length;

    const espacioDisponible = 6 - totalActual;

    if (espacioDisponible <= 0) {
      alert("Solo puedes subir máximo 6 imágenes");
      imagenesProducto.value = "";
      return;
    }

    const archivosPermitidos = archivos.slice(0, espacioDisponible);

    imagenesSeleccionadas = [
      ...imagenesSeleccionadas,
      ...archivosPermitidos
    ];

    if (archivos.length > espacioDisponible) {
      alert(`Solo se agregaron ${espacioDisponible} imágenes. Máximo 6.`);
    }

    imagenesProducto.value = "";
    mostrarPreviewImagenes();
  });
}



/* =========================
   UTILIDADES
========================= */

function obtenerUrlImagen(ruta) {
  if (!ruta) return "img/no-image.png";

  if (ruta.startsWith("http")) return ruta;

  return `${API_URL}/${ruta.replace(/^\/+/, "")}`;
}

function obtenerImagenesProducto(producto) {
  let imagenes = [];

  try {
    imagenes = producto.imagenes ? JSON.parse(producto.imagenes) : [];
  } catch (e) {
    imagenes = [];
  }

  if (producto.imagen && !imagenes.includes(producto.imagen)) {
    imagenes.unshift(producto.imagen);
  }

  return [...new Set(imagenes)].filter(Boolean);
}

/* =========================
   PREVIEW
========================= */

function mostrarPreviewImagenes() {
  if (!previewGaleria) return;

  previewGaleria.innerHTML = "";

  const imagenesPreview = [
    ...imagenesActualesPreview.map(img => ({
      tipo: "actual",
      valor: img
    })),
    ...imagenesSeleccionadas.map(img => ({
      tipo: "nueva",
      valor: img
    }))
  ];

  if (contadorImagenes) {
    contadorImagenes.textContent =
      `${imagenesPreview.length}/6 imágenes`;
  }

  imagenesPreview.forEach((imagen, index) => {
    const item = document.createElement("div");

    item.classList.add("preview-item");
    item.draggable = true;
    item.dataset.index = index;

    if (imagen.tipo === "actual") {
      item.style.backgroundImage =
        `url('${obtenerUrlImagen(imagen.valor)}')`;
    }

    if (imagen.tipo === "nueva") {
      item.style.backgroundImage =
        `url('${URL.createObjectURL(imagen.valor)}')`;
    }

    item.innerHTML = `
      <span>${index + 1}</span>
      <button type="button"
        class="btn-eliminar-preview"
        onclick="eliminarImagenPreviewProducto(${index})">
        ×
      </button>
    `;

    previewGaleria.appendChild(item);
  });
}

/* =========================
   ELIMINAR IMAGEN
========================= */

function eliminarImagenPreviewProducto(index) {
  const imagenesPreview = [
    ...imagenesActualesPreview.map(img => ({
      tipo: "actual",
      valor: img
    })),
    ...imagenesSeleccionadas.map(img => ({
      tipo: "nueva",
      valor: img
    }))
  ];

  imagenesPreview.splice(index, 1);

  imagenesActualesPreview = imagenesPreview
    .filter(i => i.tipo === "actual")
    .map(i => i.valor);

  imagenesSeleccionadas = imagenesPreview
    .filter(i => i.tipo === "nueva")
    .map(i => i.valor);

  imagenActualProducto = imagenesActualesPreview[0] || "";
  imagenesActualesProducto = JSON.stringify(imagenesActualesPreview);

  if (imagenesProducto) {
    imagenesProducto.value = "";
  }

  mostrarPreviewImagenes();
}

/* CATEGORÍAS EN SELECT */

async function cargarCategoriasSelectProducto() {
  if (!categoriaProducto) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();

    categoriaProducto.innerHTML = `
      <option value="">Selecciona una categoría</option>
      ${categorias.map(categoria => `
        <option value="${categoria.id}">${categoria.nombre}</option>
      `).join("")}
    `;
  } catch (error) {
    console.error(error);
  }
}

let tipoProducto = "normal";

document.querySelectorAll("[data-tipo-producto]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tipo-producto]").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");

    tipoProducto = btn.dataset.tipoProducto;
  });
});

function obtenerTotalImagenesProducto() {
  const imagenesActuales = Array.isArray(imagenesActualesPreview)
    ? imagenesActualesPreview.length
    : 0;

  const imagenesNuevas = Array.isArray(imagenesSeleccionadas)
    ? imagenesSeleccionadas.filter(imagen => imagen instanceof File || imagen instanceof Blob).length
    : 0;

  return imagenesActuales + imagenesNuevas;
}

/* GUARDAR PRODUCTO */

if (formProducto) {
  formProducto.addEventListener("submit", async e => {
    e.preventDefault();

    const precio = parseFloat(precioProducto.value);

    if (isNaN(precio) || precio <= 0) {
      alert("Precio no válido");
      return;
    }

    const totalImagenesProducto =
      imagenesActualesPreview.length + imagenesSeleccionadas.length;

    if (totalImagenesProducto === 0) {
      alert("Selecciona mínimo una imagen");
      return;
    }



    const formData = new FormData();

    formData.append("nombre", nombreProducto.value.trim());
    formData.append("precio", precio);
    formData.append(
      "precio_combo",
      precioComboProducto?.value || ""
    );
    formData.append("descripcion", descripcionProducto.value.trim());
    formData.append("categoria_id", categoriaProducto.value);
    formData.append("tipo_producto", tipoProducto);

    formData.append("imagenActual", imagenActualProducto || imagenesActualesPreview[0] || "");
    formData.append("imagenesActuales", JSON.stringify(imagenesActualesPreview));

    imagenesSeleccionadas.forEach(imagen => {
      formData.append("imagenes", imagen);
    });

    const url = productoEditandoId
      ? `${API_URL}/productos/${productoEditandoId}`
      : `${API_URL}/productos`;

    const method = productoEditandoId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("ERROR BACKEND:", errorData);
        throw new Error("Error al guardar producto");
      }

      await cargarProductosAdmin();
      cerrarModalProductoAdmin();

      alert("Producto guardado correctamente");

    } catch (error) {
      console.error(error);
      alert("No se pudo guardar el producto");
    }
  });
}
/* MOSTRAR PRODUCTOS ADMIN */

async function cargarProductosAdmin() {
  if (!contenedorProductos) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    contenedorProductos.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th><input type="checkbox"></th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Precio</th> <!-- Aquí mostramos el precio -->
            <th>Stock</th>
            <th>Vendidos</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${productos.map(producto => `
            <tr>
              <td><input type="checkbox"></td>

              <td>
                <div class="admin-product-info">
                  <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
                  <div>
                    <h4>${producto.nombre}</h4>
                    <span>SKU: ${producto.sku || "N/A"}</span>
                  </div>
                </div>
              </td>

              <td>${producto.categoria || "Sin categoría"}</td>

              <!-- Usamos la función formatearPrecio para mostrar el precio -->
              <td>${formatearPrecio(producto.precio)}</td> 

              <td class="${Number(producto.stock) <= 5 ? "stock-low" : "stock-ok"}">
                ${producto.stock || 0}
              </td>

              <td>0</td>

              <td>${new Date().toLocaleDateString()}</td>

              <td>
                <div class="admin-actions">
                  <button onclick="editarProducto(${producto.id})">
                    <i class="bi bi-pencil"></i>
                  </button>

                  <a href="producto.html?id=${producto.id}">
                    <i class="bi bi-eye"></i>
                  </a>

                  <button class="delete" onclick="eliminarProducto(${producto.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error("Error al cargar los productos:", error);
  }
}

function renderTabla() {
  const tbody = document.getElementById("tablaProductos");
  tbody.innerHTML = "";

  productos.forEach((p, index) => {

    tbody.innerHTML += `
      <tr>
        <td>${p.nombre}</td>

        <td>
          ${p.stock <= 0
        ? `<span style="color:red;font-weight:bold;">AGOTADO</span>`
        : p.stock}
        </td>

        <td>${p.vendidos}</td>

        <td>
          <button onclick="vender(${index})">Vender</button>
        </td>
      </tr>
    `;
  });
}

function vender(index) {

  let producto = productos[index];

  if (producto.stock === 0) {
    Swal.fire({
      icon: "warning",
      title: "Última unidad vendida",
      text: `${producto.nombre} quedó AGOTADO`
    });
  }
  producto.stock -= 1;
  producto.vendidos += 1;

  renderTabla();

  Swal.fire({
    icon: "success",
    title: "Venta realizada",
    text: `Vendiste ${producto.nombre}`,
    timer: 1200,
    showConfirmButton: false
  });
}

// Función para crear la fila de un producto
function crearFilaProducto(producto) {
  const estadoProducto = Number(producto.stock) <= 0 ? "agotado" : "activo";
  const estadoClase = Number(producto.stock) <= 0 ? "agotado" : "activo";
  const stockClase = Number(producto.stock) <= 5 ? "stock-low" : "stock-ok";

  return `
    <tr>
      <td><input type="checkbox"></td>

      <td>
        <div class="admin-product-info">
          <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
          <div>
            <h4>${producto.nombre}</h4>
            <span>SKU: ${producto.sku || "N/A"}</span>
          </div>
        </div>
      </td>

      <td>${producto.categoria || "Sin categoría"}</td>

      <td>${formatearPrecio(producto.precio)}</td>

      <td class="${stockClase}">
        ${producto.stock || 0}
      </td>

      <td>0</td>

      <td>
        <span class="estado-producto ${estadoClase}">
          ${estadoProducto}
        </span>
      </td>

      <td>${new Date().toLocaleDateString()}</td>

      <td>
        <div class="admin-actions">
          <button onclick="editarProducto(${producto.id})">
            <i class="bi bi-pencil"></i>
          </button>

          <a href="producto.html?id=${producto.id}">
            <i class="bi bi-eye"></i>
          </a>

          <button class="delete" onclick="eliminarProducto(${producto.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

async function eliminarProducto(id) {
  const confirmar = confirm("¿Seguro que quieres eliminar este producto?");

  if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/productos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error al eliminar producto");
    }

    await cargarProductosAdmin();
  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el producto");
  }
}
async function editarProducto(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`);

    if (!res.ok) {
      throw new Error("Error al obtener el producto");
    }

    const producto = await res.json();

    // =========================
    // Modo edición
    // =========================
    productoEditandoId = id;

    // =========================
    // Imágenes actuales para mover/eliminar
    // =========================
    imagenesPreviewProducto = obtenerImagenesProducto(producto).map(ruta => {
      return {
        tipo: "actual",
        valor: ruta
      };
    });

    imagenesSeleccionadas = [];

    sincronizarImagenesDesdePreview();

    // =========================
    // Cargar categorías
    // =========================
    await cargarCategoriasSelectProducto();

    // =========================
    // Datos principales
    // =========================
    nombreProducto.value = producto.nombre || "";
    precioProducto.value = producto.precio || "";
    descripcionProducto.value = producto.descripcion || "";
    categoriaProducto.value = producto.categoria_id || "";
    tipoProducto = producto.tipo_producto || "normal";

    if (stockProducto) {
      stockProducto.value = "";
    }

    // =========================
    // Restaurar botones tipo producto
    // =========================
    document.querySelectorAll("[data-tipo-producto]").forEach(btn => {
      btn.classList.remove("activo");

      if (btn.dataset.tipoProducto === tipoProducto) {
        btn.classList.add("activo");
      }
    });


    // =========================
    // Abrir modal
    // =========================
    modalProducto.classList.add("activo");

  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el producto");
  }
}

cargarProductosAdmin();


let productosIndexSwiper = null;

function mezclarProductos(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

let swiperProductos = null;

function mezclarProductos(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

async function cargarProductosIndex() {
  const contenedor = document.getElementById("productosIndex");
  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    if (!productos || productos.length === 0) return;

    const productosAleatorios = mezclarProductos(productos).slice(0, 12);

    let productosSlider = [...productosAleatorios];

    while (productosSlider.length < 18 && productosAleatorios.length > 0) {
      productosSlider = productosSlider.concat(productosAleatorios);
    }

    contenedor.innerHTML = productosSlider.map(producto => `
      <div class="swiper-slide">
        <a href="producto.html?id=${producto.id}" class="catalogo-card">

          <div class="catalogo-img">
            <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
          </div>

          <div class="catalogo-card-info">
            <h3>${producto.nombre}</h3>

            <div class="precios">

              <div class="precio-normal">
                <span>Precio</span>
                <strong>${formatearPrecio(producto.precio)}</strong>
              </div>

              ${producto.precio_combo ? `
                <div class="precio-combo">
                  <span>Combo</span>
                  <strong>${formatearPrecio(producto.precio_combo)}</strong>
                </div>
              ` : ""}

            </div>

          </div>

          <button 
            type="button"
            class="catalogo-cart btn-carrito-listado" 
            data-id="${producto.id}"
          >
            <i class="bi bi-cart"></i> Agregar al Carrito
          </button>

        </a>
      </div>

        </a>
      </div>
    `).join("");

    if (swiperProductos) {
      swiperProductos.destroy(true, true);
    }

    swiperProductos = new Swiper(".productosSwiper", {
      slidesPerView: "auto",
      spaceBetween: 18,
      loop: true,

      speed: 6000,

      freeMode: {
        enabled: true,
        momentum: false
      },

      autoplay: {
        delay: 0,
        disableOnInteraction: false
      },

      loopAdditionalSlides: productosSlider.length,

      breakpoints: {
        0: { spaceBetween: 12 },
        768: { spaceBetween: 16 },
        1024: { spaceBetween: 20 }
      }
    });

  } catch (error) {
    console.error(error);
  }
}

cargarProductosIndex();

/* =========================
   PÁGINA DETALLE PRODUCTO
========================= */

let cantidadDetalle = 1;


async function cargarDetalleProducto() {
  const contenedor = document.getElementById("productoDetalle");

  if (!contenedor) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    contenedor.innerHTML = "<p>Producto no encontrado.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    producto = await res.json();

    const imagenes = producto.imagenes
      ? JSON.parse(producto.imagenes)
      : [producto.imagen];

    let variantes = [];

    try {
      variantes = producto.variantes ? JSON.parse(producto.variantes) : [];
    } catch (error) {
      variantes = [];
    }

    variantesDetalle = variantes.filter(variante => Number(variante.stock) > 0);

    const coloresDisponibles = [
      ...new Set(
        variantesDetalle.flatMap(variante => variante.colores || [])
      )
    ];

    cantidadDetalle = 1;
    tallaSeleccionadaDetalle = "";
    colorSeleccionadoDetalle = "";

    contenedor.innerHTML = `
      <div class="producto-galeria">

  <div class="producto-miniaturas">
    ${imagenes.map((img, index) => `
      <img 
        src="${API_URL}/${img}" 
        class="${index === 0 ? "activo" : ""}"
        onclick="cambiarImagenProducto('${API_URL}/${img}', this)"
      >
    `).join("")}
  </div>

  <div class="producto-imagen-principal">
    <img id="imagenPrincipalProducto" src="${API_URL}/${imagenes[0]}" loading="lazy" decoding="async" alt="${producto.nombre}">
  </div>

</div>

<div class="producto-info-detalle">

  <span class="producto-categoria-tag">
    ${producto.categoria}
  </span>

  <h1>${producto.nombre}</h1>

  <!-- 💰 PRECIOS UNIFICADOS -->
  <div class="precios detalle-precios">

    <div class="precio-normal">
      <span>Precio</span>
      <strong>${formatearPrecio(producto.precio)}</strong>
    </div>

    ${producto.precio_combo ? `
      <div class="precio-combo">
        <span>Combo</span>
        <strong>${formatearPrecio(producto.precio_combo)}</strong>
      </div>
    ` : ""}

  </div>

  <p class="producto-descripcion-detalle">
    ${producto.descripcion || ""}
  </p>

  <hr>

  <!-- CANTIDAD -->
  <div class="producto-cantidad">
    <h4>Cantidad</h4>

    <div class="cantidad-control">
      <button type="button" onclick="cambiarCantidadDetalle(-1)">−</button>
      <span id="cantidadDetalle">1</span>
      <button type="button" onclick="cambiarCantidadDetalle(1)">+</button>
    </div>
  </div>

  <!-- BOTÓN -->
  <div class="producto-botones-detalle">
    <button class="btn-agregar-carrito">
      <i class="bi bi-cart"></i> Agregar al carrito
    </button>
  </div>

</div>
    `;

    cargarProductosSimilares(producto.categoria_id, producto.id);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudo cargar el producto.</p>";
  }
}

function cambiarImagenProducto(src, elemento) {
  document.getElementById("imagenPrincipalProducto").src = src;

  document.querySelectorAll(".producto-miniaturas img").forEach(img => {
    img.classList.remove("activo");
  });

  elemento.classList.add("activo");
}

function cambiarCantidadDetalle(valor) {
  cantidadDetalle += valor;

  if (cantidadDetalle < 1) cantidadDetalle = 1;

  document.getElementById("cantidadDetalle").textContent = cantidadDetalle;
}

async function cargarProductosSimilares(categoriaId, productoActualId) {
  const contenedor = document.getElementById("productosSimilares");

  if (!contenedor) return;

  const res = await fetch(`${API_URL}/productos`);
  const productos = await res.json();

  const similares = productos.filter(producto =>
    producto.categoria_id == categoriaId && producto.id != productoActualId
  );

  contenedor.innerHTML = similares.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">

      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" loading="lazy" decoding="async" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">

        <h3>${producto.nombre}</h3>

        <div class="precios">

          <div class="precio-normal">
            <span>Precio</span>
            <strong>${formatearPrecio(producto.precio)}</strong>
          </div>

          ${producto.precio_combo ? `
          <div class="precio-combo">
            <span>Combo</span>
            <strong>${formatearPrecio(producto.precio_combo)}</strong>
          </div>
          ` : ""}

        </div>

      </div>

      <div class="catalogo-btn-wrapper">
        <button 
          type="button"
          class="catalogo-cart btn-carrito-listado catalogo-menu"
          data-id="${producto.id}"
        >
          <i class="bi bi-cart"></i> Agregar al Carrito
        </button>
      </div>

    </a>
  `).join("");
}

cargarDetalleProducto();
/* =========================
   CATALOGO
========================= */
const buscadorIndex = document.querySelector(".catalogo-search");

if (buscadorIndex && document.getElementById("productosIndex")) {
  buscadorIndex.addEventListener("click", () => {
    window.location.href = "catalogo.html";
  });
}

let productosCatalogoData = [];
let categoriaActivaCatalogo = "todos";

async function cargarCatalogo() {
  const contenedor = document.getElementById("productosCatalogo");
  const filtros = document.getElementById("filtrosCategorias");

  if (!contenedor || !filtros) return;

  try {
    const resProductos = await fetch(`${API_URL}/productos`);
    const resCategorias = await fetch(`${API_URL}/categorias`);

    const todosLosProductos = await resProductos.json();
    productosCatalogoData = todosLosProductos;
    const categorias = await resCategorias.json();

    filtros.innerHTML = `
      <button 
        class="activo" 
        data-categoria="todos"
        onclick="filtrarCatalogoCategoria('todos', this)"
      >
        Todos los productos <span>${productosCatalogoData.length}</span>
      </button>

      ${categorias.map(categoria => {
      const total = productosCatalogoData.filter(p => p.categoria_id == categoria.id).length;

      return `
          <button 
            data-categoria="${categoria.id}"
            onclick="filtrarCatalogoCategoria('${categoria.id}', this)"
          >
            ${categoria.nombre} <span>${total}</span>
          </button>
        `;
    }).join("")}
    `;

    const params = new URLSearchParams(window.location.search);
    const categoriaURL = params.get("categoria");

    if (categoriaURL) {
      categoriaActivaCatalogo = categoriaURL;

      const botonCategoria = document.querySelector(
        `.filtros-categorias button[data-categoria="${categoriaURL}"]`
      );

      document.querySelectorAll(".filtros-categorias button").forEach(btn => {
        btn.classList.remove("activo");
      });

      if (botonCategoria) {
        botonCategoria.classList.add("activo");
      }

      aplicarFiltrosCatalogo();
    } else {
      pintarCatalogo(productosCatalogoData);
    }

  } catch (error) {
    console.error(error);
  }
}

function pintarCatalogo(productos) {
  const contenedor = document.getElementById("productosCatalogo");
  const contador = document.getElementById("contadorCatalogo");

  if (!contenedor) return;

  if (contador) {
    contador.textContent = `Mostrando ${productos.length} productos`;
  }

  contenedor.innerHTML = productos.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">

      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" loading="lazy" decoding="async" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info menu-h3">

        <h3>${producto.nombre}</h3>

        <div class="precios">

          <div class="precio-normal">
            <span>Precio</span>
            <strong>${formatearPrecio(producto.precio)}</strong>
          </div>

          ${producto.precio_combo ? `
          <div class="precio-combo">
            <span>Combo</span>
            <strong>${formatearPrecio(producto.precio_combo)}</strong>
          </div>
          ` : ""}

        </div>

      </div>

      <div class="catalogo-btn-wrapper">
        <button 
          type="button"
          class="catalogo-cart btn-carrito-listado menu"
          data-id="${producto.id}"
        >
          <i class="bi bi-cart"></i> Agregar al Carrito
        </button>
      </div>

    </a>
  `).join("");
}

function filtrarCatalogoCategoria(categoriaId, boton) {
  categoriaActivaCatalogo = categoriaId;

  document.querySelectorAll(".filtros-categorias button").forEach(btn => {
    btn.classList.remove("activo");
  });

  boton.classList.add("activo");

  aplicarFiltrosCatalogo();
}

function aplicarFiltrosCatalogo() {
  let productos = [...productosCatalogoData];

  const textoBusqueda = document.getElementById("buscarCatalogo")?.value.toLowerCase().trim() || "";

  if (categoriaActivaCatalogo !== "todos") {
    productos = productos.filter(producto => producto.categoria_id == categoriaActivaCatalogo);
  }

  if (textoBusqueda) {
    productos = productos.filter(producto =>
      producto.nombre?.toLowerCase().includes(textoBusqueda)
    );
  }

  const min = Number(document.getElementById("precioMin")?.value || 0);
  const max = Number(document.getElementById("precioMax")?.value || 0);

  if (min > 0) {
    productos = productos.filter(producto => Number(producto.precio) >= min);
  }

  if (max > 0) {
    productos = productos.filter(producto => Number(producto.precio) <= max);
  }

  const orden = document.getElementById("ordenCatalogo")?.value;

  if (orden === "mayor") {
    productos.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  if (orden === "menor") {
    productos.sort((a, b) => Number(a.precio) - Number(b.precio));
  }

  if (orden === "nombre") {
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  pintarCatalogo(productos);
}
document.getElementById("filtrarPrecio")?.addEventListener("click", aplicarFiltrosCatalogo);
document.getElementById("ordenCatalogo")?.addEventListener("change", aplicarFiltrosCatalogo);
document.getElementById("buscarCatalogo")?.addEventListener("input", aplicarFiltrosCatalogo);


cargarCatalogo();

/* =========================
   CARRITO GLOBAL
========================= */

function sincronizarCarrito() {
  guardarCarrito();
  pintarCarritoModal();
  actualizarTotalesCarrito();
}

let carritoProductos = JSON.parse(localStorage.getItem("carritoProductos")) || [];

function crearModalCarritoSiNoExiste() {
  if (document.getElementById("modalCarrito")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <button id="btnCarritoFlotante" class="carrito-flotante">
      <i class="bi bi-cart"></i> <span id="contadorCarrito">0</span>
    </button>

    <div id="modalCarrito" class="modal-carrito">
      <div class="modal-carrito-content">
        <span id="cerrarModalCarrito" class="cerrar-carrito">&times;</span>
        <h2>Carrito de compras</h2>
        <div id="listaCarritoModal" class="lista-carrito-modal"></div>

        <div class="carrito-total-box">
          <span>Total:</span>
          <strong id="totalCarrito">$0</strong>
        </div>

        <button class="btn-finalizar-compra">
          Finalizar compra
        </button>
      </div>
    </div>
  `);
}

crearModalCarritoSiNoExiste();

document.addEventListener("click", async e => {
  const btnFlotante = e.target.closest("#btnCarritoFlotante");
  const btnCerrar = e.target.closest("#cerrarModalCarrito");
  const btnDetalle = e.target.closest(".btn-agregar-carrito");
  const btnListado = e.target.closest(".btn-carrito-listado");

  if (btnFlotante) {
    document.getElementById("modalCarrito").classList.add("activo");
    pintarCarritoModal();
    return;
  }

  if (btnCerrar) {
    document.getElementById("modalCarrito").classList.remove("activo");
    return;
  }

  if (btnDetalle) {
    e.preventDefault();
    e.stopPropagation();

    agregarProductoDetalleAlCarrito();
    return;
  }

  if (btnListado) {
    e.preventDefault();
    e.stopPropagation();

    const id = btnListado.dataset.id;
    await agregarProductoListadoAlCarrito(id);
    return;
  }
});

async function agregarProductoListadoAlCarrito(id) {
  try {
    const res = await fetch(`${API_URL}/productos/${id}`);
    const producto = await res.json();

    let variantes = [];

    try {
      variantes = producto.variantes ? JSON.parse(producto.variantes) : [];
    } catch (error) {
      variantes = [];
    }

    const variantesDisponibles = variantes.filter(variante => Number(variante.stock) > 0);

    // Si tiene variantes, debe ir al detalle para escoger color y talla
    const tieneOpciones = variantesDisponibles.some(variante => {
      const tieneColores = Array.isArray(variante.colores) && variante.colores.length > 0;
      const tieneTallas = Array.isArray(variante.tallas) && variante.tallas.length > 0;

      return tieneColores || tieneTallas;
    });

    if (tieneOpciones) {
      window.location.href = `producto.html?id=${producto.id}`;
      return;
    }
    // Si no tiene variantes, sí se puede agregar directo
    carritoProductos.push({
      id: Date.now(),
      producto_id: producto.id,
      nombre: producto.nombre,
      imagen: `${API_URL}/${producto.imagen}`,

      precio_normal: Number(producto.precio),
      precio_combo: producto.precio_combo ? Number(producto.precio_combo) : null,

      tipo_precio: "normal",
      precio: Number(producto.precio),

      cantidad: 1
    });
    sincronizarCarrito();

  } catch (error) {
    console.error(error);
    alert("No se pudo agregar el producto");
  }
}

function agregarProductoDetalleAlCarrito() {

  const nombre = producto.nombre;
  const imagen = document.getElementById("imagenPrincipalProducto")?.src;

  const precioNormal = Number(producto.precio);
  const precioCombo = producto.precio_combo ? Number(producto.precio_combo) : null;

  if (!nombre || !precioNormal || !imagen) {
    alert("Error al agregar producto");
    return;
  }

  let precioActivo = precioNormal;

  if (tipoProducto === "combo" && precioCombo) {
    precioActivo = precioCombo;
  }

  carritoProductos.push({
    id: Date.now(),
    producto_id: producto.id,
    nombre: producto.nombre,
    imagen: `${API_URL}/${producto.imagen}`,

    precio_normal: Number(producto.precio),
    precio_combo: producto.precio_combo ? Number(producto.precio_combo) : null,

    tipo_precio: "normal",
    precio: Number(producto.precio),

    cantidad: 1
  });
  sincronizarCarrito();
}

function productoTieneColoresDetalle() {
  return variantesDetalle.some(variante => {
    return Array.isArray(variante.colores) && variante.colores.length > 0;
  });
}

function productoTieneTallasDetalle() {
  return variantesDetalle.some(variante => {
    return Array.isArray(variante.tallas) && variante.tallas.length > 0;
  });
}

function pintarCarritoModal() {
  const listaCarritoModal = document.getElementById("listaCarritoModal");

  if (!listaCarritoModal) return;

  if (carritoProductos.length === 0) {
    listaCarritoModal.innerHTML = "<p>Tu carrito está vacío.</p>";
    actualizarTotalesCarrito();
    return;
  }

  listaCarritoModal.innerHTML = carritoProductos.map(producto => `
    <div class="item-carrito">
      <img src="${producto.imagen}" alt="${producto.nombre}">

      <div class="item-carrito-info">
        <h4>${producto.nombre}</h4>

        <div class="item-carrito-precios">
          <p>
            Precio unitario:
            <strong>$${formatearPrecio(producto.precio)}</strong>
          </p>

          ${producto.precio_combo ? `
        
          ` : ""}

          <p>
            Total:
            <strong>$${formatearPrecio(producto.precio * producto.cantidad)}</strong>
          </p>

        </div>

        <div class="selector-precio">
          <button
            class="btn-precio ${producto.tipo_precio === 'normal' ? 'activo' : ''}"
            onclick="cambiarTipoPrecioCarrito(${producto.id}, 'normal')"
          >
            Normal
          </button>

          ${producto.precio_combo ? `
            <button
              class="btn-precio ${producto.tipo_precio === 'combo' ? 'activo' : ''}"
              onclick="cambiarTipoPrecioCarrito(${producto.id}, 'combo')"
            >
              Combo
            </button>
          ` : ""}

        </div>

        <div class="item-carrito-actions">
          <button onclick="cambiarCantidadCarrito(${producto.id}, -1)">−</button>
          <span>${producto.cantidad}</span>
          <button onclick="cambiarCantidadCarrito(${producto.id}, 1)">+</button>
          <button class="btn-eliminar-item" onclick="eliminarProductoCarrito(${producto.id})">🗑</button>
        </div>
      </div>
    </div>
  `).join("");

  actualizarTotalesCarrito();
}

function setTipoPrecio(tipo) {
  producto.tipo_precio
}

function cambiarCantidadCarrito(id, valor) {

  carritoProductos = carritoProductos.map(p => {

    if (p.id === id) {

      const nuevaCantidad = (Number(p.cantidad) || 1) + valor;

      return {
        ...p,
        cantidad: nuevaCantidad < 1 ? 1 : nuevaCantidad
      };
    }

    return p;
  });

  sincronizarCarrito();
}

function cambiarTipoPrecioCarrito(id, tipo) {

  carritoProductos = carritoProductos.map(p => {

    if (p.id === id) {

      let nuevoPrecio = p.precio_normal; // 🔥 SIEMPRE BASE

      if (tipo === "combo" && p.precio_combo) {
        nuevoPrecio = p.precio_combo;
      }

      return {
        ...p,
        tipo_precio: tipo,
        precio: Number(nuevoPrecio)
      };
    }

    return p;
  });

  sincronizarCarrito();
}

function eliminarProductoCarrito(id) {
  carritoProductos = carritoProductos.filter(producto => producto.id !== id);
  sincronizarCarrito();
}
function actualizarTotalesCarrito() {

  const cantidadTotal = carritoProductos.reduce((t, p) => {
    return t + (Number(p.cantidad) || 1);
  }, 0);

  document.querySelectorAll("#contadorCarrito").forEach(el => {
    el.textContent = cantidadTotal;
  });

  const precioTotal = carritoProductos.reduce((t, p) => {
    return t + ((Number(p.precio) || 0) * (Number(p.cantidad) || 1));
  }, 0);

  document.querySelectorAll("#totalCarrito").forEach(el => {
    el.textContent = `$${precioTotal.toLocaleString()}`;
  });
}

function guardarCarrito() {
  localStorage.setItem("carritoProductos", JSON.stringify(carritoProductos));
  actualizarTotalesCarrito();
}

actualizarTotalesCarrito();



/* =========================
   NOVEDADES
========================= */

let productosNovedadesData = [];

async function cargarNovedades() {
  const contenedor = document.getElementById("productosNovedades");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/productos`);
    const productos = await res.json();

    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() - 4);

    productosNovedadesData = productos.filter(producto => {
      const fechaProducto = new Date(producto.created_at);
      return fechaProducto >= limite;
    });

    pintarNovedades(productosNovedadesData);
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = "<p>No se pudieron cargar las novedades.</p>";
  }
}

function pintarNovedades(productos) {
  const contenedor = document.getElementById("productosNovedades");
  const contador = document.getElementById("contadorNovedades");

  if (!contenedor) return;

  if (contador) {
    contador.textContent = `Mostrando ${productos.length} novedades`;
  }

  contenedor.innerHTML = productos.map(producto => `
    <a href="producto.html?id=${producto.id}" class="catalogo-card">

      <div class="catalogo-img">
        <img src="${API_URL}/${producto.imagen}" alt="${producto.nombre}">
      </div>

      <div class="catalogo-card-info">
        <h3>${producto.nombre}</h3>
        <strong>${formatearPrecio(producto.precio)}</strong>
        <div class="catalogo-stars">Nuevo</div>
      </div>

      <button 
        type="button"
        class="catalogo-cart btn-carrito-listado" 
        data-id="${producto.id}"
      >
        <i class="bi bi-cart"></i>
      </button>

    </a>
  `).join("");
}
document.getElementById("ordenNovedades")?.addEventListener("change", e => {
  let productos = [...productosNovedadesData];

  if (e.target.value === "mayor") {
    productos.sort((a, b) => Number(b.precio) - Number(a.precio));
  }

  if (e.target.value === "menor") {
    productos.sort((a, b) => Number(a.precio) - Number(b.precio));
  }

  if (e.target.value === "nombre") {
    productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  pintarNovedades(productos);
});

document.getElementById("buscarNovedades")?.addEventListener("input", e => {
  const texto = e.target.value.toLowerCase();

  const productos = productosNovedadesData.filter(producto =>
    producto.nombre.toLowerCase().includes(texto) ||
    producto.descripcion?.toLowerCase().includes(texto)
  );

  pintarNovedades(productos);
});

cargarNovedades();


/* =========================
   CHECKOUT / PEDIDOS
========================= */

const modalCheckout = document.getElementById("modalCheckout");
const cerrarCheckout = document.getElementById("cerrarCheckout");
const formCheckout = document.getElementById("formCheckout");

const checkoutNombre = document.getElementById("checkoutNombre");
const checkoutWhatsapp = document.getElementById("checkoutWhatsapp");
const checkoutCorreo = document.getElementById("checkoutCorreo");
const checkoutDireccion = document.getElementById("checkoutDireccion");
const checkoutCiudad = document.getElementById("checkoutCiudad");
const checkoutMetodoPago = document.getElementById("checkoutMetodoPago");
const checkoutNotas = document.getElementById("checkoutNotas");
const checkoutComprobante = document.getElementById("checkoutComprobante");
const infoMetodoPago = document.getElementById("infoMetodoPago");

document.addEventListener("click", e => {
  const btnCheckout = e.target.closest(".btn-finalizar-compra");

  if (btnCheckout && modalCheckout) {
    modalCheckout.classList.add("activo");
  }
});

cerrarCheckout?.addEventListener("click", () => {
  modalCheckout?.classList.remove("activo");
});

async function eliminarPedido(id) {
  const confirmar = await Swal.fire({
    title: "¿Eliminar pedido?",
    text: `Esta acción eliminará el pedido #${id}. No se puede deshacer.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e0be32",
    cancelButtonColor: "#333"
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/pedidos/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      throw new Error("Error al eliminar pedido");
    }

    await cargarPedidosAdmin();

    Swal.fire({
      title: "Pedido eliminado",
      text: "El pedido fue eliminado correctamente.",
      icon: "success",
      confirmButtonColor: "#e0be32"
    });

  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: "No se pudo eliminar el pedido.",
      icon: "error",
      confirmButtonColor: "#e0be32"
    });
  }
}

/* =========================
   MÉTODO DE PAGO
========================= */

document.querySelectorAll(".metodo-pago-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const metodo = btn.dataset.metodoPago;

    document.querySelectorAll(".metodo-pago-btn").forEach(b => {
      b.classList.remove("activo");
    });

    btn.classList.add("activo");

    if (checkoutMetodoPago) {
      checkoutMetodoPago.value = metodo;
    }

    if (infoMetodoPago) {
      if (metodo === "Nequi") {
        infoMetodoPago.innerHTML = `
          <strong>Pago por Nequi</strong><br>
          Número: 322 334 9682<br>
          Titular: Christian Alejandro Rivera Ortiz<br>
          Luego de pagar, sube el comprobante.
        `;
      }

      if (metodo === "Bancolombia") {
        infoMetodoPago.innerHTML = `
          <strong>Pago por Bancolombia</strong><br>
          Cuenta de ahorros: 59726688871<br>
          Titular: Christian Alejandro Rivera Ortiz<br>
          Luego de pagar, sube el comprobante.
        `;
      }
    }
  });
});

/* =========================
   ENVIAR PEDIDO
========================= */

formCheckout?.addEventListener("submit", async e => {
  e.preventDefault();

  if (carritoProductos.length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  if (
    !checkoutNombre ||
    !checkoutWhatsapp ||
    !checkoutDireccion ||
    !checkoutCiudad ||
    !checkoutMetodoPago
  ) {
    alert("Faltan campos del formulario de checkout en el HTML.");
    console.error("Faltan elementos del checkout:", {
      checkoutNombre,
      checkoutWhatsapp,
      checkoutDireccion,
      checkoutCiudad,
      checkoutMetodoPago
    });
    return;
  }

  const nombre = checkoutNombre.value.trim();
  const whatsapp = checkoutWhatsapp.value.trim();
  const correo = checkoutCorreo ? checkoutCorreo.value.trim() : "";
  const direccion = checkoutDireccion.value.trim();
  const ciudad = checkoutCiudad.value.trim();
  const metodoPago = checkoutMetodoPago.value;
  const notas = checkoutNotas ? checkoutNotas.value.trim() : "";

  if (!nombre) {
    alert("Escribe tu nombre completo");
    return;
  }

  if (!whatsapp) {
    alert("Escribe tu WhatsApp");
    return;
  }

  if (!direccion) {
    alert("Escribe tu dirección");
    return;
  }

  if (!ciudad) {
    alert("Escribe tu ciudad");
    return;
  }

  if (!metodoPago) {
    alert("Selecciona un método de pago");
    return;
  }

  const totalPedido = carritoProductos.reduce((total, producto) => {
    return total + Number(producto.precio) * Number(producto.cantidad);
  }, 0);

  const formData = new FormData();

  formData.append("nombre", nombre);
  formData.append("whatsapp", whatsapp);
  formData.append("correo", correo);
  formData.append("direccion", direccion);
  formData.append("ciudad", ciudad);
  formData.append("metodo_pago", metodoPago);
  formData.append("notas", notas);
  formData.append("productos", JSON.stringify(carritoProductos));
  formData.append("total", totalPedido);
  formData.append("moneda", "USD");

  const comprobante = checkoutComprobante?.files?.[0];

  if (comprobante) {
    formData.append("comprobante", comprobante);
  }

  try {
    const res = await fetch(`${API_URL}/pedidos`, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("ERROR PEDIDO:", errorData);
      throw new Error("Error al crear pedido");
    }

    /* =========================
   MENSAJE WHATSAPP
========================= */

    const productosTexto = carritoProductos.map(producto => {
      return `• ${producto.nombre}
        Cantidad: ${producto.cantidad}
        Precio: $${producto.precio}`;
    }).join("\n\n");

    const mensaje = `
🛒 NUEVO PEDIDO

👤 Cliente: ${nombre}
📱 WhatsApp: ${whatsapp}
📧 Correo: ${correo || "No proporcionado"}

📍 Dirección: ${direccion}
🏙️ Ciudad: ${ciudad}

💳 Método de pago: ${metodoPago}

🛍️ Productos:
${productosTexto}

💰 Total: $${totalPedido} ${"COP"}

📝 Notas:
${notas || "Sin notas"}
`;

    const numeroNegocio = "573223349682";

    const urlWhatsapp = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;

    window.open(urlWhatsapp, "_blank");

    alert("Pedido enviado correctamente");

    carritoProductos = [];
    sincronizarCarrito();

    formCheckout.reset();

    document.querySelectorAll(".metodo-pago-btn").forEach(b => {
      b.classList.remove("activo");
    });

    if (infoMetodoPago) {
      infoMetodoPago.innerHTML = "Selecciona un método de pago para ver la información.";
    }

    modalCheckout?.classList.remove("activo");
    document.getElementById("modalCarrito")?.classList.remove("activo");

  } catch (error) {
    console.error(error);
    alert("No se pudo enviar el pedido");
  }
});

/* =========================
   ADMIN: PEDIDOS
========================= */

async function cargarPedidosAdmin() {
  const contenedor = document.getElementById("contenedorPedidos");

  if (!contenedor) return;

  try {
    const res = await fetch(`${API_URL}/pedidos`);
    const pedidos = await res.json();
    const pendientes = pedidos.filter(pedido => pedido.estado === "pendiente").length;

    const contadorPendientes = document.getElementById("contadorPedidosPendientes");

    if (contadorPendientes) {
      contadorPendientes.textContent = pendientes;
    }

    contenedor.innerHTML = `
      <table class="admin-products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>WhatsApp</th>
            <th>Método</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Comprobante</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          ${pedidos.map(pedido => `
            <tr>
              <td>#${pedido.id}</td>

              <td>
                <div class="admin-product-info">
                  <div>
                    <h4>${pedido.nombre}</h4>
                    <span>${pedido.correo || "Sin correo"}</span>
                  </div>
                </div>
              </td>

              <td>${pedido.whatsapp}</td>

              <td>${pedido.metodo_pago}</td>

              <td>$${Number(pedido.total).toLocaleString()} ${pedido.moneda}</td>

              <td>
                <span 
                  class="estado-pedido ${pedido.estado === "Entregado" ? "entregado" : "clickeable"}"
                  ${pedido.estado === "Entregado" ? "" : `onclick="cambiarEstadoPedido(${pedido.id}, '${pedido.estado || "Activo"}')"`} 
                >
                  ${pedido.estado || "Activo"}
                </span>
              </td>

              <td>
                ${pedido.comprobante ? `
                  <a 
                    href="${API_URL}/${pedido.comprobante}" 
                    target="_blank" 
                    class="link-comprobante"
                  >
                    Ver comprobante
                  </a>
                ` : "Sin comprobante"}
              </td>

              <td>
                <span 
                  class="estado-pedido ${normalizarEstadoPedido(pedido.estado) === "Entregado" ? "entregado" : "clickeable"}"
                  ${normalizarEstadoPedido(pedido.estado) === "Entregado"
        ? ""
        : `onclick="cambiarEstadoPedido(${pedido.id}, '${normalizarEstadoPedido(pedido.estado)}')"`} 
                >
                  ${normalizarEstadoPedido(pedido.estado)}
                </span>
              </td>
              <td>
                <div class="admin-actions">
                  <button onclick="verificarPedido(${pedido.id}, '${pedido.whatsapp}', '${pedido.nombre}')">
                    <i class="bi bi-check-lg"></i>
                  </button>

                  <button onclick='verDetallePedido(${JSON.stringify(pedido.productos)})'>
                    <i class="bi bi-eye"></i>
                  </button>

                  <button 
                    class="btn-eliminar-admin"
                    onclick="eliminarPedido(${pedido.id})">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  } catch (error) {
    console.error(error);
  }
}

function normalizarEstadoPedido(estado) {
  if (!estado || estado === "pendiente") return "Activo";
  if (estado === "verificado") return "Revisado";
  return estado;
}

function obtenerSiguienteEstado(estadoActual) {
  const estados = ["Activo", "Revisado", "En camino", "Entregado"];

  const estadoNormalizado = normalizarEstadoPedido(estadoActual);
  const indexActual = estados.indexOf(estadoNormalizado);

  if (indexActual === -1) return "Activo";
  if (indexActual >= estados.length - 1) return null;

  return estados[indexActual + 1];
}

async function cambiarEstadoPedido(id, estadoActual) {
  const estadoNormalizado = normalizarEstadoPedido(estadoActual);
  const siguienteEstado = obtenerSiguienteEstado(estadoNormalizado);

  if (!siguienteEstado) return;

  const confirmar = await Swal.fire({
    title: "¿Cambiar estado?",
    text: `El pedido pasará de "${estadoNormalizado}" a "${siguienteEstado}".`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, cambiar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#e0be32",
    cancelButtonColor: "#333"
  });

  if (!confirmar.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/pedidos/${id}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        estado: siguienteEstado
      })
    });

    if (!res.ok) {
      throw new Error("Error al actualizar estado");
    }

    await cargarPedidosAdmin();

    Swal.fire({
      title: "Estado actualizado",
      text: `El pedido ahora está en "${siguienteEstado}".`,
      icon: "success",
      confirmButtonColor: "#e0be32"
    });

  } catch (error) {
    console.error(error);

    Swal.fire({
      title: "Error",
      text: "No se pudo actualizar el estado del pedido.",
      icon: "error",
      confirmButtonColor: "#e0be32"
    });
  }
}

function verDetallePedido(productosJSON) {
  const productos = typeof productosJSON === "string"
    ? JSON.parse(productosJSON)
    : productosJSON;

  const detalle = productos.map(producto => {
    return `${producto.nombre} | Cantidad: ${producto.cantidad} | Talla: ${producto.talla || "N/A"} | Color: ${producto.color || "N/A"}`;
  }).join("\n");

  alert(detalle);
}

cargarPedidosAdmin();

document.addEventListener("click", e => {
  const btn = e.target.closest("#btnMenuMobile");

  if (!btn) return;

  const navbar = document.getElementById("navbarMobile");

  if (navbar) {
    navbar.classList.toggle("activo");
  }
});

/*METODO DE PAGO */

document.querySelectorAll("[data-metodo-pago]").forEach(btn => {
  btn.addEventListener("click", () => {
    const metodo = btn.dataset.metodoPago;
    const inputMetodo = document.getElementById("checkoutMetodoPago");
    const info = document.getElementById("infoMetodoPago");

    document.querySelectorAll("[data-metodo-pago]").forEach(b => {
      b.classList.remove("activo");
    });

    btn.classList.add("activo");
    inputMetodo.value = metodo;

    if (metodo === "Nequi") {
      info.innerHTML = `
        <strong>Pago por Nequi</strong><br>
        Número: 322 334 9682<br>
        Titular: Christian Alejandro Rivera Ortiz<br>
        Después de pagar, sube el comprobante.
      `;
    }

    if (metodo === "Bancolombia") {
      info.innerHTML = `
        <strong>Pago por Bancolombia</strong><br>
        Cuenta de ahorros: 59726688871<br>
        Titular: Christian Alejandro Rivera Ortiz<br>
        Después de pagar, sube el comprobante.
      `;
    }

    if (metodo === "Contra entrega") {
      info.innerHTML = `
        <strong>Pago contra entrega</strong><br>
        Pagas al recibir tu pedido.<br>
        No necesitas subir comprobante.
      `;
    }
  });
});

function sincronizarImagenesDesdePreview() {
  imagenesActualesPreview = imagenesPreviewProducto
    .filter(imagen => imagen.tipo === "actual")
    .map(imagen => imagen.valor);

  imagenesSeleccionadas = imagenesPreviewProducto
    .filter(imagen => imagen.tipo === "nueva")
    .map(imagen => imagen.valor);

  imagenActualProducto = imagenesPreviewProducto[0]
    ? imagenesPreviewProducto[0].valor
    : "";

  imagenesActualesProducto = JSON.stringify(imagenesActualesPreview);
}

function eliminarImagenPreviewProducto(index) {
  imagenesPreviewProducto.splice(index, 1);

  sincronizarImagenesDesdePreview();
  mostrarPreviewImagenes();
}

/* =========================
   REGISTRAR VISITA PÚBLICA
========================= */

async function registrarVisitaPagina() {
  const esAdmin = window.location.pathname.includes("admin.html");
  const esLogin = window.location.pathname.includes("login.html");

  if (esAdmin || esLogin) return;

  try {
    await fetch(`${API_URL}/visitas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ruta: window.location.pathname
      })
    });

  } catch (error) {
    console.error("Error registrando visita:", error);
  }
}

registrarVisitaPagina();

/* =========================
   ADMIN: DASHBOARD
========================= */

const metricVentasTotales = document.getElementById("metricVentasTotales");
const metricVentasInfo = document.getElementById("metricVentasInfo");
const metricPedidos = document.getElementById("metricPedidos");
const metricVisitas = document.getElementById("metricVisitas");
const metricProductos = document.getElementById("metricProductos");

const graficoBarrasDashboard = document.getElementById("graficoBarrasDashboard");
const graficoPastelDashboard = document.getElementById("graficoPastelDashboard");
const botonesPeriodoDashboard = document.querySelectorAll("[data-periodo-dashboard]");

let instanciaGraficoBarrasDashboard = null;
let instanciaGraficoPastelDashboard = null;

function formatearCOPDashboard(valor) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(Number(valor || 0));
}

function nombrePlanGrafica(plan) {
  if (plan === "diario") return "Plan diario";
  if (plan === "semanal") return "Plan semanal";
  if (plan === "mensual") return "Plan mensual";
  return plan || "Sin plan";
}

async function cargarDashboardMetricas() {
  if (!metricVentasTotales && !metricPedidos && !metricVisitas && !metricProductos) return;

  try {
    const res = await fetch(`${API_URL}/dashboard-metricas`);
    const data = await res.json();

    if (!res.ok) {
      console.error("Error dashboard métricas:", data);
      return;
    }

    if (metricVentasTotales) {
      metricVentasTotales.textContent = formatearCOPDashboard(data.ventas_totales);
    }

    if (metricPedidos) {
      metricPedidos.textContent = data.pedidos;
    }

    if (metricVisitas) {
      metricVisitas.textContent = data.visitas;
    }

    if (metricProductos) {
      metricProductos.textContent = data.productos;
    }

    if (metricVentasInfo) {
      metricVentasInfo.textContent = data.columna_total_usada
        ? `Calculado desde pedidos.${data.columna_total_usada}`
        : "Sin columna total en pedidos";
    }

  } catch (error) {
    console.error("Error al cargar métricas:", error);
  }
}

async function cargarGraficasDashboard(periodo = "dia") {
  if (!graficoBarrasDashboard || !graficoPastelDashboard) return;

  if (typeof Chart === "undefined") {
    console.error("Chart.js no está cargado");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/dashboard-graficas?periodo=${periodo}`);
    const data = await res.json();

    if (!res.ok) {
      console.error("Error dashboard gráficas:", data);
      return;
    }

    if (instanciaGraficoBarrasDashboard) {
      instanciaGraficoBarrasDashboard.destroy();
    }

    if (instanciaGraficoPastelDashboard) {
      instanciaGraficoPastelDashboard.destroy();
    }

    instanciaGraficoBarrasDashboard = new Chart(graficoBarrasDashboard, {
      type: "bar",
      data: {
        labels: data.barras.labels,
        datasets: [
          {
            label: "Visitas",
            data: data.barras.valores,
            backgroundColor: "rgba(255, 90, 0, 0.75)",
            borderColor: "rgba(255, 90, 0, 1)",
            borderWidth: 1,
            borderRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    instanciaGraficoPastelDashboard = new Chart(graficoPastelDashboard, {
      type: "doughnut",
      data: {
        labels: data.pastel.labels.map(nombrePlanGrafica),
        datasets: [
          {
            data: data.pastel.valores,
            backgroundColor: [
              "rgba(255, 90, 0, 0.88)",
              "rgba(255, 145, 0, 0.88)",
              "rgba(40, 40, 40, 0.88)",
              "rgba(120, 120, 120, 0.88)"
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });

  } catch (error) {
    console.error("Error al cargar gráficas dashboard:", error);
  }
}

botonesPeriodoDashboard.forEach(boton => {
  boton.addEventListener("click", () => {
    botonesPeriodoDashboard.forEach(btn => btn.classList.remove("active"));
    boton.classList.add("active");

    cargarGraficasDashboard(boton.dataset.periodoDashboard);
  });
});

cargarDashboardMetricas();
cargarGraficasDashboard("dia");

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();

    const target = document.querySelector(a.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});


async function vender(id) {

  const res = await fetch(`${API_URL}productos/vender`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, cantidad: 1 })
  });

  const data = await res.json();

  if (!res.ok) {
    Swal.fire("Error", data.message, "error");
    return;
  }

  Swal.fire("OK", "Venta realizada", "success");

  cargarProductosAdmin(); // 🔥 refresca tabla desde MySQL
}

let swiperServicios = null;

document.addEventListener("DOMContentLoaded", () => {

  const slides = document.querySelectorAll(".serviciosSwiper .swiper-slide");

  // 🔥 duplicar slides si hay pocos (EVITA ERROR LOOP)
  const wrapper = document.querySelector(".serviciosSwiper .swiper-wrapper");

  if (slides.length < 6 && wrapper) {
    const original = Array.from(slides);
    original.forEach(s => {
      wrapper.appendChild(s.cloneNode(true));
    });
  }

  if (swiperServicios) swiperServicios.destroy(true, true);

  swiperServicios = new Swiper(".serviciosSwiper", {

    slidesPerView: 1.2,
    spaceBetween: 12,

    loop: true,

    speed: 10000,

    autoplay: {
      delay: 0,
      disableOnInteraction: false
    },

    freeMode: {
      enabled: true,
      momentum: false
    },

    loopAdditionalSlides: 10,

    breakpoints: {
      768: {
        slidesPerView: 2.5,
        spaceBetween: 16
      },
      1024: {
        slidesPerView: 3.5
      }
    }
  });

});

let selectedTable = null;

/* =========================
   ABRIR MODAL CLIENTE
========================= */
function openReservation(){
  document.getElementById("reservationModal").style.display = "flex";
  loadTables();
}

/* =========================
   CARGAR MESAS CLIENTE
========================= */
async function loadTables(){
  const res = await fetch(`${API_URL}/mesas`);
  const data = await res.json();

  const grid = document.getElementById("tableGrid");
  grid.innerHTML = "";

  data.forEach(m => {

    const div = document.createElement("div");
    div.classList.add("table-item");

    if(m.estado === "disponible"){
      div.classList.add("table-available");
    } else {
      div.classList.add("table-occupied");
    }

    div.textContent = m.numero_mesa;

    if(m.estado === "disponible"){
      div.onclick = () => selectTable(div, m.id);
    }

    grid.appendChild(div);
  });
}

/* =========================
   SELECCIONAR MESA
========================= */
function selectTable(el, id){

  document.querySelectorAll(".table-item")
    .forEach(e => e.classList.remove("table-selected"));

  el.classList.add("table-selected");
  selectedTable = id;
}

/* =========================
   CREAR RESERVA
========================= */
async function createReservation(){

  const name = document.getElementById("inputName").value;
  const cedula = document.getElementById("inputId").value;

  if(!name || !cedula || !selectedTable){
    alert("Completa todos los campos y selecciona mesa");
    return;
  }

  await fetch(`${API_URL}/reservas`,{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      nombre: name,
      cedula: cedula,
      mesa_id: selectedTable
    })
  });

  alert("Reserva realizada correctamente");

  selectedTable = null;
  loadTables();
}

/* =========================
   ADMIN - CARGAR TABLA
========================= */
async function loadAdmin(){
  const res = await fetch(`${API_URL}/mesas`);
  const data = await res.json();

  const t = document.getElementById("tabla");
  t.innerHTML = "";

  data.forEach(m => {
    t.innerHTML += `
      <tr>
        <td>${m.numero_mesa}</td>
        <td>${m.nombre_ocupante || ""}</td>
        <td>${m.cedula_ocupante || ""}</td>
        <td class="estado-${m.estado}">
          ${m.estado}
        </td>
        <td>
          <label class="switch">
            <input type="checkbox" ${m.estado === "ocupado" ? "checked" : ""} 
              onchange="toggleTable(${m.id}, this.checked)">
            <span class="slider"></span>
          </label>
        </td>
      </tr>
      `;
  });
}

/* =========================
   ADMIN - TOGGLE ESTADO
========================= */
async function toggleTable(id, estado){

  await fetch(`${API_URL}/mesas/${id}`,{
    method:"PUT",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({
      estado: estado === "ocupado" ? "disponible" : "ocupado"
    })
  });

  loadAdmin();
}

/* =========================
   INICIAL ADMIN
========================= */
loadAdmin();

function closeReservation(){
  document.getElementById("reservationModal").style.display = "none";
  selectedTable = null;
}

async function toggleTable(id, checked){

  const estado = checked ? "ocupado" : "disponible";

  await fetch(`${API_URL}/mesas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado })
  });

  loadAdmin();
}

// llenar select con las categorías disponibles
async function cargarCategoriasMovil() {
  const select = document.getElementById("selectCategoria");
  if (!select) return;

  try {
    const res = await fetch(`${API_URL}/categorias`);
    const categorias = await res.json();

    categorias.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.nombre;
      select.appendChild(opt);
    });

    // Evento cambio de categoría
    select.addEventListener("change", () => {
      const categoriaId = select.value;
      filtrarProductosPorCategoria(categoriaId);
    });

  } catch (error) {
    console.error("Error cargando categorías:", error);
  }
}

// filtrar productos según categoría
function filtrarProductosPorCategoria(categoriaId) {
  const contenedor = document.getElementById("productosCatalogo");
  if (!contenedor) return;

  let productosFiltrados = productosCatalogoData;

  if (categoriaId !== "todas") {
    productosFiltrados = productosFiltrados.filter(
      p => p.categoria_id == categoriaId
    );
  }

  pintarCatalogo(productosFiltrados);
}

// llamar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  cargarCategoriasMovil();
});