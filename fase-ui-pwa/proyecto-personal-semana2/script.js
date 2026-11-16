/**
 * ==============================================================================
 * MATERMED - SUTURAS QUIRÚRGICAS | LÓGICA VISTA ESCRITORIO (script.js)
 * Diseño Web II • UPDS 2026 • Ing. Miguel Angel Cruz Ramos
 * ==============================================================================
 */

let productoActual = {
  nombre: 'Poliglactina 910',
  precio: 180
};

let intervaloTemporizador = null;
let tiempoRestante = 30;

// Modo Oscuro
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');
const themeText = document.getElementById('themeText');

if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const esOscuro = document.body.classList.contains('dark-mode');
    themeIcon.textContent = esOscuro ? '☀️' : '🌙';
    themeText.textContent = esOscuro ? 'Modo Claro' : 'Modo Oscuro';
  });
}

// Menú Hamburguesa Responsive
const burguerBtn = document.getElementById('burguerBtn');
const navMenu = document.getElementById('navMenu');

if (burguerBtn && navMenu) {
  burguerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navMenu.classList.remove('show');
      }
    });
  });
}

// Filtrado de Suturas DOM
function filtrar(categoria) {
  const tarjetas = document.querySelectorAll('.card');
  const botones = document.querySelectorAll('.filter-btn');
  botones.forEach(btn => btn.classList.remove('active'));
  if (window.event && window.event.target) {
    window.event.target.classList.add('active');
  }

  tarjetas.forEach(card => {
    const catCard = card.dataset.categoria;
    if (categoria === 'todos' || catCard === categoria) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  if (typeof logEvent === 'function') {
    logEvent('FILTRO_DOM', `Filtrado por: [${categoria.toUpperCase()}]`);
  }
}

// Validación Formulario Contacto
const contactForm = document.getElementById('contactForm');
const alertaBox = document.getElementById('alertaBox');

if (contactForm && alertaBox) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('doctorNombre').value.trim();
    const email = document.getElementById('doctorEmail').value.trim();
    const especialidad = document.getElementById('especialidadSelect').value;

    if (nombre === '' || email === '' || especialidad === '') {
      alertaBox.innerHTML = `
        <div class="msg-error">
          ⚠️ Por favor, complete su nombre, correo y especialidad médica.
        </div>
      `;
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alertaBox.innerHTML = `
        <div class="msg-error">
          ⚠️ Ingrese un correo electrónico válido (ej: doctor@hospital.com).
        </div>
      `;
      return;
    }

    alertaBox.innerHTML = `
      <div class="msg-exito">
        ✅ ¡Solicitud recibida! Estimado(a) <strong>${nombre}</strong>, coordinaremos la entrega para <em>${especialidad}</em>.
      </div>
    `;

    logEvent('FORM_CONTACTO', `Solicitud de muestras enviada por: ${nombre}`);
    contactForm.reset();
  });
}

// Bitácora de Eventos (Event Bubbling)
const liveContainer = document.getElementById('liveContainer');
const chatInput = document.getElementById('chatInput');
const logOutput = document.getElementById('logOutput');
const variantSelect = document.getElementById('variantSelect');
const orderForm = document.getElementById('orderForm');
const logDia2 = document.getElementById('logDia2');

function logEvent(tipo, mensaje) {
  if (!logOutput) return;
  const hora = new Date().toLocaleTimeString();
  const item = document.createElement('div');
  item.className = 'log-item';
  item.innerHTML = `<strong>[${hora}] ${tipo}:</strong> ${mensaje}`;
  logOutput.prepend(item);
}

function addLogDia2(tipo, msg) {
  if (!logDia2) return;
  const t = new Date().toLocaleTimeString();
  const row = document.createElement('div');
  row.className = 'log-item';
  row.innerHTML = `<strong>[${t}] ${tipo}:</strong> ${msg}`;
  logDia2.prepend(row);
}

if (liveContainer) {
  liveContainer.addEventListener('click', (e) => {
    if (e.target.dataset.prod) {
      logEvent('OFERTA_CLICK', `Sutura seleccionada: "${e.target.dataset.prod}"`);
    } else if (e.target.dataset.action === 'like') {
      logEvent('LIKE_STREAM', '¡El cirujano envió un ❤️ de Interés Quirúrgico!');
    }
  });

  liveContainer.addEventListener('dblclick', (e) => {
    if (e.target.dataset.action === 'like' || e.target.classList.contains('btn-like')) {
      logEvent('LIKE_CORAZONES', '¡Doble clic! ❤️❤️❤️ Ráfaga de corazones enviada al Live Quirúrgico');
    } else if (e.target.dataset.prod) {
      logEvent('URGENCIA_QUIRÚRGICA', `⚡ Pedido urgente para: ${e.target.dataset.prod}`);
    }
  });
}

