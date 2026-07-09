-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-05-2026 a las 01:57:30
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tienda`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `imagen` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `imagen`) VALUES
(3, 'Ropa', 'uploads/categorias/1778112533409-categoria-2.png'),
(4, 'Calzado', 'uploads/categorias/1778112547897-categoria-3.png'),
(5, 'Bolsos', 'uploads/categorias/1778112578407-categoria.png'),
(6, 'Frutas', 'uploads/categorias/1778359895959-banner-4.png'),
(7, 'Frutas', 'uploads/categorias/1778369652558-presonal-shopper.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion`
--

CREATE TABLE `configuracion` (
  `id` int(11) NOT NULL,
  `clave` varchar(100) NOT NULL,
  `valor` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion`
--

INSERT INTO `configuracion` (`id`, `clave`, `valor`) VALUES
(1, 'tasa_cambio', '4000');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `flyers`
--

CREATE TABLE `flyers` (
  `id` int(11) NOT NULL,
  `imagen` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `flyers`
--

INSERT INTO `flyers` (`id`, `imagen`) VALUES
(1, 'uploads/flyers/1778071150293-banner-1.png'),
(5, 'uploads/flyers/1778166607879-banner-4.png'),
(6, 'uploads/flyers/1778257993870-banner-4.png'),
(7, 'uploads/flyers/1778369509762-banner-2.png'),
(8, 'uploads/flyers/1778369579406-banner-3.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `whatsapp` varchar(50) NOT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) NOT NULL,
  `ciudad` varchar(100) NOT NULL,
  `metodo_pago` varchar(50) NOT NULL,
  `comprobante` varchar(255) DEFAULT NULL,
  `productos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`productos`)),
  `total` decimal(12,2) NOT NULL,
  `moneda` varchar(10) DEFAULT 'COP',
  `estado` varchar(30) DEFAULT 'pendiente',
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `nombre`, `whatsapp`, `correo`, `direccion`, `ciudad`, `metodo_pago`, `comprobante`, `productos`, `total`, `moneda`, `estado`, `notas`, `created_at`) VALUES
(1, 'Ernesto Parra', '3233404121', 'ernesto@gmail.com', 'Tolima grande, Manzana C, Casa 15', 'IBAGUE', 'Nequi', 'uploads/comprobantes/1778362842706-banner-4.png', '[{\"id\":1778362217783,\"producto_id\":5,\"nombre\":\"Zapatos Deportivos\",\"imagen\":\"http://localhost:3000/uploads/productos/1778257539686-banner-4.png\",\"precio\":300,\"cantidad\":1,\"talla\":\"\",\"color\":\"\"}]', 300.00, 'USD', 'verificado', 'La imagen seria el comprobante de pago pero de todas formas esto solo es prueba', '2026-05-09 21:40:42'),
(2, 'Ernesto Parra', '3233404121', 'ernesto@gmail.com', 'Tolima grande, Manzana C, Casa 15', 'IBAGUE', 'Bancolombia', 'uploads/comprobantes/1778369214016-presonal-shopper.png', '[{\"id\":1778369141186,\"nombre\":\"Zapatos Deportivos\",\"imagen\":\"http://localhost:3000/uploads/productos/1778257539686-banner-4.png\",\"precio\":30000,\"cantidad\":1,\"talla\":\"\",\"color\":\"\"},{\"id\":1778369141955,\"nombre\":\"Zapatos Deportivos\",\"imagen\":\"http://localhost:3000/uploads/productos/1778257539686-banner-4.png\",\"precio\":30000,\"cantidad\":1,\"talla\":\"\",\"color\":\"\"},{\"id\":1778369145012,\"nombre\":\"Zapatos Deportivos\",\"imagen\":\"http://localhost:3000/uploads/productos/1778257539686-banner-4.png\",\"precio\":30000,\"cantidad\":3,\"talla\":\"\",\"color\":\"\"}]', 150000.00, 'USD', 'pendiente', 'hola', '2026-05-09 23:26:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `marca` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `tallas` text DEFAULT NULL,
  `imagenes` text DEFAULT NULL,
  `usa_tallas` tinyint(4) DEFAULT 1,
  `tipo_talla` varchar(50) DEFAULT NULL,
  `usa_colores` tinyint(4) DEFAULT 1,
  `colores` text DEFAULT NULL,
  `tipo_producto` varchar(30) DEFAULT 'normal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `video` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `precio`, `imagen`, `categoria_id`, `descripcion`, `marca`, `stock`, `sku`, `tallas`, `imagenes`, `usa_tallas`, `tipo_talla`, `usa_colores`, `colores`, `tipo_producto`, `created_at`, `video`) VALUES
(4, 'Zapatos Deportivos', 300.00, 'uploads/productos/1778174548020-categoria-3.png', 4, 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eaque consectetur exercitationem esse asperiores, harum sunt voluptates mollitia error distinctio voluptatum animi deserunt quas aperiam quibusdam saepe neque repudiandae veritatis cupiditate.', 'Adidas', 10, 'noc cual es', '[\"39\",\"38\",\"37\"]', '[\"uploads/productos/1778174548020-categoria-3.png\"]', 1, 'calzado-adulto', 1, '[\"Negro\",\"Azul\"]', 'normal', '2026-05-09 11:36:43', NULL),
(5, 'Zapatos Deportivos', 300.00, 'uploads/productos/1778257539686-banner-4.png', 4, 'kdsmvkemwrgwrg rwg rweg wreg wrg rg wre g g', 'Adidas', 10, 'noc cual es', '[]', '[\"uploads/productos/1778257539686-banner-4.png\",\"uploads/productos/1778257539727-presonal-shopper.png\",\"uploads/productos/1778257539755-preventa.png\",\"uploads/productos/1778257539786-categoria-3.png\",\"uploads/productos/1778257539804-categoria-2.png\",\"uploads/productos/1778257539820-Logo.png\"]', 1, 'personalizada', 1, '[\"Negro\",\"Azul\",\"Blanco\"]', 'normal', '2026-05-09 11:36:43', NULL),
(7, 'Zapatos Deportivos', 300.00, 'uploads/productos/1778523179855-ebanisteria.webp', 4, 'efwefwewefwef', 'Adidas', 8, '', '[]', '[\"uploads/productos/1778523179855-ebanisteria.webp\",\"uploads/productos/1778523179856-salon.webp\",\"uploads/productos/1778523179856-odontologia.webp\",\"uploads/productos/1778523179856-tatuando.webp\"]', 0, '', 0, '[]', 'normal', '2026-05-11 18:12:59', NULL),
(8, 'Zapatos Deportivos', 300.00, 'uploads/productos/1778523201623-tatuando.webp', 4, 'wefwefwe', 'Adidas', 8, '', '[]', '[\"uploads/productos/1778523201623-tatuando.webp\"]', 0, '', 0, '[]', 'normal', '2026-05-11 18:13:21', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`);

--
-- Indices de la tabla `flyers`
--
ALTER TABLE `flyers`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `configuracion`
--
ALTER TABLE `configuracion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `flyers`
--
ALTER TABLE `flyers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
