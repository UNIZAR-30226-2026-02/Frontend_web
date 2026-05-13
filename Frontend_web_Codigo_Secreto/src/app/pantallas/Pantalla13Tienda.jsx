/*
 * Pantalla de la Tienda Virtual.
 *
 * RF-9:  Adquirir temas visuales y paquetes de cartas con "balas".
 * RF-10: Configurar y equipar personalizaciones de entre las adquiridas.
 *
 * Contrato de API usado:
 *  GET  /api/temas/activos                   → catálogo: { id_tema, nombre, descripcion, precioBalas, comprado }
 *  GET  /api/jugadores/personalizaciones     → inventario: { id_personalizacion, nombre, tipo, valor_visual, equipado, comprado }
 *  POST /api/tienda/comprar/tema             → { id_tema }          → { balas }
 *  POST /api/tienda/comprar/personalizacion  → { id_personalizacion } → { balas }
 *  PUT  /api/personalizaciones/equipar       → { id_personalizacion, equipado } → { id_personalizacion, equipado }
 */

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, Palette, Check, ArrowLeft, Loader2,
  AlertCircle, RefreshCw, Wand2, X, ShoppingCart,
} from "lucide-react";

import {
  ScreenFrame, ManilaFolder, DarkCard, RedStamp, FBISeal,
  SectionHeader, SubsectionLabel,
} from "../components/ScreenFrame";
import { IconoBala } from "../components/iconoBala";
import { UserContext } from "../components/UserContext";
import { obtenerPerfil } from "../api/apiJugador";
import {
  obtenerTemasActivos,
  obtenerPersonalizacionesJugador,
  comprarTema,
  comprarPersonalizacion,
  equiparPersonalizacion,
} from "../api/apiTienda";

import {limpiarNombreTema} from "../components/funciones";

// HELPERS VISUALES

const EMOJI_PAQUETE = {
  básico:            "🃏",
  magia:             "🪄",
  histórico:         "📜",
  "vida submarina":  "🐙",
  cyberpunk:         "🌆",
  naturaleza:        "🌿",
};

function emojiPaquete(nombre = "") {
  return EMOJI_PAQUETE[nombre.toLowerCase()] ?? "🎴";
}

// Derivar color de fondo suave a partir del valor_visual hex
function colorSuave(hex = "#888") {
  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
  return { bg: `${cleanHex}33`, border: `${cleanHex}88` };
}

// MODAL DE CONFIRMACIÓN DE COMPRA

