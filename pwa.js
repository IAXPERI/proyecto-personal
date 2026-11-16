/**
 * ==============================================================================
 * MATERMED - PWA QUIRÚRGICA CERO-SCROLL UNIFICADA (pwa.js)
 * Diseño Web II (SIS-0141) • UPDS 2026 • Ing. Miguel Angel Cruz Ramos
 * 
 * Funcionalidades Móviles:
 * 1. Service Worker Cache Storage v5 & Detector de Conexión Offline.
 * 2. Cero-Scroll (100dvh) con navegación por Pestañas Táctiles (>= 44px).
 * 3. 3 Roles Móviles: Médico, Trabajador, Admin con cambio de 1 clic.
 * 4. Catálogo Asíncrono Fetch (15 suturas) & Cascada en Teléfono.
 * 5. Control de Quirófanos, Cola Insumos, Stock de 2,983 Cajas y Anti-XSS.
 * ==============================================================================
 */

// Estado de la PWA
const PWA_STATE = {
  currentRole: 'medico',
  stockTotal: 2983,
  suturasCatalogo: [],
  suturaSeleccionada: {
    nombre: 'Poliglactina 910',
    precio: 180,
    img: 'images/poliglactina.svg'
  },
  cajasCotizar: 1,
  timerModal: null,
  segundosRestantes: 30,
  stockItems: [
    { id: 'poliglactina', nombre: 'Poliglactina 910', calibre: '2-0', stock: 750, precio: 180 },
    { id: 'nylon', nombre: 'Nylon Quirúrgico', calibre: '3-0', stock: 680, precio: 140 },
    { id: 'seda', nombre: 'Seda Quirúrgica', calibre: '1-0', stock: 520, precio: 130 },
    { id: 'polipropileno', nombre: 'Polipropileno Prolene', calibre: '5-0', stock: 413, precio: 210 },
    { id: 'catgut', nombre: 'Catgut Crómico', calibre: '0', stock: 340, precio: 160 },
    { id: 'pds', nombre: 'Polidioxanona PDS', calibre: '2-0', stock: 280, precio: 230 }
  ]
};

// Cascada Móvil
const PWA_CASCADA = {
  cardio: {
    planos: [
      { id: 'vasos', label: 'Vasos y Arterias', sutura: 'Polipropileno (Prolene) 5-0 vascular' },
      { id: 'pericardio', label: 'Pericardio', sutura: 'Poliglactina 910 o PDS' }
    ]
  },
  plastica: {
    planos: [
      { id: 'subdermico', label: 'Subdérmico Facial', sutura: 'Poliglactina 910 4-0 aguja fina' },
      { id: 'cutaneo', label: 'Cierre Cutáneo Piel', sutura: 'Nylon Quirúrgico 5-0 monofilamento' }
    ]
  },
  general: {
    planos: [
      { id: 'fascia', label: 'Aponeurosis / Fascia', sutura: 'Polidioxanona (PDS) o Poliglactina 1' },
      { id: 'gastro', label: 'Tracto Digestivo', sutura: 'Seda 3-0 o Catgut Crómico 2-0' }
    ]
  },
  ginecologia: {
    planos: [
      { id: 'cesarea', label: 'Cierre Uterino (Cesárea)', sutura: 'Catgut Crómico 1 o Poliglactina 1' },
      { id: 'episiotomia', label: 'Mucosa Vaginal', sutura: 'Catgut Crómico 2-0' }
    ]
  }
};

// 1. Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('[SW PWA UNIFICADA] Registrado con éxito:', reg.scope);
      })
      .catch(err => {
        console.error('[SW PWA UNIFICADA] Error de registro:', err);
      });
  });
}

// 2. Detector de Conexión
function actualizarRed() {
  const $net = $('#estadoRed');
  if (navigator.onLine) {
    $net.text('🟢 En Línea').removeClass('offline');
  } else {
    $net.text('🟠 Offline Activo').addClass('offline');
  }
}
$(window).on('online offline', actualizarRed);

