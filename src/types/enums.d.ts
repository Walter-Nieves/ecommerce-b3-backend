type rating = 1 | 2 | 3 | 4 | 5;

/** Enum Genero
 * @Info('Guardar letras en DB, retornar texto completo al usuario')
*/
enum Genre {
  male = 'M',
  female = 'F',
  unisex = 'U'
};

/** Enum Tipo de movimiento
 * @Info('Guardar letras en DB, retornar texto completo al usuario')
*/
enum movement_type {
  quartz = 'Q',
  automatic = 'A',
  manual = 'M',
  solar = 'S',
  kinetic = 'K'
};

type stock_state = 'in_stock' | 'out_of_stock' | 'pre_order';

type PaymentOrderStatus =
  | "pending" // pendiente
  | "paid"    // pagado
  | "processing"  //en proceso
  | "shipped"  // enviado
  | "delivered"  //entregado
  | "cancelled" //cancelado
  | "refunded"; //reembolsado

type PaymentProviderType =
  | "stripe"
  | "paypal"
  | "mercadopago"
  | "wompi";

enum Role {
    Buyer = 'Buyer',
    Seller = 'Seller',
    Admin = 'Admin'
}