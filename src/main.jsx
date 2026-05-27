import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import './styles.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_TABLE = 'ventas_soap';

const hasSupabaseConfig =
  SUPABASE_URL.startsWith('https://') &&
  SUPABASE_ANON_KEY.length > 40;

const supabaseAPI = {
  client: hasSupabaseConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null,
  table: SUPABASE_TABLE,
  isConfigured: hasSupabaseConfig
};

// --- ICONOS DE INTERFAZ ---
const Icons = {
  FileText: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  Search: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  DollarSign: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  AlertCircle: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Wallet: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  CreditCard: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Plus: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Upload: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  CheckCircle2: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>,
  Clock: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Edit2: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  X: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Loader2: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
};

const { Search, FileText, DollarSign, CreditCard, Wallet, AlertCircle, CheckCircle2, Clock, Edit2, Plus, Upload, X, Loader2 } = Icons;

function App() {
  const [sb] = useState(supabaseAPI);
  const [session, setSession] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const [soaps, setSoaps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('todos');
  
  const [editingSoap, setEditingSoap] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- ESTADOS PARA LECTURA DE PDF ---
  const fileInputRef = useRef(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [pdfResultModal, setPdfResultModal] = useState({ show: false, newSoaps: [], existingToUpdate: [], duplicates: 0 });

  const [formData, setFormData] = useState({
    patente: '', propietario: '', metodoPago: 'efectivo', pagado: '', adeudado: ''
  });

  const normalizeEstado = (estadoPago, pagado, adeudado) => {
    const p = Number(pagado) || 0;
    const a = Number(adeudado) || 0;
    const raw = String(estadoPago || '').toLowerCase();
    if (p > 0 && a === 0) return 'pagado';
    if (p > 0 && a > 0) return 'parcial';
    if (raw.includes('pagado')) return 'pagado';
    if (raw.includes('parcial')) return 'parcial';
    return 'pendiente';
  };

  const estadoToSupabase = (estado) => {
    if (estado === 'pagado') return 'Pagado';
    if (estado === 'parcial') return 'Parcial';
    return 'Adeudado';
  };

  const getMetodoPago = (row) => {
    const efectivo = Number(row.efectivo) || 0;
    const transferencia = Number(row.transferencia) || 0;
    if (efectivo > 0 && transferencia > 0) return 'mixto';
    if (transferencia > 0) return 'transferencia';
    if (efectivo > 0) return 'efectivo';
    return row.metodoPago || '';
  };

  const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

  const makeUuid = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const mapDbRow = (row) => ({
    id: row.id,
    supabaseId: row.id,
    fechaVenta: row.fecha_venta || '',
    folio: row.folio || '',
    poliza: row.poliza || '',
    patente: (row.patente || '').toUpperCase(),
    propietario: (row.propietario || '').toUpperCase(),
    rut: row.rut || '',
    tipoVehiculo: row.tipo_vehiculo || '',
    marca: row.marca || '',
    modelo: row.modelo || '',
    ano: row.ano || '',
    motor: row.motor || '',
    rigeDesde: row.rige_desde || '',
    rigeHasta: row.rige_hasta || '',
    prima: Number(row.prima) || 0,
    precioCobrado: Number(row.precio_cobrado) || 0,
    efectivo: Number(row.efectivo) || 0,
    transferencia: Number(row.transferencia) || 0,
    metodoPago: getMetodoPago(row),
    pagado: Number(row.total_recibido) || 0,
    adeudado: Number(row.adeudado) || 0,
    estado: normalizeEstado(row.estado_pago, row.total_recibido, row.adeudado),
    vendedor: row.vendedor || '',
    comprobante: row.comprobante || '',
    observaciones: row.observaciones || '',
    revision: row.revision || '',
    createdAt: row.created_at || '',
    updatedAt: row.updated_at || '',
    origen: row.origen || 'supabase'
  });

  const toDbPayload = (soap, options = {}) => {
    const pagado = Number(soap.pagado) || 0;
    const adeudado = Number(soap.adeudado) || 0;
    const metodoPago = soap.metodoPago || '';
    const estado = soap.estado || normalizeEstado('', pagado, adeudado);
    const efectivo = metodoPago === 'efectivo' ? pagado : Number(soap.efectivo) || 0;
    const transferencia = metodoPago === 'transferencia' ? pagado : Number(soap.transferencia) || 0;
    const total = pagado + adeudado;
    const payload = {
      fecha_venta: soap.fechaVenta || null,
      folio: soap.folio || null,
      poliza: soap.poliza || null,
      patente: (soap.patente || '').trim().toUpperCase(),
      propietario: (soap.propietario || '').trim().toUpperCase(),
      rut: soap.rut || null,
      tipo_vehiculo: soap.tipoVehiculo || null,
      marca: soap.marca || null,
      modelo: soap.modelo || null,
      ano: Number(soap.ano) || null,
      motor: soap.motor || null,
      rige_desde: soap.rigeDesde || null,
      rige_hasta: soap.rigeHasta || null,
      prima: Number(soap.prima) || total || null,
      precio_cobrado: Number(soap.precioCobrado) || total || null,
      efectivo,
      transferencia,
      vendedor: soap.vendedor || null,
      comprobante: soap.comprobante || null,
      observaciones: soap.observaciones || null,
      revision: soap.revision || null
    };

    if (options.includeId !== false) {
      payload.id = isUuid(soap.id) ? soap.id : (isUuid(soap.supabaseId) ? soap.supabaseId : makeUuid());
    }

    if (soap.createdAt) payload.created_at = soap.createdAt;
    return payload;
  };

  const toPaymentUpdatePayload = (soap) => {
    const pagado = Number(soap.pagado) || 0;
    const metodoPago = soap.metodoPago || '';
    return {
      efectivo: metodoPago === 'efectivo' ? pagado : 0,
      transferencia: metodoPago === 'transferencia' ? pagado : 0
    };
  };

  const fetchSoaps = async () => {
    if (!sb?.client) return;

    const { data, error } = await sb.client
      .from(sb.table)
      .select('*')
      .order('created_at', { ascending: false, nullsFirst: false });

    if (error) throw error;

    const loadedSoaps = (data || []).map(mapDbRow);
    loadedSoaps.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    setSoaps(loadedSoaps);
  };

  // Autenticación con Supabase para que RLS proteja la tabla.
  useEffect(() => {
    if (!sb) return;
    if (!sb.client || !sb.isConfigured) {
      setConnectionError("Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Cloudflare.");
      setIsAuthLoading(false);
      setIsLoading(false);
      return;
    }

    let authSubscription;
    const initAuth = async () => {
      try {
        const { data, error } = await sb.client.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        const { data: listener } = sb.client.auth.onAuthStateChange((_event, nextSession) => {
          setSession(nextSession);
        });
        authSubscription = listener.subscription;
      } catch (error) {
        console.error("Error autenticando con Supabase:", error);
        setConnectionError("No se pudo conectar con Supabase. Revisa la URL, anon key y Auth.");
        setIsLoading(false);
      } finally {
        setIsAuthLoading(false);
      }
    };
    initAuth();
    return () => authSubscription?.unsubscribe();
  }, [sb]);

  // Conexión a Supabase + escucha de cambios en tiempo real.
  useEffect(() => {
    if (!session || !sb?.client) {
      setIsLoading(false);
      return;
    }

    let isActive = true;
    const load = async () => {
      setIsLoading(true);
      try {
        await fetchSoaps();
      } catch (error) {
        console.error("Error de lectura Supabase:", error);
        setConnectionError("No se pudieron leer los datos. Revisa tabla, RLS y permisos en Supabase.");
        showNotification("Error leyendo Supabase.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();

    const channel = sb.client
      .channel('ventas-soap-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: sb.table },
        () => load()
      )
      .subscribe();

    return () => {
      isActive = false;
      sb.client.removeChannel(channel);
    };
  }, [session, sb]);

  // Cálculo de Métricas en vivo
  const metrics = useMemo(() => {
    return soaps.reduce((acc, soap) => {
      acc.totalPagado += Number(soap.pagado) || 0;
      acc.totalAdeudado += Number(soap.adeudado) || 0;
      if (soap.metodoPago === 'efectivo') acc.totalEfectivo += Number(soap.pagado) || 0;
      if (soap.metodoPago === 'transferencia') acc.totalTransferencia += Number(soap.pagado) || 0;
      return acc;
    }, { totalPagado: 0, totalAdeudado: 0, totalEfectivo: 0, totalTransferencia: 0 });
  }, [soaps]);

  // Filtro de búsqueda
  const filteredSoaps = useMemo(() => {
    return soaps.filter(soap => {
      const matchesSearch = 
        soap.patente.toLowerCase().includes(searchTerm.toLowerCase()) || 
        soap.propietario.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'todos' || soap.estado === filter;
      return matchesSearch && matchesFilter;
    });
  }, [soaps, searchTerm, filter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  const calculateStatus = (pagado, adeudado) => {
    const p = Number(pagado);
    const a = Number(adeudado);
    if (p > 0 && a === 0) return 'pagado';
    if (p > 0 && a > 0) return 'parcial';
    return 'pendiente';
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 9000);
  };

  const getSupabaseErrorMessage = (error) => {
    const parts = [error?.message, error?.details, error?.hint, error?.code].filter(Boolean);
    return parts.length ? parts.join(' | ') : 'Error desconocido de Supabase.';
  };

  const closePaymentModal = () => {
    setEditingSoap(null);
    setIsAdding(false);
  };

  const closePdfResultModal = () => {
    setPdfResultModal({ show: false, newSoaps: [], existingToUpdate: [], duplicates: 0 });
  };

  const withTimeout = (promise, ms = 25000) => {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const error = new Error('La operación tardó demasiado.');
        error.name = 'OperationTimeoutError';
        reject(error);
      }, ms);
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
  };

  const isOperationTimeout = (error) => error?.name === 'OperationTimeoutError';

  const handleEditClick = (soap) => {
    setEditingSoap(soap);
    setFormData({
      patente: soap.patente,
      propietario: soap.propietario,
      metodoPago: soap.metodoPago || 'efectivo',
      pagado: soap.pagado || '',
      adeudado: soap.adeudado || ''
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!sb?.client) return;
    setIsLoggingIn(true);
    try {
      const { error } = await sb.client.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword
      });
      if (error) throw error;
      setConnectionError('');
      showNotification('Sesión iniciada.');
    } catch (error) {
      console.error("Error iniciando sesión:", error);
      showNotification('No se pudo iniciar sesión. Revisa email y contraseña.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!sb?.client) return;
    await sb.client.auth.signOut();
    setSoaps([]);
    showNotification('Sesión cerrada.');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!session || !editingSoap || !sb?.client) return;
    setIsSaving(true);
    
    const updatedSoap = {
      ...editingSoap,
      metodoPago: formData.metodoPago,
      pagado: Number(formData.pagado),
      adeudado: Number(formData.adeudado),
      estado: calculateStatus(formData.pagado, formData.adeudado)
    };

    try {
      const { error } = await withTimeout(
        sb.client
          .from(sb.table)
          .update(toPaymentUpdatePayload(updatedSoap))
          .eq('id', updatedSoap.id)
      );
      if (error) throw error;
      closePaymentModal();
      showNotification('¡Pago actualizado en Supabase!');
    } catch (error) {
      console.error(error);
      if (isOperationTimeout(error)) {
        showNotification('No pudimos confirmar el guardado. Revisa tu conexión e intenta otra vez.');
      } else {
        showNotification(`Error Supabase: ${getSupabaseErrorMessage(error)}`);
        setEditingSoap(editingSoap);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!session || !sb?.client) return;
    setIsSaving(true);
    
    const newSoap = {
      id: makeUuid(),
      patente: formData.patente.toUpperCase(),
      propietario: formData.propietario.toUpperCase(),
      metodoPago: formData.metodoPago,
      pagado: Number(formData.pagado),
      adeudado: Number(formData.adeudado),
      estado: calculateStatus(formData.pagado, formData.adeudado)
    };

    try {
      const { error } = await withTimeout(
        sb.client.from(sb.table).insert(toDbPayload(newSoap))
      );
      if (error) throw error;
      closePaymentModal();
      showNotification('¡Nuevo SOAP registrado en Supabase!');
    } catch (error) {
      console.error(error);
      if (isOperationTimeout(error)) {
        showNotification('No pudimos confirmar el guardado. Revisa tu conexión e intenta otra vez.');
      } else {
        showNotification(`Error Supabase: ${getSupabaseErrorMessage(error)}`);
        setIsAdding(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // --- NUEVA LÓGICA: PROCESAMIENTO AUTOMÁTICO DE PDF ---
  const triggerPdfUpload = () => {
    if(fileInputRef.current) fileInputRef.current.click();
  };

  const handlePdfUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      let newExtractedSoaps = [];
      let existingToUpdateList = [];
      let duplicateCount = 0;

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const text = textContent.items.map(item => item.str).join(' ').replace(/\s+/g, ' ');

        const patenteMatch = text.match(/INSCRIPCION R\.V\.M\.:\s*([A-Z0-9-]+)/i);
        const propietarioMatch = text.match(/PROPIETARIO:\s*(.+?)\s*RUT:/i);
        
        // Extracción inteligente de la Prima (Precio)
        let adeudadoInicial = 0;
        const primaMatch = text.match(/(?:PRIMA|TOTAL|VALOR)[^\d$]*\$?\s*([0-9]{1,3}(?:\.[0-9]{3})+)/i);
        if (primaMatch) {
          adeudadoInicial = parseInt(primaMatch[1].replace(/\./g, ''), 10);
        } else {
          // Fallback: buscar cualquier monto grande con signo $
          const moneyMatch = text.match(/\$\s*([0-9]{2,3}(?:\.[0-9]{3})+)/);
          if (moneyMatch) {
            adeudadoInicial = parseInt(moneyMatch[1].replace(/\./g, ''), 10);
          }
        }

        if (patenteMatch && propietarioMatch) {
          const patenteEncontrada = patenteMatch[1].trim().toUpperCase();
          const propietarioEncontrado = propietarioMatch[1].trim().toUpperCase();

          const existe = soaps.find(s => s.patente === patenteEncontrada);
          
          if (existe) {
            // Si ya existe pero no tiene deuda registrada, lo marcamos para actualizar
            if (existe.adeudado === 0 && adeudadoInicial > 0 && existe.pagado === 0) {
              if (!existingToUpdateList.some(s => s.patente === patenteEncontrada)) {
                existingToUpdateList.push({ ...existe, adeudado: adeudadoInicial, estado: 'pendiente' });
              }
            } else {
              duplicateCount++;
            }
          } else {
            if (!newExtractedSoaps.some(s => s.patente === patenteEncontrada)) {
              newExtractedSoaps.push({
                patente: patenteEncontrada,
                propietario: propietarioEncontrado,
                adeudado: adeudadoInicial
              });
            }
          }
        }
      }

      setPdfResultModal({ show: true, newSoaps: newExtractedSoaps, existingToUpdate: existingToUpdateList, duplicates: duplicateCount });

    } catch (error) {
      console.error("Error al procesar el PDF:", error);
      showNotification("Hubo un problema al intentar leer el PDF.");
    }
    
    setIsProcessingPdf(false);
    event.target.value = null; // Reiniciar input
  };

  const handleSaveImportedSoaps = async () => {
    if (!session || !sb?.client) return;
    setIsSaving(true);
    try {
      // 1. Guardamos los NUEVOS
      const promesasNuevos = pdfResultModal.newSoaps.map(async (soap, index) => {
        const newSoap = {
          id: makeUuid(),
          patente: soap.patente,
          propietario: soap.propietario,
          metodoPago: '',
          pagado: 0,
          adeudado: soap.adeudado || 0,
          estado: 'pendiente'
        };
        const { error } = await sb.client.from(sb.table).insert(toDbPayload(newSoap));
        if (error) throw error;
      });

      // 2. Actualizamos los EXISTENTES que no tenían deuda
      const promesasActualizar = pdfResultModal.existingToUpdate.map(async (soap) => {
        const updatedSoap = { ...soap, estado: 'pendiente', pagado: Number(soap.pagado) || 0 };
        const { error } = await sb.client
          .from(sb.table)
          .update({
            prima: Number(updatedSoap.adeudado) || Number(updatedSoap.prima) || 0,
            precio_cobrado: Number(updatedSoap.adeudado) || Number(updatedSoap.precioCobrado) || 0
          })
          .eq('id', soap.id);
        if (error) throw error;
      });

      await withTimeout(Promise.all([...promesasNuevos, ...promesasActualizar]));
      closePdfResultModal();

      let msg = "¡Proceso exitoso!";
      if(pdfResultModal.newSoaps.length > 0) msg = `¡${pdfResultModal.newSoaps.length} SOAPs nuevos importados!`;
      if(pdfResultModal.existingToUpdate.length > 0) msg = `¡Deuda actualizada en ${pdfResultModal.existingToUpdate.length} buses!`;
      
      showNotification(msg);
    } catch (error) {
       console.error("Error guardando SOAPs importados:", error);
       if (isOperationTimeout(error)) {
         showNotification("No pudimos confirmar el guardado. Revisa tu conexión e intenta otra vez.");
       } else {
         showNotification(`Error Supabase: ${getSupabaseErrorMessage(error)}`);
         setPdfResultModal(pdfResultModal);
       }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-300" />
            <h1 className="text-xl font-bold tracking-tight">Ventas SOAP Buses</h1>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <span className="flex items-center gap-2 text-xs font-medium text-blue-200">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Supabase conectado
              </span>
            ) : connectionError ? (
              <span className="text-xs text-red-100 bg-red-700/60 px-3 py-1 rounded-full">
                Supabase pendiente
              </span>
            ) : (
               <span className="text-xs text-blue-300 flex items-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin"/> Conectando a Supabase...
               </span>
            )}
            {session && (
              <button onClick={handleLogout} className="text-xs text-blue-100 bg-blue-800 hover:bg-blue-700 px-3 py-1 rounded-full transition">
                Salir
              </button>
            )}
            <div className="text-sm font-medium bg-blue-800 px-3 py-1 rounded-full hidden sm:block">
              {soaps.length} Registros
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Notificaciones */}
        {notification && (
          <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-fade-in fixed bottom-4 right-4 z-50 max-w-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <p className="font-medium text-sm">{notification}</p>
            </div>
          </div>
        )}

        {!session && !isAuthLoading ? (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-900">Entrar al sistema</h2>
              <p className="text-sm text-slate-500 mt-1">Usa un usuario creado en Supabase Auth.</p>
            </div>

            {connectionError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-700">
                {connectionError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  placeholder="vendedor@empresa.cl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                  placeholder="Tu contraseña"
                />
              </div>
              <button
                type="submit"
                disabled={isLoggingIn || Boolean(connectionError)}
                className="w-full px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoggingIn ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        ) : (
        <>
        {/* Panel de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Recaudación Total</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(metrics.totalPagado)}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">Por Cobrar (Deudas)</p>
                <h3 className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(metrics.totalAdeudado)}</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">En Efectivo</p>
                <h3 className="text-xl font-bold text-slate-700 mt-1">{formatCurrency(metrics.totalEfectivo)}</h3>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium">En Transferencias</p>
                <h3 className="text-xl font-bold text-slate-700 mt-1">{formatCurrency(metrics.totalTransferencia)}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Buscador y Botones de Acción */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex-1 w-full relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" placeholder="Buscar por patente o propietario..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
            <select 
              value={filter} onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="todos">Todos los estados</option>
              <option value="pagado">Completamente Pagados</option>
              <option value="pendiente">Pendientes de Pago</option>
              <option value="parcial">Pago Parcial</option>
            </select>

            <button 
              onClick={() => { setFormData({ patente: '', propietario: '', metodoPago: 'efectivo', pagado: '', adeudado: '' }); setIsAdding(true); }}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition font-medium flex-1 md:flex-none"
            >
              <Plus className="w-5 h-5" /> <span className="hidden md:inline">Nuevo</span>
            </button>

            {/* BOTÓN MÁGICO DE PDF */}
            <button 
              onClick={triggerPdfUpload}
              disabled={isProcessingPdf}
              className="flex items-center justify-center gap-2 bg-slate-800 text-white px-5 py-3 rounded-lg hover:bg-slate-700 transition font-medium flex-1 md:flex-none"
            >
              {isProcessingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              <span className="hidden md:inline">{isProcessingPdf ? 'Leyendo...' : 'Subir PDF'}</span>
            </button>
            <input 
              type="file" 
              accept=".pdf" 
              ref={fileInputRef} 
              onChange={handlePdfUpload} 
              className="hidden" 
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Patente</th>
                  <th className="px-6 py-4">Propietario</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Pagado</th>
                  <th className="px-6 py-4 text-right">Adeudado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {connectionError ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-red-600 font-medium">
                      {connectionError}
                    </td>
                  </tr>
                ) : isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p>Cargando datos desde TU nube...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredSoaps.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No se encontraron resultados.
                    </td>
                  </tr>
                ) : (
                  filteredSoaps.map((soap) => (
                    <tr key={soap.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-700 text-base">{soap.patente}</td>
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate" title={soap.propietario}>
                        {soap.propietario}
                      </td>
                      <td className="px-6 py-4">
                        {soap.estado === 'pagado' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800"><CheckCircle2 className="w-3.5 h-3.5"/> PAGADO</span>}
                        {soap.estado === 'pendiente' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800"><Clock className="w-3.5 h-3.5"/> PENDIENTE</span>}
                        {soap.estado === 'parcial' && <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><AlertCircle className="w-3.5 h-3.5"/> PARCIAL</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700 text-base">
                        {formatCurrency(soap.pagado)}
                        {soap.pagado > 0 && <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{soap.metodoPago}</div>}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-600 text-base">
                        {soap.adeudado > 0 ? formatCurrency(soap.adeudado) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleEditClick(soap)}
                          className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 rounded-lg transition"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Modal Edición / Agregar Manual */}
      {(editingSoap || isAdding) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {isAdding ? 'Nuevo SOAP Manual' : 'Registrar Pago'}
              </h2>
              <button onClick={closePaymentModal} className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={isAdding ? handleSaveNew : handleSaveEdit} className="p-6 space-y-5">
              {isAdding ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Patente del Bus</label>
                    <input type="text" required placeholder="Ej: ABCD12" className="w-full px-4 py-3 border border-slate-300 rounded-lg uppercase font-mono text-lg" value={formData.patente} onChange={e => setFormData({...formData, patente: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Propietario</label>
                    <input type="text" required placeholder="Nombre Completo o Empresa" className="w-full px-4 py-3 border border-slate-300 rounded-lg uppercase" value={formData.propietario} onChange={e => setFormData({...formData, propietario: e.target.value})} />
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Actualizando a:</p>
                  <p className="font-mono font-bold text-2xl text-blue-900 mt-1">{editingSoap.patente}</p>
                  <p className="text-sm font-semibold text-blue-800 mt-1 truncate">{editingSoap.propietario}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Dinero Pagado</label>
                  <input type="number" min="0" required className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-medium text-slate-900" value={formData.pagado} onChange={e => setFormData({...formData, pagado: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Falta pagar</label>
                  <input type="number" min="0" required className="w-full px-4 py-3 border border-slate-300 rounded-lg text-lg font-medium text-red-600" value={formData.adeudado} onChange={e => setFormData({...formData, adeudado: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">¿Cómo se pagó?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, metodoPago: 'efectivo'})} className={`px-4 py-3 rounded-xl border text-base font-bold transition flex flex-col items-center justify-center gap-2 ${formData.metodoPago === 'efectivo' ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <Wallet className="w-6 h-6" /> Efectivo
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, metodoPago: 'transferencia'})} className={`px-4 py-3 rounded-xl border text-base font-bold transition flex flex-col items-center justify-center gap-2 ${formData.metodoPago === 'transferencia' ? 'bg-blue-100 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <CreditCard className="w-6 h-6" /> Transfer.
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" disabled={isSaving} onClick={closePaymentModal} className="px-5 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition font-bold">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'Guardando...' : 'Guardar y Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resultados Lectura PDF */}
      {pdfResultModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-slate-800 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" /> Resumen del PDF
              </h2>
            </div>
            
            <div className="p-6 space-y-4 text-center">
              {pdfResultModal.newSoaps.length > 0 ? (
                <>
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    ¡Se encontraron {pdfResultModal.newSoaps.length} SOAPs nuevos!
                  </h3>
                </>
              ) : pdfResultModal.existingToUpdate.length > 0 ? (
                <>
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Deudas detectadas
                  </h3>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Sin datos nuevos</h3>
                  <p className="text-slate-600">
                    Todos los documentos ya estaban al día en tu lista.
                  </p>
                </>
              )}

              {pdfResultModal.existingToUpdate.length > 0 && (
                <div className="bg-blue-50 text-blue-800 text-sm py-3 px-4 rounded-lg font-medium">
                  Se detectó el valor de la prima para {pdfResultModal.existingToUpdate.length} buses que ya tenías registrados en 0. ¡Se actualizarán automáticamente!
                </div>
              )}

              {pdfResultModal.duplicates > 0 && (
                <div className="bg-slate-100 text-slate-500 text-sm py-2 px-4 rounded-lg inline-block">
                  Ignoramos {pdfResultModal.duplicates} buses porque ya están perfectos en tu lista.
                </div>
              )}
              
              <div className="pt-4 mt-6 border-t border-slate-100 flex justify-center gap-3">
                <button 
                  type="button" 
                  disabled={isSaving}
                  onClick={closePdfResultModal}
                  className="px-5 py-3 text-slate-600 hover:bg-slate-100 rounded-lg transition font-bold"
                >
                  {(pdfResultModal.newSoaps.length > 0 || pdfResultModal.existingToUpdate.length > 0) ? 'Cancelar' : 'Cerrar'}
                </button>
                {(pdfResultModal.newSoaps.length > 0 || pdfResultModal.existingToUpdate.length > 0) && (
                  <button 
                    onClick={handleSaveImportedSoaps}
                    disabled={isSaving}
                    className="px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition font-bold flex items-center gap-2 shadow-md"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {isSaving ? 'Guardando...' : 'Aplicar Cambios'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