function ModalConfirmar({ item, balasActuales, onConfirmar, onCancelar, confirmando }) {
  if (!item) return null;

  const precio   = item.precioBalas ?? item.precio_balas ?? item.precio_bala ?? 0;
  const nombre   = limpiarNombreTema(item.nombre) ?? "—";
  const saldo    = balasActuales - precio;
  const sinFondos = saldo < 0;

  return (
    <>
      {/* Fondo */}
      <div
        className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
        onClick={onCancelar}
      />

      {/* Caja del modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm">
        <div className="bg-[#1e1810] border-2 border-[#5a4a30] rounded-sm shadow-[6px_8px_32px_rgba(0,0,0,0.8)] p-6">

          {/* Cabecera */}
          <div className="flex items-center justify-between mb-4">
            <h3
              className="font-['Special_Elite',cursive] text-[#e8dcc8] tracking-[0.1em]"
              style={{ fontSize: 16 }}
            >
              CONFIRMAR COMPRA
            </h3>
            <button
              onClick={onCancelar}
              className="text-[#8a7a60] hover:text-[#d4b878] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Detalle del artículo */}
          <div className="bg-[#2a2218] border border-[#5a4a30]/40 rounded-sm p-4 mb-4">
            <p className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 9 }}>
              ARTÍCULO SELECCIONADO:
            </p>
            <p className="font-['Special_Elite',cursive] text-[#e8dcc8] mt-1" style={{ fontSize: 15 }}>
              {nombre}
            </p>
            {item.descripcion && (
              <p className="font-['Courier_Prime',monospace] text-[#888] mt-1" style={{ fontSize: 10 }}>
                {item.descripcion}
              </p>
            )}
          </div>

          {/* Resumen económico */}
          <div className="space-y-2 mb-5">
            {[
              { label: "Precio",         valor: precio,          color: "#cc3333" },
              { label: "Balas actuales", valor: balasActuales,   color: "#d4b878" },
              { label: "Saldo restante", valor: Math.max(saldo, 0), color: sinFondos ? "#cc3333" : "#50a050" },
            ].map(({ label, valor, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-['Courier_Prime',monospace] text-[#8a7a60]" style={{ fontSize: 10 }}>
                  {label}
                </span>
                <div className="flex items-center gap-1">
                  <IconoBala size={11} />
                  <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 14, color }}>
                    {valor.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {sinFondos && (
            <div className="flex items-center gap-2 bg-[#3a1a1a]/80 border border-[#8b2020]/40 rounded-sm px-3 py-2 mb-4">
              <AlertCircle className="w-4 h-4 text-[#e08080] flex-shrink-0" />
              <p className="font-['Courier_Prime',monospace] text-[#e08080]" style={{ fontSize: 10 }}>
                No tienes suficientes balas para esta compra.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onCancelar}
              className="flex-1 bg-[#3a2a2a] hover:bg-[#4a3a3a] text-[#a09070] py-2.5 rounded-sm cursor-pointer transition-colors font-['Courier_Prime',monospace]"
              style={{ fontSize: 12 }}
            >
              CANCELAR
            </button>
            <button
              onClick={onConfirmar}
              disabled={sinFondos || confirmando}
              className="flex-1 bg-[#2a5a2a] hover:bg-[#3a6a3a] disabled:bg-[#2a2a2a] disabled:cursor-not-allowed text-white py-2.5 rounded-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              {confirmando
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span className="font-['Special_Elite',cursive] tracking-[0.1em]" style={{ fontSize: 12 }}>
                      CONFIRMAR
                    </span>
                  </>
                )
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// TARJETA DE PAQUETE DE CARTAS

function TarjetaPaquete({ tema, onComprar }) {
  const precio   = tema.precioBalas ?? tema.precio_balas ?? tema.precio_bala ?? 0;
  const esGratis = precio === 0;
  const comprado = tema.comprado === true;

  return (
    <DarkCard className="p-4 flex flex-col items-center text-center gap-2 relative h-full">
      {esGratis && (
        <span
          className="absolute top-2 left-2 font-['Courier_Prime',monospace] text-[#50a050] border border-[#50a050]/40 px-1.5 py-0.5 rounded-sm"
          style={{ fontSize: 15 }}
        >
          GRATIS
        </span>
      )}

      <span className="text-3xl">{emojiPaquete(tema.nombre)}</span>

      <p className="font-['Special_Elite',cursive] text-[#e8dcc8] leading-tight" style={{ fontSize: 13 }}>
        {tema.nombre.toUpperCase()}
      </p>

      {tema.descripcion && (
        <p className="font-['Courier_Prime',monospace] text-[#888]" style={{ fontSize: 10 }}>
          {tema.descripcion}
        </p>
      )}

      <div className="mt-auto w-full">
        {comprado || esGratis ? (
          <div className="flex items-center gap-1 text-[#50a060] pt-1">
            <Check className="w-3.5 h-3.5" />
            <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 10 }}>
              DISPONIBLE
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1">
              <IconoBala size={12} />
              <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 13 }}>
                {precio}
              </span>
            </div>
            <button
              onClick={() => onComprar(tema)}
              className="w-full bg-[#5a4a20]/80 hover:bg-[#5a4a20] text-[#e8dcc8] py-1.5 rounded-sm transition-colors cursor-pointer"
            >
              <span className="font-['Special_Elite',cursive] tracking-tighter" style={{ fontSize: 15 }}>
                ADQUIRIR
              </span>
            </button>
          </>
        )}
      </div>
    </DarkCard>
  );
}

// TARJETA DE PERSONALIZACIÓN (marco o fondo)

