/*
 * Fichero en el que se implementan las funciones de comunicación con el backend
 * referentes al login y registro de usuarios.
 */

import { handleErrorResponse } from './errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL;

// RF-02: Login con Google -> POST /api/auth/login
export async function loginConGoogle(idToken, navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
    body: JSON.stringify({ id_google: idToken }) 
  });

  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo autenticar. Intenta de nuevo', showToast);
  }

  return res.json();
}

// RF-01: Registro de nuevo usuario -> POST /api/auth/registro
export async function registroNuevoUsuario(idToken, tag, navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/auth/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
    body: JSON.stringify({ id_google: idToken, tag: tag }) 
  });

  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'No se pudo crear la cuenta. Intenta con otro nombre de usuario', showToast);
  }

  return res.json();
}

// RF-XX: Logout -> POST /api/auth/logout
export async function logoutUsuario(navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'Error al cerrar sesión', showToast);
  }

  return res.ok; 
}

// RF-XX: Desactivar cuenta -> PUT /api/auth/desactivar
export async function desactivarCuentaUsuario(navigate = null, showToast = null) {
  const res = await fetch(`${BASE_URL}/auth/desactivar`, {
    method: "PUT",
    credentials: "include"
  });

  if (!res.ok) {
    return handleErrorResponse(res, navigate, 'Error al desactivar la cuenta en el servidor.', showToast);
  }

  return res.ok; 
}
