/**
 * ==============================================================================
 * MATERMED - SUTURAS QUIRÚRGICAS | LÓGICA SEMANA 1
 * Diseño Web II • UPDS 2026 • Ing. Miguel Angel Cruz Ramos
 * 
 * Contenido:
 * 1. DOM Nativo: Modo Oscuro, Menú Hamburguesa, Filtrado Frontend y Validación.
 * 2. Bitácora de Eventos (Día 1 y 2): Event Bubbling, Delegación, Teclado y Checkout.
 * 3. jQuery: Acordeón, Selector Temático PRO, Calculador y Modal con Temporizador (30s).
 * ==============================================================================
 */

// Estado global del calculador
let productoActual = {
  nombre: 'Poliglactina 910',
  precio: 180
};

// Variable para el temporizador regresivo del modal (Reto PRO Viernes)
let intervaloTemporizador = null;
let tiempoRestante = 30;

/* ==========================================================================
   1. DOM NATIVO: MODO OSCURO (EJEMPLO 1 GUÍA DOM)
   ========================================================================== */
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    // Alterna la clase dark-mode en el body
    document.body.classList.toggle('dark-mode');
    
    const esOscuro = document.body.classList.contains('dark-mode');
    themeIcon.textContent = esOscuro ? '☀️' : '🌙';
    themeText.textContent = esOscuro ? 'Modo Claro' : 'Modo Oscuro';
  });
}

/* ==========================================================================
   2. DOM NATIVO: MENÚ HAMBURGUESA RESPONSIVE (EJEMPLO 3 GUÍA DOM)
   ========================================================================== */
const burguerBtn = document.getElementById('burguerBtn');
const navMenu = document.getElementById('navMenu');

if (burguerBtn && navMenu) {
  burguerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });

  // Cerrar el menú al hacer clic en un enlace en pantallas móviles
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navMenu.classList.remove('show');
      }
    });
  });
}

/* ==========================================================================
   3. DOM NATIVO: FILTRADO DE SUTURAS POR CATEGORÍA (EJEMPLO 2 GUÍA DOM)
   ========================================================================== */
function filtrar(categoria) {
  // 1. Seleccionar todas las tarjetas de sutura
  const tarjetas = document.querySelectorAll('.card');
  
  // 2. Actualizar el estado visual activo de los botones de filtro
  const botones = document.querySelectorAll('.filter-btn');
  botones.forEach(btn => btn.classList.remove('active'));
  if (window.event && window.event.target) {
    window.event.target.classList.add('active');
  }

  // 3. Recorrer cada tarjeta evaluando su atributo data-categoria en el DOM
  tarjetas.forEach(card => {
    const catCard = card.dataset.categoria;
    if (categoria === 'todos' || catCard === categoria) {
      card.style.display = 'flex'; // Visible
    } else {
      card.style.display = 'none'; // Oculto
    }
  });

  // Registrar en la bitácora si existe
  if (typeof logEvent === 'function') {
    logEvent('FILTRO_DOM', `El usuario filtró el catálogo por: [${categoria.toUpperCase()}]`);
  }
}

/* ==========================================================================
   4. DOM NATIVO: VALIDACIÓN DINÁMICA DE FORMULARIO (EJEMPLO 4 GUÍA DOM)
   ========================================================================== */
const contactForm = document.getElementById('contactForm');
const alertaBox = document.getElementById('alertaBox');