function TarjetaPersonalizacion({ item, onComprar, onEquipar, equipando }) {
  const comprado = item.comprado === true;
  const equipado = item.equipado === true;
  const precio   = item.precioBalas ?? item.precio_balas ?? item.precio_bala ?? 0;
  const cv       = colorSuave(item.valor_visual);

  return (
    <DarkCard
      className={`p-3 sm:p-4 text-center relative flex flex-col gap-2 transition-all h-full ${
        equipado ? "ring-2 ring-[#d4b878] shadow-[0_0_14px_rgba(212,184,120,0.25)]" : ""
      }`}
    >
      {/* Muestra de color */}
      <div
        className="w-full h-10 rounded-sm border"
        style={{ backgroundColor: cv.bg, borderColor: cv.border }}
      >
        <div
          className="w-full h-full rounded-sm"
          style={{ backgroundColor: `#${item.valor_visual}` }}
        />
      </div>

      <p className="font-['Special_Elite',cursive] text-[#e8dcc8] leading-tight" style={{ fontSize: 13 }}>
        {limpiarNombreTema(item.nombre).toUpperCase()}
      </p>

      {item.descripcion && (
        <p className="font-['Courier_Prime',monospace] text-[#888]" style={{ fontSize: 10 }}>
          {item.descripcion}
        </p>
      )}

      <div className="mt-auto w-full">
        {comprado ? (
          /* Ya adquirido → mostrar botón equipar o badge equipado */
          equipado ? (
            <div className="flex items-center justify-center gap-1 text-[#d4b878]">
              <Check className="w-3 h-3" />
              <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 12 }}>EQUIPADO</span>
            </div>
          ) : (
            <button
              onClick={() => onEquipar(item)}
              disabled={equipando}
              className="w-full bg-[#2a3a5a]/80 hover:bg-[#2a3a5a] disabled:opacity-40 text-[#80a0d0] py-1 rounded-sm transition-colors cursor-pointer font-['Courier_Prime',monospace]"
              style={{ fontSize: 15 }}
            >
              {equipando ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : "EQUIPAR"}
            </button>
          )
        ) : (
          /* No adquirido → mostrar precio y botón comprar */
          <>
            <div className="flex items-center justify-center gap-1">
              <IconoBala size={11} />
              <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 12 }}>
                {precio}
              </span>
            </div>
            <button
              onClick={() => onComprar(item)}
              className="w-full bg-[#8b2020]/80 hover:bg-[#8b2020] text-white py-1 rounded-sm transition-colors cursor-pointer"
            >
              <span className="font-['Special_Elite',cursive] tracking-tighter" style={{ fontSize: 15 }}>
                COMPRAR
              </span>
            </button>
          </>
        )}
      </div>
    </DarkCard>
  );
}

// TOAST

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className={`mb-4 px-4 py-3 rounded-sm border font-['Courier_Prime',monospace] flex items-center gap-2 text-sm ${
        toast.tipo === "ok"
          ? "bg-[#1a3a1a]/80 border-[#50a050]/40 text-[#80c080]"
          : "bg-[#3a1a1a]/80 border-[#8b2020]/40 text-[#e08080]"
      }`}
    >
      {toast.tipo === "ok"
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />
      }
      {toast.msg}
    </div>
  );
}

// PANTALLA PRINCIPAL

