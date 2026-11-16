/**
 * ==============================================================================
 * MATERMED - PORTAL WEB QUIRÚRGICO UNIFICADO (SCRIPT MAESTRO)
 * Diseño Web II (SIS-0141) • UPDS 2026 • Ing. Miguel Angel Cruz Ramos
 *
 * Arquitectura de Vista Única:
 * - #loginScreen: Inicio de sesión (medico, trabajador, admin).
 * - #appContent: Vista única unificada cuyo núcleo es el Catálogo de Suturas.
 * - Al iniciar sesión con cualquier usuario, solo cambia el nombre y rol
 *   mostrado en el navbar/barra de sesión; todas las funciones permanecen visibles.
 * ==============================================================================
 */

const APP_STATE = {
  currentRole: null,
  catalogo: [],
  categoriaActiva: 'todos',
  busquedaTexto: '',
  productoCalculador: { nombre: 'Poliglactina 910 (Tipo Vicryl)', precio: 180 },
  temporizadorModal: null,
  segundosRestantes: 30
};

const CREDENCIALES = {
  medico: '123',
  doctor: '123',
  trabajador: '123',
  instrumentador: '123',
  admin: '123',
  administrador: '123'
};

const ROL_MAP = {
  medico: 'medico',
  doctor: 'medico',
  trabajador: 'trabajador',
  instrumentador: 'trabajador',
  admin: 'admin',
  administrador: 'admin'
};

const ROLES_INFO = {
  medico: {
    icon: '👨‍⚕️',
    name: 'Dr. Médico Cirujano',
    pillText: '👨‍⚕️ Médico',
    pillClass: 'role-medico'
  },
  trabajador: {
    icon: '🩺',
    name: 'Lic. Instrumentador Quirúrgico',
    pillText: '🩺 Trabajador',
    pillClass: 'role-trabajador'
  },
  admin: {
    icon: '🛡️',
    name: 'Director General MATERMED',
    pillText: '🛡️ Administrador',
    pillClass: 'role-admin'
  }
};

const DATOS_CASCADA = {
  cardio: {
    planos: [
      { id: 'vasos', label: 'Anastomosis de Grandes Vasos', sutura: 'Polipropileno (Prolene) 5-0 o 6-0 con doble aguja vascular' },
      { id: 'pericardio', label: 'Cierre Pericárdico y Valvular', sutura: 'Polidioxanona (PDS) o Poliglactina 910' }
    ]
  },
  plastica: {
    planos: [
      { id: 'subdermico', label: 'Cierre Subdérmico Estético', sutura: 'Poliglactina 910 4-0 aguja triangular cortante' },
      { id: 'epidermico', label: 'Sutura Epidérmica Cutánea', sutura: 'Nylon Quirúrgico 5-0 o 6-0 monofilamento' }
    ]
  },
  general: {
    planos: [
      { id: 'aponeurosis', label: 'Fascia Muscular y Aponeurosis', sutura: 'Polidioxanona (PDS) o Poliglactina 910 Calibre 1' },
      { id: 'gastro', label: 'Anastomosis Gastrointestinal', sutura: 'Seda Quirúrgica 3-0 o Catgut Crómico 2-0' }
    ]
  },
  ginecologia: {
    planos: [
      { id: 'utero', label: 'Histerorrafia (Cesárea)', sutura: 'Catgut Crómico 1 o Poliglactina 910 Calibre 1' },
      { id: 'mucosa', label: 'Episiotomía / Mucosa Vaginal', sutura: 'Catgut Crómico 2-0 o Poliglactina 910 2-0' }
    ]
  }
};

