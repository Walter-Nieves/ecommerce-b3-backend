import { genre, movement_type, Role } from "./enums";
import {
  PaymentOrderStatus,
  rating,
  stock_state,
  waterproofness,
} from "./primitives";

/** Entidad producto
 * @IMPORTANTE El precio se debe manejar en centavos para evitar problemas de precisión con decimales, por lo que el precio base y el precio de la variante se deben almacenar como enteros representando los centavos (por ejemplo, un precio de $199.99 se almacenaría como 19999)
 * @property {string} id - ID del producto
 * @property {string} name - Nombre del producto mostrable para el usuario
 * @property {string} slug - Slug del producto para uso interno, marcar como único para evitar duplicados
 * @property {string} description - Descripción del producto
 * @property {number} base_price - Precio base del producto, sin aplicar descuentos ni impuestos (se muestra al usuario como referencia, el precio final puede variar según promociones, impuestos y descuentos aplicados)
 * @property {string} brand_id - ID de la marca del producto, referencia a la entidad Marca
 * @property {genre} genre - Género para el que está diseñado el producto
 * @property {movement_type} movement_type - Tipo de movimiento del producto
 * @property {number} waterproffness - Resistencia al agua del producto medida en metros
 * @property {string} case_material_id - ID del material de la caja del producto, referencia al tipo primitivo Material
 * @property {string} crystal_material_id - ID del material del cristal del producto, referencia al tipo primitivo Material
 * @property {stock_state} stock_state - Estado del stock del producto
 * @property {boolean} is_deleted - Indica si el producto ha sido eliminado lógicamente sin eliminarlo físicamente de la base de datos
 * @property {Date} created_at - Fecha de creación del producto
 * @property {Date} updated_at - Fecha de última actualización del producto
 * @property {Date | null} deleted_at - Fecha de eliminación del producto, null si no ha sido eliminado
 */
