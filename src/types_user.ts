export enum Roles {
    BUYER = 'buyer',
    SELLER = 'seller',
    ADMIN = 'admin'
}

export interface User {
    id: string
    first_name: string
    last_name: string
    email: string
    password_hash: string
    phone: string
    photo_url: string 
    is_active: boolean
    email_verified: boolean
    role: Roles
    created_at: Date
    updated_at: Date
    is_deleted: boolean
}

export interface Address {
    id: string
    user_id: string
    country: string
    state: string
    city: string
    postal_code: string
    street_address: string
    reference: string
    is_default: boolean
}