/** Enum Genero
 * @Info('Guardar letras en DB, retornar texto completo al usuario')
*/
export enum Genre {
  male = 'M',
  female = 'F',
  unisex = 'U'
};

/** Enum Tipo de movimiento
 * @Info('Guardar letras en DB, retornar texto completo al usuario')
*/
export enum movement_type {
  quartz = 'Q',
  automatic = 'A',
  manual = 'M',
  solar = 'S',
  kinetic = 'K'
};

export enum Role {
    Buyer = 'Buyer',
    Seller = 'Seller',
    Admin = 'Admin'
}