interface Product {
  id: string; // tipo uuid
  name: string;
  slug: string; // unico
  description: string;
  base_price: number; // numeros enteros no decimales
  brand_id: string; // llave foranea tipo uuid a brand
  genre: genre;
  movement_type: movement_type;
  waterproofness: waterproofness;
  case_material_id: string; // llave foranea tipo uuid a material
  crystal_material_id: string; // llave foranea tipo uuid a material
  stock_state: stock_state;
  is_deleted: boolean; // por defecto false
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

/** Entidad variante de producto
 * @IMPORTANTE El precio se debe manejar en centavos para evitar problemas de precisión con decimales, por lo que el precio base y el precio de la variante se deben almacenar como enteros representando los centavos (por ejemplo, un precio de $199.99 se almacenaría como 19999)
 * @property {string} id - ID de la variante del producto uuid
 * @property {number} product_id - ID del producto al que pertenece la variante, referencia a la entidad Producto
 * @property {string} sku - SKU de la variante para uso interno, marcar como único para evitar duplicados
 * @Info('El sku debe tener un formato especifico en el siguiente orden [brand_sku]-[genre_sku]-[movement_sku]-[material_case_sku]-[color_sku], ejemplo: RLX-M-Q-TI-BLK significa RoLeX Male Quartz TItanium BLacK ')
 * @property {string} color_id - ID del color de la variante, referencia al tipo primitivo Color
 * @property {number} strap_material_id - ID del material de la correa de la variante, referencia al tipo primitivo Material
 * @property {number} clasp_id - ID del cierre de la variante, referencia al tipo primitivo Clasp
 * @property {number} price - Precio específico de la variante, puede ser diferente al precio base del producto, se muestra al usuario como el precio final de la variante
 * @property {number | null} discount_price - Precio de descuento específico de la variante, si aplica, se muestra al usuario como el precio final de la variante con descuento aplicado
 * @Info('IMPORTANTE: el descuento es el valor final, el backend no va a hacer operaciones con flotantes para evitar errores')
 * @property {boolean} is_deleted - Indica si la variante ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 * @property {Date} created_at - Fecha de creación de la variante
 * @property {Date} updated_at - Fecha de última actualización de la variante
 * @property {Date | null} deleted_at - Fecha de eliminación de la variante, null si no ha sido eliminada
 */
interface ProductVariant {
  id: string; // uuid
  product_id: number;
  sku: string;
  color_id: string;
  strap_material_id: number;
  clasp_id: number;
  price: number;
  discount_price?: number | null;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

/** Entidad inventario
 * @property {number} variant_id - ID de la variante del producto, marcar como único para evitar duplicados, referencia a la entidad ProductVariant
 * @property {number} quantity - Cantidad total del inventario, visible para el usuario, se actualiza al ser pedido
 * @property {number} real_quantity - Cantidad real disponible en el inventario, no visible para el usuario, se actualiza al salir del almacen y al recibir nuevos productos
 */
interface Inventory {
  variant_id: number;
  quantity: number;
  real_quantity: number;
}

/** Entidad review
 * @property {string} product_id - ID del producto al que pertenece la review, referencia a la entidad Producto
 * @property {string} user_id - ID del usuario que hizo la review, referencia a la entidad Usuario
 * @property {rating} rating - Calificación del producto, valor entre 1 y 5
 * @property {string} comment - Comentario de la review
 * @property {Date} created_at - Fecha de creación de la review
 * @Info('La combinación de product_id y user_id debe ser única, formando una **llave compuesta**')
 */
interface Review {
  product_id: string; // uuid
  user_id: string; // uuid
  rating: rating;
  comment: string;
  created_at: Date;
}

// Arrivoto, usado para saber que reseñas fueron utiles
interface Upvote {
  review_product_id: string; // uuid
  review_user_id: string; // uuid
  user_id: string; // uuid
}

/** Entidad ProductImage
 * @property {string} id - ID de la imagen del producto
 * @property {number} product_id - ID del producto al que pertenece la imagen, referencia a la entidad Producto
 * @property {string} image_url - URL de la imagen del producto, marcar como único para evitar duplicados
 * @property {boolean} is_primary - Indica si la imagen es la imagen principal del producto
 * @property {number} sort_order - Orden de clasificación de la imagen para mostrarla en la galería del producto
 * @property {boolean} is_deleted - Indica si la imagen ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 */
interface ProductImage {
  id: string; // uuid
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  is_deleted: boolean;
}

/** Entidad ProductVariantImage
 * @property {string} id - ID de la imagen de la variante del producto
 * @property {number} product_id - ID del producto al que pertenece la imagen, referencia a la entidad Producto
 * @property {string} image_url - URL de la imagen del producto, marcar como único para evitar duplicados
 * @property {boolean} is_primary - Indica si la imagen es la imagen principal del producto
 * @property {number} sort_order - Orden de clasificación de la imagen para mostrarla en la galería del producto
 * @property {boolean} is_deleted - Indica si la imagen ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 */
interface ProductVariantImage {
  id: string; // uuid
  product_variant_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  is_deleted: boolean;
}

/* =========================================
  PAYMENT METODO DE PAGO
========================================= */
interface PaymentMetodoPago {
  id: string; // uuid
  user_id: string; // FK -> users.id
  type_id: string; // FK -> proveedores.id
  last_4_digits: string; // últimos 4 dígitos tarjeta
  expires_card: string; // formato MM/YY o ISO date
}

/* =========================================
   PAYMENT PEDIDO
========================================= */

interface PaymentPedido {
  id: string; // uuid
  user_id_FK: string; // FK -> users.id
  enum_status: PaymentOrderStatus; // estado actual del pedido
  total_amount: number; // valor total
  created_at: string; // ISO timestamp
  finish_at: string | null; // puede ser null si no ha finalizado
}
/* =========================================
   PAYMENT CARRITO
========================================= */
interface PaymentCarrito {
  id: string; // uuid
  user_id: string; // FK -> users.id
}

/* =========================================
   PAYMENT SEGUIMIENTO ACTUAL
========================================= */

interface PaymentSeguimientoActual {
  id_order_PK: string; // PK y FK -> pedido.id
  enum_status_pk: PaymentOrderStatus; // estado actual
  updated_at: string; // ISO timestamp
}

interface User {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  phone: string;
  photo_url?: string | null;
  role: Role;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
  is_deleted?: boolean;
}

interface Address {
  id?: string;
  user_id: string;
  country: string;
  state: string;
  city: string;
  postal_code: string;
  street_address: string;
  reference: string;
  is_default: boolean;
}

export type {
  Product,
  ProductVariant,
  Inventory,
  Review,
  ProductImage,
  ProductVariantImage,
  PaymentMetodoPago,
  PaymentPedido,
  PaymentCarrito,
  PaymentSeguimientoActual,
  User,
  Address,
  Upvote
};