if (chatInput) {
  chatInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      logEvent('CHAT_ENVIADO', `Mensaje médico: "${e.target.value.trim()}"`);
      e.target.value = '';
    }
  });
}

if (variantSelect) {
  variantSelect.addEventListener('change', (e) => {
    addLogDia2('CAMBIO_VARIANTE', `Seleccionó: ${e.target.value}`);
  });
}

if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const variante = variantSelect.value;
    const usuario = document.getElementById('userTikTok').value.trim();
    if (!usuario) return;

    addLogDia2('COMPRA_EXITOSA', `🎉 Pedido confirmado para <strong>${usuario}</strong> &bull; [${variante}]`);
    mostrarToast(`¡Pedido confirmado para ${usuario}!`);
    orderForm.reset();
  });
}

// Funcionalidades jQuery
$(document).ready(function() {

  // Acordeón
  $('.accordion-btn').click(function() {
    $(this).next('.accordion-panel').slideToggle('fast');
  });

  // Reto PRO Jueves: Temas
  $('.btn-theme-selector').click(function() {
    const tema = $(this).data('theme');
    const $box = $('#lineaQuirurgicaBox');
    $box.removeClass('theme-absorbible theme-no-absorbible theme-cardio');

    if (tema === 'absorbible') {
      $box.addClass('theme-absorbible');
      $('#themeLineIcon').html('🟣');
      $('#themeLineTitle').html('Línea Absorbible Especializada');
      $('#themeLineDesc').html('Polímeros de <strong>Poliglactina 910 y Polidioxanona</strong> con degradación segura por hidrólisis.');
    } else if (tema === 'no-absorbible') {
      $box.addClass('theme-no-absorbible');
      $('#themeLineIcon').html('🟢');
      $('#themeLineTitle').html('Línea No Absorbible de Cierre');
      $('#themeLineDesc').html('Monofilamentos de <strong>Nylon y Seda Natural</strong> de mínima reactividad tisular.');
    } else if (tema === 'cardio') {
      $box.addClass('theme-cardio');
      $('#themeLineIcon').html('🔵');
      $('#themeLineTitle').html('Línea Cardiovascular & Especial');
      $('#themeLineDesc').html('Suturas monofilamento de <strong>Polipropileno (Prolene)</strong> para vasos sanguíneos.');
    }
  });

  // Calculador
  $('#hrs').on('input', function() {
    let cantidad = parseInt($(this).val()) || 1;
    if (cantidad < 1) { cantidad = 1; $(this).val(1); }
    $('#total').text(cantidad * productoActual.precio);
  });

  // Modal 30s
  $('#btnModal').click(function() {
    const cantidad = parseInt($('#hrs').val()) || 1;
    const total = cantidad * productoActual.precio;

    $('#modalProdNombre').text(productoActual.nombre);
    $('#modalCantidad').text(cantidad);
    $('#modalMonto').text(total + ' BOB');

    iniciarTemporizadorModal();
    $('#modalCotizacion').fadeIn(250).css('display', 'flex');
  });

  $('#closeModalBtn, #cancelModalBtn').click(function() {
    cerrarModal();
  });

  $('#confirmOrderBtn').click(function() {
    detenerTemporizador();
    $('#modalCotizacion').fadeOut(250);
    mostrarToast(`✅ Cotización confirmada para ${$('#modalProdNombre').text()}`);
  });

});

function seleccionarParaCalculador(nombre, precio) {
  productoActual.nombre = nombre;
  productoActual.precio = precio;
  $('#nombreProductoCalc').text(`${nombre} (${precio} BOB/caja)`);
  const cant = parseInt($('#hrs').val()) || 1;
  $('#total').text(cant * precio);
  document.getElementById('calculador').scrollIntoView({ behavior: 'smooth' });
}

function iniciarTemporizadorModal() {
  detenerTemporizador();
  tiempoRestante = 30;
  actualizarTextoTemporizador();

  intervaloTemporizador = setInterval(() => {
    tiempoRestante--;
    actualizarTextoTemporizador();

    if (tiempoRestante <= 0) {
      detenerTemporizador();
      $('#modalCotizacion').fadeOut('slow');
      alert('⚠️ Tarifa Flash Expirada: Los 30 segundos de vigencia concluyeron.');
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

function mostrarToast(mensaje) {
  const $toast = $('#toastAlert');
  $toast.text(mensaje);
  $toast.stop(true, true).slideDown(300).delay(3500).fadeOut(400);
}
