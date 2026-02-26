/** Relación entre producto y tag
 * @property {number} product_id - ID del producto
 * @property {number} tag_id - ID del tag
 * @property {boolean} is_deleted - Indica si la relación ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 * @Info('La combinación de product_id y tag_id debe ser única, formando una **llave compuesta**')
 */
interface ProductTag {
  product_id: number;
  tag_id: number;
  is_deleted: boolean;
}

/** Relación entre producto y categoría
 * @property {number} product_id - ID del producto
 * @property {number} category_id - ID de la categoría
 * @property {boolean} is_deleted - Indica si la relación ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 * @Info('La combinación de product_id y Clasp_id debe ser única, formando una **llave compuesta**')
 */
interface ProductCategory {
  product_id: number;
  category_id: number;
  is_deleted: boolean;
}

/* =========================================
   PAYMENT ITEM CARRITO
========================================= */

export interface PaymentItemCarrito {
  id: string; // uuid
  shopping_cart_id_FK: string; // FK -> carrito.id
  product_variant_id: string; // FK -> product_variant.id
  amount: number; // cantidad del producto
}