// Respaldo offline si se abre directamente sin servidor HTTP
const FALLBACK_SUTURAS = [
  { id: 'SUT-001', titulo: 'Poliglactina 910 (Tipo Vicryl)', tipo: 'Absorbible Sintética Trenzada', genero: 'Cirugía General', calibre: 'USP 2-0', precio: 180, portada: 'images/poliglactina.svg', descripcion: 'Recubierta con estearato de calcio. Absorción completa entre 56 y 70 días.' },
  { id: 'SUT-002', titulo: 'Poliglactina 910 Delicada', tipo: 'Absorbible Sintética Trenzada', genero: 'Ginecología & Obstetricia', calibre: 'USP 3-0', precio: 175, portada: 'images/poliglactina.svg', descripcion: 'Fácil anudado y paso tisular suave en tejidos friables.' },
  { id: 'SUT-003', titulo: 'Nylon Monofilamento (Poliamida)', tipo: 'No Absorbible Monofilamento', genero: 'Cirugía Plástica', calibre: 'USP 4-0', precio: 125, portada: 'images/nylon.svg', descripcion: 'Mínima reacción tisular y resultado estético superior en cierre dérmico.' },
  { id: 'SUT-004', titulo: 'Nylon Monofilamento Cutáneo', tipo: 'No Absorbible Monofilamento', genero: 'Traumatología', calibre: 'USP 2-0', precio: 120, portada: 'images/nylon.svg', descripcion: 'Gran resistencia a la tracción para cierre de piel en extremidades.' },
  { id: 'SUT-005', titulo: 'Seda Negra Trenzada', tipo: 'No Absorbible Natural', genero: 'Cirugía General', calibre: 'USP 0', precio: 110, portada: 'images/seda.svg', descripcion: 'Tratada con cera y silicona para una maniobrabilidad excepcional.' },
  { id: 'SUT-006', titulo: 'Seda Negra Microquirúrgica', tipo: 'No Absorbible Natural', genero: 'Oftalmología', calibre: 'USP 6-0', precio: 150, portada: 'images/seda.svg', descripcion: 'Microaguja espatulada de corte lateral para planos corneales.' },
  { id: 'SUT-007', titulo: 'Polipropileno Cardiovascular (Prolene)', tipo: 'No Absorbible Monofilamento', genero: 'Cirugía Cardiovascular', calibre: 'USP 5-0', precio: 210, portada: 'images/polipropileno.svg', descripcion: 'Superficie de arrastre prácticamente nula y retención indefinida.' },
  { id: 'SUT-008', titulo: 'Polipropileno Vascular Fino', tipo: 'No Absorbible Monofilamento', genero: 'Cirugía Cardiovascular', calibre: 'USP 6-0', precio: 225, portada: 'images/polipropileno.svg', descripcion: 'Diseñado para anastomosis de arterias coronarias.' },
  { id: 'SUT-009', titulo: 'Catgut Crómico de Precisión', tipo: 'Absorbible Natural', genero: 'Ginecología & Obstetricia', calibre: 'USP 2-0', precio: 140, portada: 'images/catgut.svg', descripcion: 'Sales de cromo que retrasan la acción de colagenasas (90 días).' },
  { id: 'SUT-010', titulo: 'Catgut Simple Quirúrgico', tipo: 'Absorbible Natural Rápida', genero: 'Cirugía General', calibre: 'USP 3-0', precio: 115, portada: 'images/catgut.svg', descripcion: 'Absorción rápida en 70 días para tejido celular subcutáneo.' },
  { id: 'SUT-011', titulo: 'Polidioxanona Monofilamento (PDS)', tipo: 'Absorbible Sintética Monofilamento', genero: 'Cirugía General', calibre: 'USP 1', precio: 240, portada: 'images/polidioxanona.svg', descripcion: 'Soporte tensil por más de 6 semanas para cierre de aponeurosis.' },
  { id: 'SUT-012', titulo: 'Polidioxanona Pediátrica (PDS)', tipo: 'Absorbible Sintética Monofilamento', genero: 'Cirugía Pediátrica', calibre: 'USP 4-0', precio: 230, portada: 'images/polidioxanona.svg', descripcion: 'Crecimiento tisular asistido sin compresión rígida.' }
];

// ==============================================================================
// 1. REGISTRO SERVICE WORKER Y ESTADO DE RED (PWA)
// ==============================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('[SW MATERMED] Registrado:', reg.scope))
      .catch(err => console.warn('[SW MATERMED] Registro omitido:', err));
  });
}

function actualizarEstadoRedPC() {
  const $net = $('#estadoRedPC');
  if (!$net.length) return;
  if (navigator.onLine) {
    $net.text('🟢 En Línea').removeClass('offline');
  } else {
    $net.text('🟠 Modo Offline').addClass('offline');
  }
}

// ==============================================================================
// 2. AUTENTICACIÓN Y ACTUALIZACIÓN DE NAVBAR (UNA SOLA VISTA)
// ==============================================================================
function intentarLogin(usuario, password) {
  const u = usuario.trim().toLowerCase();
  const p = password.trim();
  if (CREDENCIALES[u] && CREDENCIALES[u] === p) {
    iniciarSesion(ROL_MAP[u]);
    return true;
  }
  return false;
}

