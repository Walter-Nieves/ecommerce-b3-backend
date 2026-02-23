/** Tipo primitivo Tag
 * @property {number} id - ID del tag
 * @property {string} name - Nombre del tag mostrable para el usuario
 * @property {boolean} is_deleted - Indica si el tag ha sido eliminado lógicamente sin eliminarlo físicamente de la base de datos
 */
interface Tag {
  id: number;
  name: string;
  is_deleted: boolean;
}

/** Tipo primitivo Material
 * @property {number} id - ID del material
 * @property {string} name - Nombre del material mostrable para el usuario
 * @property {string} slug - Slug del material para uso interno, marcar como único para evitar duplicados
 * @property {string} sku - SKU del material para uso interno, marcar como único para evitar duplicados
 * @Info('El sku debe tener especificamente 2 letras o numeros')
* @property {boolean} is_deleted - Indica si el material ha sido eliminado lógicamente sin eliminarlo físicamente de la base de datos
 */
interface Material {
  id: number;
  name: string;
  slug: string;
  sku: string;
  is_deleted: boolean;
}

/** Tipo primitivo Color
 * @property {string} hex_code_id - Código hexadecimal del color, marcar como único para evitar duplicados
 * @Info('La primary_key es el  hex_code_id')
 * @property {string} name - Nombre del color mostrable para el usuario
 * @property {string} slug - Slug del color para uso interno, marcar como único para evitar duplicados
 * @property {string} sku - SKU del color para uso interno, marcar como único para evitar duplicados
 * @Info('El sku debe tener especificamente 3 letras o numeros')
 * @property {boolean} is_deleted - Indica si el color ha sido eliminado lógicamente sin eliminarlo físicamente de la base de datos
 */
interface Color {
  hex_code_id: string;
  name: string;
  slug: string;
  sku: string;
  is_deleted: boolean;
}

/** Tipo primitivo Clasp
 * @property {number} id - ID del cierre
 * @property {string} name - Nombre del cierre mostrable para el usuario
 * @property {string} slug - Slug del cierre para uso interno, marcar como único para evitar duplicados
 * @property {boolean} is_deleted - Indica si el cierre ha sido eliminado lógicamente sin eliminarlo físicamente de la base de datos
 */
interface Clasp {
  id: number;
  name: string;
  slug: string;
  is_deleted: boolean;
}

/** Tipo primitivo Marca
 * @property {number} id - ID de la marca
 * @property {string} name - Nombre de la marca mostrable para el usuario
 * @property {string} slug - Slug de la marca para uso interno, marcar como único para evitar duplicados
 * @property {string} sku - SKU de la marca para uso interno, marcar como único para evitar duplicados
 * @Info('El sku debe tener especificamente 3 letras o numeros')
 * @property {string} logo_url - URL del logo de la marca, marcar como único para evitar duplicados
 * @property {boolean} is_deleted - Indica si la marca ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 */
export interface Brand {
  id: number;
  name: string;
  slug: string;
  sku: string;
  logo_url: string;
  is_deleted: boolean;
}

/** Tipo primitivo Categoría
 * @property {number} id - ID de la categoría
 * @property {string} name - Nombre de la categoría mostrable para el usuario
 * @property {string} slug - Slug de la categoría para uso interno, marcar como único para evitar duplicados
 * @property {boolean} is_deleted - Indica si la categoría ha sido eliminada lógicamente sin eliminarla físicamente de la base de datos
 */
export interface Category {
  id: number;
  name: string;
  slug: string;
  is_deleted: boolean;
}