if (contactForm && alertaBox) {
  contactForm.addEventListener('submit', (e) => {
    // Detener recarga de la página predeterminada
    e.preventDefault();

    const nombre = document.getElementById('doctorNombre').value.trim();
    const email = document.getElementById('doctorEmail').value.trim();
    const especialidad = document.getElementById('especialidadSelect').value;

    // Validación básica de campos obligatorios
    if (nombre === '' || email === '' || especialidad === '') {
      alertaBox.innerHTML = `
        <div class="msg-error">
          ⚠️ Por favor, complete su nombre, correo electrónico y especialidad médica para procesar el requerimiento.
        </div>
      `;
      return;
    }

    // Validación de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alertaBox.innerHTML = `
        <div class="msg-error">
          ⚠️ Ingrese un formato de correo electrónico válido (ejemplo: doctor@hospital.com).
        </div>
      `;
      return;
    }

    // Inyección de mensaje de éxito en el DOM
    alertaBox.innerHTML = `
      <div class="msg-exito">
        ✅ ¡Solicitud recibida con éxito! Estimado(a) <strong>${nombre}</strong>, el departamento quirúrgico de MATERMED coordinará la entrega de muestras para <em>${especialidad}</em>.
      </div>
    `;

    // Registrar en la bitácora
    logEvent('FORM_CONTACTO', `Solicitud de muestras enviada por: ${nombre} (${email})`);

    // Limpiar formulario
    contactForm.reset();
  });
}

/* ==========================================================================
   5. BITÁCORA DE EVENTOS JS (DÍA 1 Y DÍA 2)
   ========================================================================== */
const liveContainer = document.getElementById('liveContainer');
const chatInput = document.getElementById('chatInput');
const logOutput = document.getElementById('logOutput');
const variantSelect = document.getElementById('variantSelect');
const orderForm = document.getElementById('orderForm');
const logDia2 = document.getElementById('logDia2');

// Función unificada para registrar eventos en la consola visual del Día 1
function logEvent(tipo, mensaje) {
  if (!logOutput) return;
  const hora = new Date().toLocaleTimeString();
  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML = `<strong>[${hora}] ${tipo}:</strong> ${mensaje}`;
  logOutput.prepend(item);
}

// Función para registrar transacciones en el Día 2
function addLogDia2(tipo, msg) {
  if (!logDia2) return;
  const t = new Date().toLocaleTimeString();
  const row = document.createElement('div');
  row.className = 'log-item';
  row.innerHTML = `<strong>[${t}] ${tipo}:</strong> ${msg}`;
  logDia2.prepend(row);
}

// DÍA 1: Delegación de Eventos mediante Event Bubbling en #liveContainer
if (liveContainer) {
  // Escucha de clicks en contenedor padre
  liveContainer.addEventListener('click', (e) => {
    // Captura de clics en ofertas relámpago con data-prod
    if (e.target.dataset.prod) {
      logEvent('OFERTA_CLICK', `Sutura relámpago seleccionada: "${e.target.dataset.prod}"`);
    } 
    // Captura de likes / prioridad quirúrgica con data-action
    else if (e.target.dataset.action === 'like') {
      logEvent('LIKE_STREAM', '¡El cirujano/asistente envió un ❤️ de Interés Quirúrgico Prioritario!');
    }
  });

  // Captura de doble clic (dblclick) para urgencias de quirófano
  liveContainer.addEventListener('dblclick', (e) => {
    if (e.target.dataset.prod) {
      logEvent('URGENCIA_QUIRÚRGICA', `⚡ Pedido preferente urgente registrado para: ${e.target.dataset.prod}`);
    }
  });
}

// DÍA 1: Captura de eventos de teclado (keyup) en el Chat Quirúrgico
if (chatInput) {
  chatInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      logEvent('CHAT_ENVIADO', `Mensaje público en el Live: "${e.target.value.trim()}"`);
      e.target.value = '';
    } else if (e.target.value.length > 0 && e.target.value.length % 5 === 0) {
      logEvent('CHAT_INPUT', `Escribiendo consulta médica: "${e.target.value}"`);
    }
  });
}

// DÍA 2: Evento 'change' en selector de variantes
if (variantSelect) {
  variantSelect.addEventListener('change', (e) => {
    addLogDia2('CAMBIO_VARIANTE', `Especialista seleccionó: ${e.target.value}`);
  });
}

// DÍA 2: Evento 'submit' con preventDefault() en pedido rápido
if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const variante = variantSelect.value;
    const usuario = document.getElementById('userTikTok').value.trim();
    
    if (!usuario) return;

    addLogDia2('COMPRA_EXITOSA', `🎉 Pedido relámpago confirmado para <strong>${usuario}</strong> &bull; [${variante}]`);
    
    // Registrar también en bitácora general Día 1
    logEvent('PEDIDO_LIVE', `Orden confirmada para: ${usuario}`);

    // Mostrar feedback visual
    mostrarToast(`¡Pedido confirmado para ${usuario}!`);
    
    orderForm.reset();
  });
}

/* ==========================================================================
   6. FUNCIONALIDADES JQUERY (SEMANA 1 - JUEVES Y VIERNES)
   ========================================================================== */
$(document).ready(function() {

  // JUEVES: Acordeón interactivo para ver Ficha Técnica (.slideToggle)
  $('.accordion-btn').click(function() {
    $(this).next('.accordion-panel').slideToggle('fast');
    // Cambiar la flecha visual
    let $arrow = $(this).find('span:last-child');
    $arrow.text($arrow.text() === '▼' ? '▲' : '▼');
  });

  // RETO PRO JUEVES (+0.5 pts): Cambio dinámico de temática y fondos con jQuery
  $('.btn-theme-selector').click(function() {
    const tema = $(this).data('theme');
    const $box = $('#lineaQuirurgicaBox');

    // Remover todas las clases de temas previos
    $box.removeClass('theme-absorbible theme-no-absorbible theme-cardio');

    if (tema === 'absorbible') {
      $box.addClass('theme-absorbible');
      $('#themeLineIcon').html('🟣');
      $('#themeLineTitle').html('Línea Absorbible Especializada');
      $('#themeLineDesc').html('Polímeros de <strong>Poliglactina 910 y Polidioxanona</strong> para degradación segura por hidrólisis.');
    } else if (tema === 'no-absorbible') {
      $box.addClass('theme-no-absorbible');
      $('#themeLineIcon').html('🟢');
      $('#themeLineTitle').html('Línea No Absorbible de Cierre');
      $('#themeLineDesc').html('Monofilamentos de <strong>Nylon y Seda Natural</strong> con mínima reactividad tisular y excelente paso dérmico.');
    } else if (tema === 'cardio') {
      $box.addClass('theme-cardio');
      $('#themeLineIcon').html('🔵');
      $('#themeLineTitle').html('Línea Cardiovascular & Especial');
      $('#themeLineDesc').html('Suturas monofilamento de <strong>Polipropileno (Prolene)</strong> de fuerza tensil permanente para vasos sanguíneos.');
    }

    logEvent('TEMA_JQUERY', `Línea temática cambiada con jQuery a: [${tema.toUpperCase()}]`);
  });

  // VIERNES: Calculador dinámico de precios en tiempo real con jQuery
  $('#hrs').on('input', function() {
    let cantidad = parseInt($(this).val()) || 1;
    if (cantidad < 1) {
      cantidad = 1;
      $(this).val(1);
    }
    const total = cantidad * productoActual.precio;
    $('#total').text(total);
  });

  // VIERNES + RETO PRO: Abrir Modal de Cotización con Temporizador de 30 segundos
  $('#btnModal').click(function() {
    const cantidad = parseInt($('#hrs').val()) || 1;
    const total = cantidad * productoActual.precio;

    $('#modalProdNombre').text(productoActual.nombre);
    $('#modalCantidad').text(cantidad);
    $('#modalMonto').text(total + ' BOB');

    // Iniciar temporizador regresivo de 30 segundos
    iniciarTemporizadorModal();

    // Mostrar modal con efecto suave de jQuery
    $('#modalCotizacion').fadeIn(250).css('display', 'flex');

    logEvent('MODAL_ABIERTO', `Modal de cotización abierto para ${cantidad} caja(s) de ${productoActual.nombre}`);
  });

  // Cerrar modal al presionar X o Cancelar
  $('#closeModalBtn, #cancelModalBtn').click(function() {
    cerrarModal();
  });

  // Confirmar compra en el Modal
  $('#confirmOrderBtn').click(function() {
    const cant = $('#modalCantidad').text();
    const prod = $('#modalProdNombre').text();
    const tot = $('#modalMonto').text();

    detenerTemporizador();
    $('#modalCotizacion').fadeOut(250);

    mostrarToast(`✅ Cotización de ${cant} caja(s) de ${prod} (${tot}) procesada.`);
    logEvent('COTIZACION_CONFIRMADA', `Cotización aprobada: ${cant} cajas de ${prod} por ${tot}`);
    addLogDia2('COTIZACION_MODAL', `Reserva confirmada en modal: ${prod} [${tot}]`);
  });

});

// Función para seleccionar producto desde la tarjeta hacia el calculador
function seleccionarParaCalculador(nombre, precio) {
  productoActual.nombre = nombre;
  productoActual.precio = precio;

  $('#nombreProductoCalc').text(`${nombre} (${precio} BOB/caja)`);
  const cant = parseInt($('#hrs').val()) || 1;
  $('#total').text(cant * precio);

  // Desplazar suavemente hasta la sección del calculador
  document.getElementById('calculador').scrollIntoView({ behavior: 'smooth' });

  logEvent('SELECCION_PRODUCTO', `Producto fijado en calculador: ${nombre} (${precio} BOB)`);
}

// Iniciar temporizador de 30 segundos (Reto PRO Viernes: setInterval)
function iniciarTemporizadorModal() {
  detenerTemporizador(); // Limpiar si hubiera uno previo
  tiempoRestante = 30;
  actualizarTextoTemporizador();

  intervaloTemporizador = setInterval(() => {
    tiempoRestante--;
    actualizarTextoTemporizador();

    if (tiempoRestante <= 0) {
      detenerTemporizador();
      // Cerrar modal automáticamente con .fadeOut() y alertar
      $('#modalCotizacion').fadeOut('slow');
      alert('⚠️ Tiempo agotado: La tarifa de cotización relámpago ha expirado (30 segundos). Por favor calcule nuevamente.');
      logEvent('TARIFA_EXPIRADA', 'El temporizador de 30s finalizó. Modal cerrado automáticamente.');
    }
  }, 1000);
}

function detenerTemporizador() {
  if (intervaloTemporizador) {
    clearInterval(intervaloTemporizador);
    intervaloTemporizador = null;
  }
}

function actualizarTextoTemporizador() {
  const segStr = tiempoRestante < 10 ? `0${tiempoRestante}` : tiempoRestante;
  $('#temporizadorVisual').text(`00:${segStr}s`);
}

function cerrarModal() {
  detenerTemporizador();
  $('#modalCotizacion').fadeOut(250);
}

// Mostrar Toast Alert de notificación
function mostrarToast(mensaje) {
  const $toast = $('#toastAlert');
  $toast.text(mensaje);
  $toast.stop(true, true).slideDown(300).delay(3500).fadeOut(400);
}