function iniciarSesion(rol) {
  if (!ROLES_INFO[rol]) rol = 'medico';
  APP_STATE.currentRole = rol;
  localStorage.setItem('matermed_role', rol);
  localStorage.setItem('matermed_rol', rol);
  localStorage.setItem('matermed_nombre', ROLES_INFO[rol].name);

  aplicarPerfilEnNavbar(rol);

  $('#loginScreen').fadeOut(250, () => {
    $('#appContent').fadeIn(250);
    logEvent('LOGIN', `Sesión iniciada como ${ROLES_INFO[rol].name}`);
  });
}

function cerrarSesion() {
  APP_STATE.currentRole = null;
  localStorage.removeItem('matermed_role');
  localStorage.removeItem('matermed_rol');
  localStorage.removeItem('matermed_nombre');

  $('#appContent').fadeOut(200, () => {
    $('#loginUser').val('');
    $('#loginPass').val('');
    $('#loginError').hide();
    $('#loginScreen').fadeIn(250);
  });
}

function aplicarPerfilEnNavbar(rol) {
  const info = ROLES_INFO[rol] || ROLES_INFO.medico;
  $('#roleIcon').text(info.icon);
  $('#roleCurrentName').text(info.name);
  $('#navbarRolePill')
    .text(info.pillText)
    .removeClass('role-medico role-trabajador role-admin')
    .addClass(info.pillClass);
}

// ==============================================================================
// 3. CATÁLOGO ASÍNCRONO (FETCH JSON + LAZY LOADING + FILTROS + BÚSQUEDA)
// ==============================================================================
function obtenerCategoriaFiltro(item) {
  const genero = (item.genero || '').toLowerCase();
  const tipo = (item.tipo || '').toLowerCase();
  if (genero.includes('cardiovascular')) return 'cardio';
  if (tipo.includes('no absorbible')) return 'no-absorbible';
  return 'absorbible';
}

function cargarCatalogoAsync() {
  fetch('data/suturas.json')
    .then(res => {
      if (!res.ok) throw new Error('Error HTTP ' + res.status);
      return res.json();
    })
    .then(data => {
      APP_STATE.catalogo = data;
      renderizarCatalogo();
      logEvent('CATALOGO_FETCH', `${data.length} suturas cargadas desde suturas.json`);
    })
    .catch(() => {
      APP_STATE.catalogo = FALLBACK_SUTURAS;
      renderizarCatalogo();
      logEvent('CATALOGO_OFFLINE', `${FALLBACK_SUTURAS.length} suturas cargadas en modo local`);
    });
}

function renderizarCatalogo() {
  const $grid = $('#suturasGrid');
  $grid.empty();

  const texto = APP_STATE.busquedaTexto.toLowerCase();
  const catFiltro = APP_STATE.categoriaActiva;

  const filtradas = APP_STATE.catalogo.filter(item => {
    const cat = obtenerCategoriaFiltro(item);
    const coincideCat = catFiltro === 'todos' || cat === catFiltro;
    const textoItem = `${item.titulo} ${item.genero} ${item.calibre} ${item.tipo}`.toLowerCase();
    const coincideTexto = !texto || textoItem.includes(texto);
    return coincideCat && coincideTexto;
  });

  if (filtradas.length === 0) {
    $grid.append($('<p>').css({ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '24px' })
      .text('No se encontraron suturas que coincidan con el filtro actual.'));
    return;
  }

  filtradas.forEach(item => {
    const cat = obtenerCategoriaFiltro(item);
    const tagClass = cat === 'cardio' ? 'tag-cardio' : (cat === 'no-absorbible' ? 'tag-no-absorbible' : 'tag-absorbible');

    const $card = $('<div>').addClass('card').attr('data-categoria', cat);
    const $imgWrap = $('<div>').addClass('card-img-wrap');
    const $img = $('<img>').attr({
      src: item.portada || 'images/poliglactina.svg',
      alt: item.titulo,
      width: 220,
      height: 130,
      loading: 'lazy'
    }).on('error', function () {
      if (!$(this).data('fallback')) {
        $(this).data('fallback', true).attr('src', 'images/poliglactina.svg');
      }
    });
    $imgWrap.append($img);

    const $body = $('<div>').addClass('card-body');
    const $tag = $('<span>').addClass(`card-tag ${tagClass}`).text(item.tipo || 'Sutura Quirúrgica');
    const $title = $('<h3>').addClass('card-title').text(item.titulo);
    const $meta = $('<small>').css({ color: 'var(--primary)', fontWeight: '700', marginBottom: '6px' })
      .text(`${item.genero || 'General'} • ${item.calibre || 'USP 2-0'}`);
    const $desc = $('<p>').addClass('card-text').text(item.descripcion || '');
    const $price = $('<div>').addClass('card-price').text(`${item.precio} BOB / caja`);
    const $btn = $('<button>')
      .attr('type', 'button')
      .addClass('btn-card btn-cotizar-card')
      .data('nombre', item.titulo)
      .data('precio', item.precio)
      .text('⚡ Cotizar Flash');

    $body.append($tag, $title, $meta, $desc, $price, $btn);
    $card.append($imgWrap, $body);
    $grid.append($card);
  });
}

