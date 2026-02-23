/* =========================================
   PAYMENT ENUMS
========================================= */

export type PaymentOrderStatus =
  | "pending" // pendiente
  | "paid"    // pagado
  | "processing"  //en proceso
  | "shipped"  // enviado
  | "delivered"  //entregado
  | "cancelled" //cancelado
  | "refunded"; //reembolsado

export type PaymentProviderType =
  | "stripe"
  | "paypal"
  | "mercadopago"
  | "wompi";



/* =========================================
   PAYMENT METODO DE PAGO
========================================= */

export interface PaymentMetodoPago {
  id: string; // uuid
  user_id: string; // FK -> users.id
  type_id: string; // FK -> proveedores_disponibles.id
  last_4_digits: string; // últimos 4 dígitos tarjeta
  expires_card: string; // formato MM/YY o ISO date
}



/* =========================================
   PAYMENT PROVEEDORES DISPONIBLES
========================================= */

export interface PaymentProveedoresDisponibles {
  id: string; // uuid
  name: PaymentProviderType; // nombre proveedor
}



/* =========================================
   PAYMENT PEDIDO
========================================= */

export interface PaymentPedido {
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

export interface PaymentCarrito {
  id: string; // uuid
  user_id: string; // FK -> users.id
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



/* =========================================
   PAYMENT SEGUIMIENTO ACTUAL
========================================= */

export interface PaymentSeguimientoActual {
  id_order_PK: string; // PK y FK -> pedido.id
  enum_status_pk: PaymentOrderStatus; // estado actual
  updated_at: string; // ISO timestamp
}