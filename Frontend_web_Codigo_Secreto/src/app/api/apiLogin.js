/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * referentes al login y registro de usuarios.
 */

import { crearErrorDescriptivo } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL;

// RF-02: Login con Google -> POST /api/auth/login
export async function loginConGoogle(idToken) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
    body: JSON.stringify({ id_google: idToken }) 
  });

  if(res.status === 409){
    throw new Error('Ya tiene una sesión abierta en otro dispositivo. Ciérrala antes de continuar');
  }

  if (!res.ok) {
    throw await crearErrorDescriptivo(res, 'No se pudo autenticar. Intenta de nuevo');
  }

  return res.json();
}

// RF-01: Registro de nuevo usuario -> POST /api/auth/registro
export async function registroNuevoUsuario(idToken, tag) {
  const res = await fetch(`${BASE_URL}/auth/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
    body: JSON.stringify({ id_google: idToken, tag: tag }) 
  });

  if (res.status === 409) {
    throw new Error("TAG_DUPLICADO");
  }

  if (!res.ok) {
    throw await crearErrorDescriptivo(res, 'No se pudo crear la cuenta. Intenta con otro nombre de usuario');
  }

  return res.json();
}

// RF-XX: Logout -> POST /api/auth/logout
export async function logoutUsuario() {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) {
    throw await crearErrorDescriptivo(res, 'Error al cerrar sesión');
  }

  return res.ok; 
}

// RF-XX: Desactivar cuenta -> PUT /api/auth/desactivar
export async function desactivarCuentaUsuario() {
  const res = await fetch(`${BASE_URL}/auth/desactivar`, {
    method: "PUT",
    credentials: "include"

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Error al desactivar la cuenta en el servidor.');
  }

  // TODO: revisar lo que devuelve el backend.
  return res.ok; 
}