// ==============================================================================
// 4. INICIALIZACIÓN Y EVENTOS DELEGADOS (.off().on())
// ==============================================================================
$(document).ready(function () {
  actualizarEstadoRedPC();
  $(window).off('online offline').on('online offline', actualizarEstadoRedPC);

  // Recuperar sesión activa si ya inició
  const rolGuardado = localStorage.getItem('matermed_role') || localStorage.getItem('matermed_rol');
  if (rolGuardado && ROLES_INFO[rolGuardado]) {
    APP_STATE.currentRole = rolGuardado;
    aplicarPerfilEnNavbar(rolGuardado);
    $('#loginScreen').hide();
    $('#appContent').show();
  }

  // Cargar catálogo asíncrono
  cargarCatalogoAsync();

  // Login rápido (1 clic)
  $(document).off('click', '.quick-btn').on('click', '.quick-btn', function () {
    iniciarSesion($(this).data('rol'));
  });

  // Login tradicional
  $('#loginForm').off('submit').on('submit', function (e) {
    e.preventDefault();
    const u = $('#loginUser').val();
    const p = $('#loginPass').val();
    if (intentarLogin(u, p)) {
      $('#loginError').hide();
    } else {
      $('#loginError')
        .text('⚠️ Credenciales incorrectas. Use: medico / 123, trabajador / 123 o admin / 123')
        .slideDown();
    }
  });

  // Mostrar/ocultar contraseña
  $('#btnTogglePass').off('click').on('click', function () {
    const $inp = $('#loginPass');
    $inp.attr('type', $inp.attr('type') === 'password' ? 'text' : 'password');
  });

  // Cerrar sesión
  $('#btnLogout').off('click').on('click', cerrarSesion);

  // Menú Hamburguesa
  $('#burguerBtn').off('click').on('click', function () {
    $('#navMenu').toggleClass('show');
  });

  $('#navMenu').off('click', 'a').on('click', 'a', function () {
    $('#navMenu a').removeClass('active');
    $(this).addClass('active');
    if (window.innerWidth <= 768) $('#navMenu').removeClass('show');
  });

  // Modo Oscuro / Claro
  $('#themeBtn').off('click').on('click', function () {
    $('body').toggleClass('dark-mode');
    const osc = $('body').hasClass('dark-mode');
    $('#themeIcon').text(osc ? '☀️' : '🌙');
    $('#themeText').text(osc ? 'Modo Claro' : 'Modo Oscuro');
    logEvent('TEMA', osc ? 'Modo Oscuro activado' : 'Modo Claro activado');
  });

  // Filtros de Catálogo (Event Delegation)
  $('#filterBar').off('click', '.filter-btn').on('click', '.filter-btn', function () {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');
    APP_STATE.categoriaActiva = $(this).data('cat');
    renderizarCatalogo();
    logEvent('FILTRO_CATALOGO', `Categoría: ${APP_STATE.categoriaActiva}`);
  });

  // Buscador en vivo (keyup)
  $('#buscarSutura').off('keyup').on('keyup', function () {
    APP_STATE.busquedaTexto = $(this).val().trim();
    renderizarCatalogo();
    logEvent('BUSQUEDA_KEYUP', `Término: "${APP_STATE.busquedaTexto}"`);
  });

  // Seleccionar sutura desde el catálogo para el calculador
  $('#suturasGrid').off('click', '.btn-cotizar-card').on('click', '.btn-cotizar-card', function () {
    const nombre = $(this).data('nombre');
    const precio = parseFloat($(this).data('precio')) || 180;
    APP_STATE.productoCalculador = { nombre, precio };
    $('#nombreProductoCalc').text(`${nombre} (${precio} BOB/caja)`);
    const cant = parseInt($('#hrs').val(), 10) || 1;
    $('#total').text(cant * precio);
    mostrarToast(`Seleccionado: ${nombre}`);
    logEvent('COTIZADOR_SELECCION', `${nombre} (${precio} BOB)`);
    document.getElementById('calculador').scrollIntoView({ behavior: 'smooth' });
  });

  // Filtro en Cascada de 3 Niveles
  $('#cascadaEspecialidad').off('change').on('change', function () {
    const esp = $(this).val();
    const $plano = $('#cascadaPlano');
    $plano.empty().append('<option value="">-- Seleccionar Plano Tisular --</option>');
    $('#resultadoCascada').hide();

    if (esp && DATOS_CASCADA[esp]) {
      DATOS_CASCADA[esp].planos.forEach(p => {
        const $opt = $('<option>').val(p.id).text(p.label).data('sutura', p.sutura);
        $plano.append($opt);
      });
      $plano.prop('disabled', false);
      logEvent('CASCADA_NIVEL_1', `Especialidad: ${esp}`);
    } else {
      $plano.prop('disabled', true);
    }
  });

  $('#cascadaPlano').off('change').on('change', function () {
    const sutura = $(this).find(':selected').data('sutura');
    if (sutura) {
      $('#textoRecomendacion').text(sutura);
      $('#resultadoCascada').fadeIn();
      logEvent('CASCADA_NIVEL_2', `Recomendación: ${sutura}`);
    } else {
      $('#resultadoCascada').hide();
    }
  });

  // Calculador en vivo
  $('#hrs').off('input').on('input', function () {
    let cant = parseInt($(this).val(), 10) || 1;
    if (cant < 1) {
      cant = 1;
      $(this).val(1);
    }
    $('#total').text(cant * APP_STATE.productoCalculador.precio);
  });

  // Modal Oferta Flash 30s
  $('#btnModal').off('click').on('click', function () {
    const cant = parseInt($('#hrs').val(), 10) || 1;
    const total = cant * APP_STATE.productoCalculador.precio;
    $('#modalProdNombre').text(APP_STATE.productoCalculador.nombre);
    $('#modalCantidad').text(cant);
    $('#modalMonto').text(`${total} BOB`);
    iniciarTemporizadorModal();
    $('#modalCotizacion').fadeIn(200).css('display', 'flex');
  });

  $('#cancelModalBtn').off('click').on('click', function () {
    detenerTemporizador();
    $('#modalCotizacion').fadeOut(200);
  });

  $('#confirmOrderBtn').off('click').on('click', function () {
    detenerTemporizador();
    $('#modalCotizacion').fadeOut(200);
    const prod = $('#modalProdNombre').text();
    const cant = $('#modalCantidad').text();
    mostrarToast(`✅ Cotización confirmada: ${cant}x ${prod}`);
    logEvent('COMPRA_FLASH', `Confirmada: ${cant}x ${prod}`);
  });

  // Reserva de Quirófano Anti-XSS (.text())
  $('#formReserva').off('submit').on('submit', function (e) {
    e.preventDefault();
    const nombre = $('#clienteNombre').val().trim();
    const sala = $('#salaSelect').val();
    if (!nombre) return;

    const $item = $('<li>').addClass('item-reserva');
    const $strong = $('<strong>').text(`${nombre} — `);
    const $span = $('<span>').text(sala);
    $item.append($strong, $span);
    $('#listaReservas').prepend($item);

    this.reset();
    mostrarToast('🛡️ Reserva registrada de forma segura (Anti-XSS).');
    logEvent('RESERVA_ANTI_XSS', `Turno seguro: ${nombre} → ${sala}`);
  });

  $('#btnTestXSS').off('click').on('click', function () {
    $('#clienteNombre').val("<script>alert('XSS!')</script>");
    $('#formReserva').submit();
  });

  // Cola Quirúrgica Táctil (>= 44px + truncado seguro + .text())
  $('#btnPedirSutura').off('click').on('click', function () {
    const txt = $('#inputSutura').val().trim();
    if (!txt) return;

    const $fila = $('<div>').addClass('fila-sutura');
    const $tit = $('<span>').addClass('titulo-truncado').text(txt);
    const $acc = $('<div>').addClass('cola-actions');
    $acc.append(
      $('<button>').attr({ type: 'button', title: 'Despachar' }).addClass('btn-tactil btn-despachar').text('✓'),
      $('<button>').attr({ type: 'button', title: 'Eliminar' }).addClass('btn-tactil btn-quitar').text('✕')
    );
    $fila.append($tit, $acc);
    $('#listaSuturas').prepend($fila);
    $('#inputSutura').val('');
    mostrarToast('📋 Insumo añadido a la cola.');
    logEvent('COLA_AGREGAR', txt);
  });

  $('#listaSuturas').off('click', '.btn-despachar').on('click', '.btn-despachar', function () {
    const $fila = $(this).closest('.fila-sutura');
    const nombre = $fila.find('.titulo-truncado').text();
    $fila.fadeOut(200, function () { $(this).remove(); });
    mostrarToast(`🚀 Despachado: ${nombre}`);
    logEvent('COLA_DESPACHO', nombre);
  });

  $('#listaSuturas').off('click', '.btn-quitar').on('click', '.btn-quitar', function () {
    const $fila = $(this).closest('.fila-sutura');
    $fila.fadeOut(200, function () { $(this).remove(); });
    mostrarToast('🗑️ Retirado de la cola.');
  });

  // Limpiar Bitácora
  $('#btnLimpiarLog').off('click').on('click', function () {
    $('#logOutput').empty().append($('<div>').addClass('log-item').text('[Sistema] Bitácora reiniciada.'));
  });

  // Formulario de Contacto Validado (sin .html() con input de usuario)
  $('#contactForm').off('submit').on('submit', function (e) {
    e.preventDefault();
    const doc = $('#doctorNombre').val().trim();
    const esp = $('#especialidadSelect').val();
    if (!doc) return;

    const $box = $('#alertaBox').empty();
    const $alert = $('<div>').addClass('msg-exito');
    $alert.append(
      document.createTextNode('✅ Solicitud enviada con éxito para '),
      $('<strong>').text(doc),
      document.createTextNode(` (${esp}).`)
    );
    $box.append($alert);
    this.reset();
    logEvent('CONTACTO_SUBMIT', `Solicitud de ${doc} (${esp})`);
  });
});