// ==============================================================================
// 3. INICIALIZACIÓN Y CONTROLADORES JQUERY
// ==============================================================================
$(document).ready(function() {
  actualizarRed();

  // Cargar rol desde localStorage o por defecto 'medico'
  const rolInicial = localStorage.getItem('matermed_role') || localStorage.getItem('matermed_rol') || 'medico';
  aplicarRolPwa(rolInicial);

  // Hidratación del botón PWA (Semana 2)
  $('#btnPWA').off('click').on('click', function() {
    const $box = $('#contenedorMenu');
    $box.attr('data-hidratado', 'true');
    $(this).text('✓ SW Activo');
    mostrarToastPwa('⚡ Service Worker v6 hidratado y listo Offline.');
  });

  // Modo Oscuro / Claro
  $('#themeToggleBtn').off('click').on('click', function() {
    $('body').toggleClass('light-mode');
    $(this).text($('body').hasClass('light-mode') ? '☀️' : '🌙');
  });

  // Navegación por pestañas (Cero-Scroll)
  $('.tab-btn').off('click').on('click', function() {
    const target = $(this).data('target');
    cambiarPestanaPwa(target);
  });

  // Modal de Roles en PWA
  $('#btnOpenRoleModal, #hudProfileBtn').off('click').on('click', function() {
    $('#pwaRoleModal').fadeIn(150).css('display', 'flex');
  });

  $('#pwaBtnCerrarLogin').off('click').on('click', function() {
    $('#pwaRoleModal').fadeOut(150);
  });

  $('.btn-pwa-login-choice').off('click').on('click', function() {
    const rol = $(this).data('rol');
    aplicarRolPwa(rol);
    $('#pwaRoleModal').fadeOut(150);
  });

  $('.btn-quick-pwa').off('click').on('click', function() {
    const rol = $(this).data('pwa-role');
    aplicarRolPwa(rol);
  });

  // Cargar Catálogo Asíncrono de 15 Suturas
  cargarCatalogoFetch();

  // Cascada Móvil
  $('#pwaCascadaEsp').off('change').on('change', function() {
    const esp = $(this).val();
    const $plano = $('#pwaCascadaPlano');
    $plano.empty().append('<option value="">2. Plano Tisular</option>');
    $('#pwaCascadaRes').hide();

    if (esp && PWA_CASCADA[esp]) {
      PWA_CASCADA[esp].planos.forEach(p => {
        $plano.append(`<option value="${p.id}" data-sutura="${p.sutura}">${p.label}</option>`);
      });
      $plano.prop('disabled', false);
    } else {
      $plano.prop('disabled', true);
    }
  });

  $('#pwaCascadaPlano').off('change').on('change', function() {
    const sutura = $(this).find(':selected').data('sutura');
    if (sutura) {
      $('#pwaCascadaRes').empty()
        .append($('<strong>').text('Recomendación: '), document.createTextNode(sutura))
        .fadeIn();
    } else {
      $('#pwaCascadaRes').hide();
    }
  });

  // Calculador Móvil con Áreas Táctiles 44px
  $('#btnSumarCaja').off('click').on('click', function() {
    PWA_STATE.cajasCotizar++;
    actualizarCalculadorPwa();
  });

  $('#btnRestarCaja').off('click').on('click', function() {
    if (PWA_STATE.cajasCotizar > 1) {
      PWA_STATE.cajasCotizar--;
      actualizarCalculadorPwa();
    }
  });

  $('#btnCotizarHero').off('click').on('click', function() {
    cambiarPestanaPwa('pane-calculador');
  });

  // Modal Oferta Flash 30s
  $('#btnAbrirModal30s').off('click').on('click', function() {
    $('#pwaModalSutura').text(PWA_STATE.suturaSeleccionada.nombre);
    $('#pwaModalCajas').text(PWA_STATE.cajasCotizar);
    $('#pwaModalTotal').text((PWA_STATE.cajasCotizar * PWA_STATE.suturaSeleccionada.precio) + ' BOB');

    iniciarTimerPwa();
    $('#pwaModal30s').fadeIn(150).css('display', 'flex');
  });

  $('#pwaBtnCancelarFlash').off('click').on('click', function() {
    detenerTimerPwa();
    $('#pwaModal30s').fadeOut(150);
  });

  $('#pwaBtnConfirmarFlash').off('click').on('click', function() {
    detenerTimerPwa();
    $('#pwaModal30s').fadeOut(150);
    mostrarToastPwa(`✅ Cotización confirmada: ${PWA_STATE.cajasCotizar} cajas`);
  });

  // Rol Trabajador: Alternar Quirófanos
  $('.btn-pwa-sala-toggle').off('click').on('click', function() {
    const sala = $(this).data('sala');
    const $tag = $(`#pwaTagSala${sala}`);

    if ($tag.hasClass('qui-libre')) {
      $tag.removeClass('qui-libre').addClass('qui-ocupado').text('En Cirugía');
    } else if ($tag.hasClass('qui-ocupado')) {
      $tag.removeClass('qui-ocupado').addClass('qui-limpieza').text('Esterilización');
    } else {
      $tag.removeClass('qui-limpieza').addClass('qui-libre').text('Disponible');
    }
    mostrarToastPwa(`Quirófano ${sala}: ${$tag.text()}`);
  });

  // Cola Insumos Móvil con Áreas Táctiles 44px
  $('#pwaBtnAgregarCola').off('click').on('click', function() {
    const txt = $('#pwaInputCola').val().trim();
    if (!txt) return;

    const $item = $('<div>').addClass('pwa-list-item');
    const $titulo = $('<span>').addClass('titulo-truncado').text(txt); // Sanitización con .text()
    const $acciones = $('<div>').css({ display: 'flex', gap: '8px', flexShrink: 0 }).append(
      $('<button>').addClass('btn-tactil-pwa btn-pwa-despachar').css({ background: 'var(--success)', color: '#fff' }).text('✓'),
      $('<button>').addClass('btn-tactil-pwa btn-pwa-quitar').css({ background: '#fee2e2', color: '#dc2626' }).text('✕')
    );
    $item.append($titulo, $acciones);
    $('#pwaColaContainer').prepend($item);
    $('#pwaInputCola').val('');
    mostrarToastPwa('📋 Añadido a la cola quirúrgica.');
  });

  $('#pwaColaContainer').off('click', '.btn-pwa-despachar').on('click', '.btn-pwa-despachar', function() {
    $(this).closest('.pwa-list-item').fadeOut(200, function() { $(this).remove(); });
    mostrarToastPwa('🚀 Insumo despachado a sala.');
  });

  $('#pwaColaContainer').off('click', '.btn-pwa-quitar').on('click', '.btn-pwa-quitar', function() {
    $(this).closest('.pwa-list-item').fadeOut(200, function() { $(this).remove(); });
    mostrarToastPwa('🗑️ Eliminado de la cola.');
  });

  // Rol Administrador: Renderizar Stock en PWA
  renderizarStockPwa();

  $('#pwaStockGrid').off('click', '.btn-pwa-stock-adj').on('click', '.btn-pwa-stock-adj', function() {
    const id = $(this).data('id');
    const delta = parseInt($(this).data('delta'));
    ajustarStockPwa(id, delta);
  });

  // Rol Seguridad: Formulario Anti-XSS en PWA
  $('#pwaFormReserva').off('submit').on('submit', function(e) {
    e.preventDefault();
    const doc = $('#pwaInputCirujano').val().trim();
    const sala = $('#pwaSelectSala').val();
    if (!doc) return;

    // Comprobación de ataque XSS (sanitizado con .text())
    if (/<script|onerror|onload/i.test(doc)) {
      $('#pwaLogXss').prepend($('<div>').text(`[XSS NEUTRALIZADO] Payload: ${doc}`));
    }

    // Sanitización estricta con .text()
    const $item = $('<div>').addClass('pwa-list-item').css('font-size', '11px');
    const $strong = $('<strong>').text(doc + ' — ');
    const $span = $('<span>').text(sala);

    $item.append($strong, $span);
    $('#pwaListaReservas').prepend($item);

    this.reset();
    mostrarToastPwa('🛡️ Turno registrado de forma segura.');
  });

  $('#pwaBtnTestXss').off('click').on('click', function() {
    $('#pwaInputCirujano').val("<script>alert('XSS Móvil!')</script>");
    $('#pwaFormReserva').submit();
  });

});

