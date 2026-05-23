/** Enum Genero
 * @Info('Guardar letras en DB, retornar texto completo al usuario')
 */
export enum genre {
  male = "M",
  female = "F",
  unisex = "U",
}

export enum cart_status {
  pending = "pending",
  processing = "processing",
  shipped = "shipped",
  delivered = "delivered",
  cancelled= "cancelled",
}

/** Enum Tipo de movimiento
 * @Info('Guardar letras en DB, retornar texto completo al usuario')
 */
export enum movement_type {
  quartz = "Q",
  automatic = "A",
  manual = "M",
  solar = "S",
  kinetic = "K",
}

export enum Role {
  Buyer = "Buyer",
  Seller = "Seller",
  Admin = "Admin",
}

export enum BucketRoutes {
  UserImages = "user_images",
  BrandImages = "brand_images",
  ProductImages = "product_images",
}