export function Pantalla13Tienda() {
  const navigate = useNavigate();
  const { loginUsuario } = useContext(UserContext);

  // Datos del servidor
  const [balas, setBalas]                       = useState(0);
  const [temas, setTemas]                       = useState([]);      // catálogo completo
  const [personalizaciones, setPersonalizaciones] = useState([]);    // catálogo completo con comprado/equipado

  //Estado de UI 
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState(null);
  const [toast, setToast]           = useState(null);
  const [equipandoId, setEquipandoId] = useState(null);

  //Modal de confirmación 
  const [itemPendiente, setItemPendiente]   = useState(null);  // item a comprar
  const [tipoPendiente, setTipoPendiente]   = useState(null);  // 'tema' | 'personalizacion'
  const [confirmando, setConfirmando]       = useState(false);

  //Toast helper
  const mostrarToast = (tipo, msg) => {
    setToast({ tipo, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Carga inicial ─────────────────────────────────────────────────────────
  const cargarTodo = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const wrapperToast = (msg, tipo) => mostrarToast(tipo === 'error' ? 'error' : 'ok', msg);
      const [perfil, catalogoTemas, catalogoPers] = await Promise.all([
        obtenerPerfil(navigate, wrapperToast),
        obtenerTemasActivos(navigate, wrapperToast),
        obtenerPersonalizacionesJugador(navigate, wrapperToast),
      ]);

      setBalas(perfil.balas ?? 0);
      loginUsuario(perfil);
      setTemas(Array.isArray(catalogoTemas) ? catalogoTemas : []); 
      const persConEquipamiento = (Array.isArray(catalogoPers) ? catalogoPers : []).map(p => {
      // Si ya viene con equipado = true, lo respetamos
      if (p.equipado) return p;

      const valor = p.valor_visual?.replace('#', '').toLowerCase();
      const marcoPerfil = perfil.marco_carta_equipado?.replace('#', '').toLowerCase();
      const fondoPerfil = perfil.fondo_tablero_equipado?.replace('#', '').toLowerCase();

      if (p.tipo === 'carta' && valor === marcoPerfil) {
        return { ...p, equipado: true };
      }
      if (p.tipo === 'tablero' && valor === fondoPerfil) {
        return { ...p, equipado: true };
      }
      return p;
    });

      setPersonalizaciones(persConEquipamiento);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => { cargarTodo(); }, [cargarTodo]);

  // Abrir modal de confirmación
  const abrirModalTema = (tema) => {
    setItemPendiente(tema);
    setTipoPendiente("tema");
  };

  const abrirModalPersonalizacion = (item) => {
    setItemPendiente(item);
    setTipoPendiente("personalizacion");
  };

  const cerrarModal = () => {
    if (confirmando) return; // no cerrar mientras se procesa
    setItemPendiente(null);
    setTipoPendiente(null);
  };

  // Confirmar compra
  const handleConfirmarCompra = async () => {
    if (!itemPendiente) return;
    setConfirmando(true);
    try {
      let res;
      if (tipoPendiente === "tema") {
        res = await comprarTema(itemPendiente.id_tema);
        // Marcar como comprado en el catálogo local
        setTemas(prev =>
          prev.map(t => t.id_tema === itemPendiente.id_tema ? { ...t, comprado: true } : t)
        );
      } else {
        res = await comprarPersonalizacion(itemPendiente.id_personalizacion);
        // Marcar como comprado en el inventario local
        setPersonalizaciones(prev =>
          prev.map(p =>
            p.id_personalizacion === itemPendiente.id_personalizacion
              ? { ...p, comprado: true }
              : p
          )
        );
      }

      const nuevasBalas = res.balas ?? balas;
      setBalas(nuevasBalas);

      mostrarToast("ok", `¡${itemPendiente.nombre} adquirido! Te quedan ${nuevasBalas.toLocaleString()} balas.`);
      cerrarModal();
    } catch (err) {
      mostrarToast("error", err.message || "Error al realizar la compra.");
      cerrarModal();
    } finally {
      setConfirmando(false);
    }
  };

  // Equipar personalización
  const handleEquipar = async (item) => {
    setEquipandoId(item.id_personalizacion);
    try {
      await equiparPersonalizacion(item.id_personalizacion, true);
      // Desequipar el del mismo tipo y equipar el nuevo
      setPersonalizaciones(prev =>
        prev.map(p => ({
          ...p,
          equipado:
            p.id_personalizacion === item.id_personalizacion
              ? true
              : p.tipo === item.tipo
                ? false
                : p.equipado,
        }))
      );
      mostrarToast("ok", `${limpiarNombreTema(item.nombre)} equipado correctamente.`);
    } catch (err) {
      mostrarToast("error", err.message || "Error al equipar.");
    } finally {
      setEquipandoId(null);
    }
  };

  // Separar personalizaciones por tipo
  const persMarco   = personalizaciones.filter(p => p.tipo === "carta");
  const persTablero = personalizaciones.filter(p => p.tipo === "tablero");

  // Vistas de carga / error
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#c4a060] animate-spin" />
          <p className="font-['Courier_Prime',monospace] text-[#c4a060]" style={{ fontSize: 30 }}>
            ACCEDIENDO AL MERCADO NEGRO...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-8 h-8 text-[#8b2020]" />
        <p className="font-['Courier_Prime',monospace] text-[#8b2020]" style={{ fontSize: 30 }}>
          {error}
        </p>
        <button
          onClick={cargarTodo}
          className="flex items-center gap-2 font-['Courier_Prime',monospace] text-[#8a7a60] hover:text-[#d4b878] cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reintentar
        </button>
      </div>
    );
  }

  // RENDER PRINCIPAL
  return (
    <ScreenFrame title="MERCADO NEGRO">
      <div className="max-w-5xl mx-auto pt-8 sm:pt-4">

        {/* Botón volver */}
        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-[#8a7a60] hover:text-[#d4b878] transition-colors cursor-pointer mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-['Courier_Prime',monospace]" style={{ fontSize: 11}}>
            VOLVER AL ESCRITORIO
          </span>
        </button>

        {/* Badge de balas */}
        <div className="flex justify-end mb-4">
          <div className="flex items-center gap-2 bg-[#1a1208]/80 border border-[#5a4a20]/30 rounded-sm px-4 py-2 shadow-[2px_3px_10px_rgba(0,0,0,0.4)]">
            <IconoBala size={16} />
            <span className="font-['Courier_Prime',monospace] text-[#d4b878]" style={{ fontSize: 18 }}>
              {balas.toLocaleString()}
            </span>
            <span className="font-['Courier_Prime',monospace] text-[#a08060]" style={{ fontSize: 10 }}>
              BALAS
            </span>
          </div>
        </div>

        {/* Toast */}
        <Toast toast={toast} />

        <ManilaFolder>
          <div className="p-4 sm:p-6 lg:p-8">

            {/* Pestaña decorativa */}
            <div className="absolute -top-0 left-6 bg-[#b89055] px-4 py-1.5 rounded-b-sm border-x border-b border-[#a08040] shadow-sm z-10">
              <span className="font-['Courier_Prime',monospace] text-[#2a1a08]" style={{ fontSize: 9 }}>
                MERCADO NEGRO
              </span>
            </div>

            <div className="flex items-start justify-between mb-5 flex-wrap gap-3 mt-2">
              <div>
                <SectionHeader title="MERCADO NEGRO" />
                <p className="font-['Courier_Prime',monospace] text-[#6a5a40] mt-1" style={{ fontSize: 13}}>
                  Suministros tácticos y equipamiento clasificado
                </p>
              </div>
              <FBISeal size={50} />
            </div>

            {/* PAQUETES DE CARTAS */}
            <SubsectionLabel
              icon={<Package className="w-4 h-4 text-[#5a4a30]" />}
              label="PAQUETES DE CARTAS"
              borderColor="#8b2020"
            />
            <p className="font-['Courier_Prime',monospace] text-[#000000] mb-3" style={{ fontSize: 13 }}>
              El paquete Básico es gratuito. Los demás permiten unirte a partidas públicas con ese tema.
            </p>

            {temas.length === 0 ? (
              <p className="font-['Courier_Prime',monospace] text-[#888] text-center py-6" style={{ fontSize: 11 }}>
                No hay paquetes disponibles en este momento.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
                {temas.map(t => (
                  <TarjetaPaquete
                    key={t.id_tema}
                    tema={t}
                    onComprar={abrirModalTema}
                  />
                ))}
              </div>
            )}

            {/* SECCIÓN 2: MARCOS DE CARTAS */}
            <SubsectionLabel
              icon={<Palette className="w-4 h-4 text-[#5a4a30]" />}
              label="MARCOS DE CARTAS"
              borderColor="#d4af37"
            />
            <p className="font-['Courier_Prime',monospace] text-[#000000] mb-3" style={{ fontSize: 13 }}>
              Personaliza el borde de cada carta del tablero. Solo puedes tener uno equipado a la vez.
            </p>

            {persMarco.length === 0 ? (
              <p className="font-['Courier_Prime',monospace] text-[#888] text-center py-4" style={{ fontSize: 11 }}>
                No hay marcos disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
                {persMarco.map(item => (
                  <TarjetaPersonalizacion
                    key={item.id_personalizacion}
                    item={item}
                    onComprar={abrirModalPersonalizacion}
                    onEquipar={handleEquipar}
                    equipando={equipandoId === item.id_personalizacion}
                  />
                ))}
              </div>
            )}

            {/*  SECCIÓN 3: FONDOS DE TABLERO*/}
            <SubsectionLabel
              icon={<Wand2 className="w-4 h-4 text-[#5a4a30]" />}
              label="FONDOS DE TABLERO"
              borderColor="#8b5a8b"
            />
            <p className="font-['Courier_Prime',monospace] text-[#000000] mb-3" style={{ fontSize: 13}}>
              Personaliza el color de fondo del tablero de juego. Solo puedes tener uno equipado a la vez.
            </p>

            {persTablero.length === 0 ? (
              <p className="font-['Courier_Prime',monospace] text-[#888] text-center py-4" style={{ fontSize: 11 }}>
                No hay fondos disponibles.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {persTablero.map(item => (
                  <TarjetaPersonalizacion
                    key={item.id_personalizacion}
                    item={item}
                    onComprar={abrirModalPersonalizacion}
                    onEquipar={handleEquipar}
                    equipando={equipandoId === item.id_personalizacion}
                  />
                ))}
              </div>
            )}

            {/* Pie */}
            <div className="flex items-center justify-between flex-wrap gap-2 mt-6">
              <span className="font-['Courier_Prime',monospace] text-[#8a7a60]/50" style={{ fontSize: 9 }}>
                REF: FBI-STORE-4472
              </span>
              <RedStamp text="CLASSIFIED" className="rotate-[-3deg]" />
            </div>
          </div>
        </ManilaFolder>
      </div>

      {/* Modal de confirmación de compra */}
      <ModalConfirmar
        item={itemPendiente}
        balasActuales={balas}
        onConfirmar={handleConfirmarCompra}
        onCancelar={cerrarModal}
        confirmando={confirmando}
      />
    </ScreenFrame>
  );
}