// ==============================================================================
// FUNCIONES AUXILIARES PWA
// ==============================================================================
function aplicarRolPwa(rol) {
  PWA_STATE.currentRole = rol;
  localStorage.setItem('matermed_role', rol);
  localStorage.setItem('matermed_rol', rol);

  if (rol === 'medico') {
    $('#hudAvatar').text('👨‍⚕️');
    $('#hudUserName').text('Dr. Cirujano');
    $('#hudUserRole').text('MÉDICO');
  } else if (rol === 'trabajador') {
    $('#hudAvatar').text('🩺');
    $('#hudUserName').text('Lic. Quirófano');
    $('#hudUserRole').text('TRABAJADOR');
  } else if (rol === 'admin') {
    $('#hudAvatar').text('🛡️');
    $('#hudUserName').text('Dir. MATERMED');
    $('#hudUserRole').text('ADMIN');
  }

  mostrarToastPwa(`Perfil activo: ${$('#hudUserRole').text()}`);
}

function cambiarPestanaPwa(targetId) {
  $('.view-pane').removeClass('active');
  $(`#${targetId}`).addClass('active');

  $('.tab-btn').removeClass('active');
  $(`.tab-btn[data-target="${targetId}"]`).addClass('active');
}

function cargarCatalogoFetch() {
  fetch('data/suturas.json')
    .then(res => {
      if (!res.ok) throw new Error('Error al leer suturas.json');
      return res.json();
    })
    .then(data => {
      PWA_STATE.suturasCatalogo = data;
      renderizarCatalogoPwa(data);
    })
    .catch(err => {
      console.warn('[SW Offline]: Catálogo cargado desde memoria local');
      renderizarCatalogoPwa(PWA_STATE.stockItems.map((item, idx) => ({
        id: idx + 1,
        titulo: item.nombre,
        calibre: item.calibre,
        precio: item.precio,
        portada: `images/${item.id}.svg`,
        genero: 'Sutura'
      })));
    });
}

