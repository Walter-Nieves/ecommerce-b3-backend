/** Entidad producto
 * @IMPORTANTE El precio se debe manejar en centavos para evitar problemas de precisión con decimales, por lo que el precio base y el precio de la variante se deben almacenar como enteros representando los centavos (por ejemplo, un precio de $199.99 se almacenaría como 19999)
 * @property {number} id - ID del producto
 * @property {string} name - Nombre del producto mostrable para el usuario
 * @property {string} slug - Slug del producto para uso interno, marcar como único para evitar duplicados
 * @property {string} description - Descripción del producto
 * @property {number} base_price - Precio base del producto, sin aplicar descuentos ni impuestos (se muestra al usuario como referencia, el precio final puede variar según promociones, impuestos y descuentos aplicados)
 * @property {number} brand_id - ID de la marca del producto, referencia a la entidad Marca
 * @property {genre} genre - Género para el que está diseñado el producto
 * @property {movement_type} movement_type - Tipo de movimiento del producto
 * @property {number} waterproffness - Resistencia al agua del producto medida en metros
 * @property {number} case_material_id - ID del material de la caja del producto, referencia al tipo primitivo Material
 * @property {number} crystal_material_id - ID del material del cristal del producto, referencia al tipo primitivo Material
 * @property {stock_state} stock_state - Estado del stock del producto
 * @property {boolean} is_deleted - Indica si el producto ha sido eliminado lógicamente sin eliminarlo físicamente de la base de datos
 * @property {Date} created_at - Fecha de creación del producto
 * @property {Date} updated_at - Fecha de última actualización del producto
 * @property {Date | null} deleted_at - Fecha de eliminación del producto, null si no ha sido eliminado
 */
interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  brand_id: number;
  genre: genre;
  movement_type: movement_type;
  waterproffness: number;
  case_material_id: number;
  crystal_material_id: number;
  stock_state: stock_state;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

/** Entidad variante de producto
 * @IMPORTANTE El precio se debe manejar en centavos para evitar problemas de precisión con decimales, por lo que el precio base y el precio de la variante se deben almacenar como enteros representando los centavos (por ejemplo, un precio de $199.99 se almacenaría como 19999)
 * @property {number} id - ID de la variante del producto
 * @property {number} product_id - ID del producto al que pertenece la variante, referencia a la entidad Producto
 * @property {string} sku - SKU de la variante para uso interno, marcar como único para evitar duplicados
 * @Info('El sku debe tener un formato especifico en el siguiente orden [brand_sku]-[genre_sku]-[movement_sku]-[material_case_sku]-[color_sku], ejemplo: RLX-M-Q-TI-BLK significa RoLeX Male Quartz TItanium BLacK ')
 * @property {string} color_id - ID del color de la variante, referencia al tipo primitivo Color
 * @property {number} strap_material_id - ID del material de la correa de la variante, referencia al tipo primitivo Material
 * @property {number} clasp_id - ID del cierre de la variante, referencia al tipo primitivo Clasp
 * @property {number} price - Precio específico de la variante, puede ser diferente al precio base del producto, se muestra al usuario como el precio final de la variante
 * @property {boolean} is_deleted - Indica si la variante ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 * @property {Date} created_at - Fecha de creación de la variante
 * @property {Date} updated_at - Fecha de última actualización de la variante
 * @property {Date | null} deleted_at - Fecha de eliminación de la variante, null si no ha sido eliminada
 */
interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  color_id: string;
  strap_material_id: number;
  clasp_id: number;
  price: number;
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
 * @property {number} product_id - ID del producto al que pertenece la review, referencia a la entidad Producto
 * @property {number} user_id - ID del usuario que hizo la review, referencia a la entidad Usuario
 * @property {rating} rating - Calificación del producto, valor entre 1 y 5
 * @property {string} comment - Comentario de la review
 * @property {Date} created_at - Fecha de creación de la review
 * @property {Date} updated_at - Fecha de última actualización de la review
 * @property {Date | null} deleted_at - Fecha de eliminación de la review, null si no ha sido eliminada
 * @property {boolean} is_deleted - Indica si la review ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 * @Info('La combinación de product_id y user_id debe ser única, formando una **llave compuesta**')
 */
interface Review {
  product_id: number;
  user_id: number;
  rating: rating;
  comment: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  is_deleted: boolean;
}

/** Entidad ProductImage
 * @property {number} id - ID de la imagen del producto
 * @property {number} product_id - ID del producto al que pertenece la imagen, referencia a la entidad Producto
 * @property {string} image_url - URL de la imagen del producto, marcar como único para evitar duplicados
 * @property {boolean} is_primary - Indica si la imagen es la imagen principal del producto
 * @property {number} sort_order - Orden de clasificación de la imagen para mostrarla en la galería del producto
 * @property {boolean} is_deleted - Indica si la imagen ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 */
interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  is_deleted: boolean;
}