// ==============================================================================
// 5. TEMPORIZADOR MODAL 30s, BITÁCORA SEGURA Y TOAST
// ==============================================================================
function iniciarTemporizadorModal() {
  detenerTemporizador();
  APP_STATE.segundosRestantes = 30;
  actualizarTextoTimer();

  APP_STATE.temporizadorModal = setInterval(() => {
    APP_STATE.segundosRestantes--;
    actualizarTextoTimer();
    if (APP_STATE.segundosRestantes <= 0) {
      detenerTemporizador();
      $('#modalCotizacion').fadeOut(250);
      mostrarToast('⚠️ Tarifa Flash Expirada (30s).');
      logEvent('TARIFA_EXPIRADA', 'El temporizador de 30s concluyó sin confirmación');
    }
  }, 1000);
}

function detenerTemporizador() {
  if (APP_STATE.temporizadorModal) {
    clearInterval(APP_STATE.temporizadorModal);
    APP_STATE.temporizadorModal = null;
  }
}

function actualizarTextoTimer() {
  const s = APP_STATE.segundosRestantes;
  $('#temporizadorVisual').text(`00:${s < 10 ? '0' + s : s}s`);
}

function logEvent(tipo, mensaje) {
  const $log = $('#logOutput');
  if (!$log.length) return;
  const hora = new Date().toLocaleTimeString();
  const $row = $('<div>').addClass('log-item');
  $row.append(
    $('<strong>').text(`[${hora}] ${tipo}: `),
    document.createTextNode(mensaje)
  );
  $log.prepend($row);
}

function mostrarToast(mensaje) {
  const $t = $('#toastAlert');
  $t.text(mensaje);
  $t.stop(true, true).slideDown(250).delay(3000).fadeOut(350);
}