function renderizarCatalogoPwa(lista) {
  const $grid = $('#asyncCatalogGrid');
  $grid.empty();

  lista.forEach(item => {
    const $card = $('<div>')
      .addClass('sutura-mini-card')
      .data({ nombre: item.titulo, precio: item.precio, img: item.portada });

    const $row = $('<div>').css({ display: 'flex', gap: '8px', alignItems: 'center' });
    const $img = $('<img>').attr({
      src: item.portada,
      alt: item.titulo,
      loading: 'lazy'
    }).addClass('mini-thumb');

    const $info = $('<div>').addClass('mini-info').append(
      $('<h5>').text(item.titulo),
      $('<small>').text(item.calibre || 'USP 2-0'),
      $('<div>').css({ color: 'var(--accent)', fontWeight: '800', fontSize: '11px' }).text(`${item.precio} BOB`)
    );

    $row.append($img, $info);
    const $btn = $('<button>').addClass('btn-add-mini').text('+ Cotizar');
    $card.append($row, $btn);
    $grid.append($card);
  });

  $grid.off('click', '.btn-add-mini').on('click', '.btn-add-mini', function() {
    const card = $(this).closest('.sutura-mini-card');
    const nom = card.data('nombre');
    const precio = parseFloat(card.data('precio')) || 180;
    const img = card.data('img');

    PWA_STATE.suturaSeleccionada = { nombre: nom, precio: precio, img: img };
    PWA_STATE.cajasCotizar = 1;
    actualizarCalculadorPwa();
    cambiarPestanaPwa('pane-calculador');
    mostrarToastPwa(`Cotizando: ${nom}`);
  });
}

function actualizarCalculadorPwa() {
  $('#calcSuturaNombre').text(PWA_STATE.suturaSeleccionada.nombre);
  $('#calcSuturaPrecio').text(`${PWA_STATE.suturaSeleccionada.precio} BOB / caja`);
  $('#cantCajasDisplay').text(PWA_STATE.cajasCotizar);

  const total = PWA_STATE.cajasCotizar * PWA_STATE.suturaSeleccionada.precio;
  $('#totalPwaDisplay').text(total);
  $('#hudTotal').text(total);
}

function renderizarStockPwa() {
  const $grid = $('#pwaStockGrid');
  $grid.empty();

  let suma = 0;
  PWA_STATE.stockItems.forEach(s => {
    suma += s.stock;
    const card = `
      <div class="stock-pwa-card">
        <div>
          <h5>${s.nombre}</h5>
          <small style="color: var(--text-muted); font-size: 9px;">${s.calibre}</small>
          <div class="stock-pwa-val" id="pwaStockVal-${s.id}">${s.stock.toLocaleString()} cajas</div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 6px;">
          <button class="btn-tactil-pwa btn-pwa-stock-adj" data-id="${s.id}" data-delta="-5" style="background: var(--bg-panel); color: #fff; font-size: 12px;">-5</button>
          <button class="btn-tactil-pwa btn-pwa-stock-adj" data-id="${s.id}" data-delta="5" style="background: var(--primary); color: #fff; font-size: 12px;">+5</button>
        </div>
      </div>
    `;
    $grid.append(card);
  });

  PWA_STATE.stockTotal = suma;
  $('#hudStock').text(suma.toLocaleString());
}

function ajustarStockPwa(id, delta) {
  const item = PWA_STATE.stockItems.find(s => s.id === id);
  if (!item) return;

  item.stock = Math.max(0, item.stock + delta);
  $(`#pwaStockVal-${id}`).text(`${item.stock.toLocaleString()} cajas`);

  const nuevoTotal = PWA_STATE.stockItems.reduce((acc, curr) => acc + curr.stock, 0);
  PWA_STATE.stockTotal = nuevoTotal;
  $('#hudStock').text(nuevoTotal.toLocaleString());

  mostrarToastPwa(`${item.nombre}: ${item.stock} cajas`);
}

function iniciarTimerPwa() {
  detenerTimerPwa();
  PWA_STATE.segundosRestantes = 30;
  actualizarVisualTimerPwa();

  PWA_STATE.timerModal = setInterval(() => {
    PWA_STATE.segundosRestantes--;
    actualizarVisualTimerPwa();

    if (PWA_STATE.segundosRestantes <= 0) {
      detenerTimerPwa();
      $('#pwaModal30s').fadeOut(150);
      alert('⚠️ Tarifa Quirúrgica Expirada: Los 30 segundos concluyeron.');
    }
  }, 1000);
}

function detenerTimerPwa() {
  if (PWA_STATE.timerModal) {
    clearInterval(PWA_STATE.timerModal);
    PWA_STATE.timerModal = null;
  }
}

function actualizarVisualTimerPwa() {
  const s = PWA_STATE.segundosRestantes;
  const str = s < 10 ? `0${s}` : s;
  $('#pwaTimerVisual').text(`00:${str}s`);
}

function mostrarToastPwa(msg) {
  const $t = $('#pwaToast');
  $t.text(msg);
  $t.stop(true, true).fadeIn(200).delay(2500).fadeOut(300);
}
