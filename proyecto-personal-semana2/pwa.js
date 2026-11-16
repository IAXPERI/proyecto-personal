/**
 * ==============================================================================
 * MATERMED - PWA QUIRÚRGICA CERO-SCROLL | LÓGICA MÓVIL (pwa.js)
 * Diseño Web II (SIS-0141) • UPDS 2026 • Ing. Miguel Angel Cruz Ramos
 * ==============================================================================
 */

let suturasData = [];
let productoSeleccionado = {
  nombre: 'Poliglactina 910',
  precio: 180,
  img: 'images/poliglactina.svg'
};

let timerModalInterval = null;
let segundosRestantes = 30;

// 1. Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log('[SW MATERMED PWA] Registrado con éxito en ámbito:', reg.scope);
      })
      .catch(err => {
        console.error('[SW MATERMED PWA] Error en registro:', err);
      });
  });
}

// 2. Detector de Red
function actualizarEstadoRed() {
  const $net = $('#estadoRed');
  if (navigator.onLine) {
    $net
      .text('🟢 En Línea')
      .removeClass('offline')
      .css('background', '#dcfce7')
      .css('color', '#15803d');
  } else {
    $net
      .text('🟠 Modo Offline Activo')
      .addClass('offline')
      .css('background', '#ffedd5')
      .css('color', '#c2410c');
  }
}
$(window).on('online offline', actualizarEstadoRed);

// 3. Inicialización jQuery
$(document).ready(function() {

  actualizarEstadoRed();

  // Alternador de Modo Claro / Oscuro
  $('#themeToggleBtn').off('click').on('click', function() {
    $('body').toggleClass('light-mode');
    $(this).text($('body').hasClass('light-mode') ? '☀️' : '🌙');
  });

  // Navegación por Pestañas (Cero Scroll)
  $('.tab-btn').off('click').on('click', function() {
    const target = $(this).data('target');
    cambiarPestana(target);
  });

  // Simulación de Hidratación SSR
  function hidratarInterfaz() {
    let $box = $('#contenedorMenu');
    if ($box.attr('data-hidratado') === 'true') return;

    $('#btnPWA')
      .text('⚡ Hidratado')
      .off('click')
      .on('click', function() {
        mostrarToast('⚡ Interfaz conectada dinámicamente al DOM.');
      });

    $box.attr('data-hidratado', 'true');
    console.log('[SSR] Interfaz hidratada progresivamente sin redibujar DOM.');
  }
  setTimeout(hidratarInterfaz, 500);

  // Consumo Asíncrono Fetch API de las 15 suturas
  cargarRepertorioSuturas();

  function cargarRepertorioSuturas() {
    fetch('data/suturas.json')
      .then(res => {
        if (!res.ok) throw new Error('Fallo al cargar catálogo asíncrono.');
        return res.json();
      })
      .then(data => {
        suturasData = data;
        renderizarCatalogo(data);
      })
      .catch(err => {
        console.error('[Error de Catálogo]:', err);
        $('#asyncCatalogGrid').html('<p style="color:#ef4444; font-size:12px;">⚠️ No se pudo cargar el catálogo. Modo Offline activado.</p>');
      });
  }

  function renderizarCatalogo(lista) {
    let html = '';
    lista.forEach(item => {
      html += `
        <div class="sutura-mini-card" data-id="${item.id}" data-precio="${item.precio}" data-nombre="${item.titulo}" data-img="${item.portada}">
          <div class="mini-row">
            <img src="${item.portada}" alt="${item.titulo}" loading="lazy" width="48" height="48" class="mini-thumb">
            <div class="mini-info">
              <h5>${item.titulo}</h5>
              <small>${item.calibre} • ${item.genero}</small>
              <span style="font-size: 11px; font-weight: 800; color: #38bdf8; display: block; margin-top: 2px;">
                ${item.precio} BOB
              </span>
            </div>
          </div>
          <button class="btn-add-mini">+ Cotizar</button>
        </div>
      `;
    });
    $('#asyncCatalogGrid').html(html);
  }

  // Búsqueda en tiempo real
  $('#catalogSearch').on('input', function() {
    const query = $(this).val().toLowerCase().trim();
    const filtrados = suturasData.filter(s => 
      s.titulo.toLowerCase().includes(query) ||
      s.calibre.toLowerCase().includes(query) ||
      s.genero.toLowerCase().includes(query) ||
      s.aguja.toLowerCase().includes(query)
    );
    renderizarCatalogo(filtrados);
  });

  // Delegación .off().on() para evitar fugas de memoria
  $('#asyncCatalogGrid').off('click', '.btn-add-mini').on('click', '.btn-add-mini', function() {
    const $card = $(this).closest('.sutura-mini-card');
    const nombre = $card.data('nombre');
    const precio = parseInt($card.data('precio')) || 180;
    const img = $card.data('img') || 'images/poliglactina.svg';

    irACalculador(nombre, precio, img);
    mostrarToast(`✅ ${nombre} seleccionada para cotización.`);
  });

  // Filtro Dinámico de 3 Capas en Cascada
  const mapaPlano = {
    'cirugia-general': [
      { val: 'aponeurosis', label: 'Cierre de Aponeurosis Abdominal' },
      { val: 'gastro', label: 'Anastomosis Intestinal' },
      { val: 'subcutaneo', label: 'Tejido Celular Subcutáneo' }
    ],
    'cardiovascular': [
      { val: 'coronaria', label: 'Anastomosis Coronaria / Bypass' },
      { val: 'esternon', label: 'Cierre de Esternotomía' },
      { val: 'vascular-p', label: 'Vasos Periféricos' }
    ],
    'plastica': [
      { val: 'intradermico', label: 'Cierre Intradérmico Cosmético' },
      { val: 'facial', label: 'Cirugía Reconstructiva Facial' }
    ],
    'traumatologia': [
      { val: 'tendon', label: 'Reparación de Tendones' },
      { val: 'piel-tension', label: 'Cierre Cutáneo de Tensión' }
    ],
    'ginecologia': [
      { val: 'episiotomia', label: 'Episiotomía y Desgarros' },
      { val: 'utero', label: 'Cierre de Histerotomía / Cesárea' }
    ]
  };

  const mapaResultado = {
    'aponeurosis': '📌 <strong>Recomendación:</strong> Polidioxanona (PDS) Calibre USP 1 con aguja cortante de 36 mm (resistencia prolongada de 6 semanas).',
    'gastro': '📌 <strong>Recomendación:</strong> Seda Negra Trenzada 2-0 o Poliglactina 910 3-0 con aguja ahusada atraumática.',
    'subcutaneo': '📌 <strong>Recomendación:</strong> Catgut Simple 3-0 o Poliglactina 910 3-0 de absorción controlada.',
    'coronaria': '📌 <strong>Recomendación:</strong> Polipropileno Cardiovascular (Prolene) USP 6-0 o 7-0 con doble aguja cilíndrica BV-1.',
    'esternon': '📌 <strong>Recomendación:</strong> Alambre de Acero Inoxidable Quirúrgico 316L Calibre USP 5.',
    'vascular-p': '📌 <strong>Recomendación:</strong> Polipropileno Prolene 5-0 BV-1 de superficie de arrastre nula.',
    'intradermico': '📌 <strong>Recomendación:</strong> Poliglecaprone 25 (Monocryl) USP 3-0 o 4-0 con aguja cortante reverso.',
    'facial': '📌 <strong>Recomendación:</strong> Nylon Monofilamento USP 5-0 o 6-0 para mínima reactividad tisular.',
    'tendon': '📌 <strong>Recomendación:</strong> Poliéster Trenzado Siliconado USP 2 de alta fuerza mecánica.',
    'piel-tension': '📌 <strong>Recomendación:</strong> Nylon Monofilamento USP 2-0 con aguja cortante pesada.',
    'episiotomia': '📌 <strong>Recomendación:</strong> Poliglactina 910 Delicada USP 2-0 o 3-0 con aguja ahusada.',
    'utero': '📌 <strong>Recomendación:</strong> Catgut Crómico 0 o Poliglactina 910 calibre 1.'
  };

  $('#capa1').off('change').on('change', function() {
    const esp = $(this).val();
    const $c2 = $('#capa2');
    $c2.html('<option value="">-- Seleccione Plano Tisular --</option>');

    if (esp && mapaPlano[esp]) {
      $c2.prop('disabled', false);
      mapaPlano[esp].forEach(op => {
        $c2.append(`<option value="${op.val}">${op.label}</option>`);
      });
      $('#resultadoFiltro').html('<em>Capa 2 activa: Seleccione la estructura anatómica...</em>');
    } else {
      $c2.prop('disabled', true);
      $('#resultadoFiltro').text('Capa 3: Seleccione las capas anteriores para ver la recomendación...');
    }
  });

  $('#capa2').off('change').on('change', function() {
    const plano = $(this).val();
    if (plano && mapaResultado[plano]) {
      $('#resultadoFiltro').html(mapaResultado[plano]);
    } else {
      $('#resultadoFiltro').text('Capa 3: Seleccione una estructura válida en la Capa 2...');
    }
  });

  // Selector temático
  $('.btn-theme-selector').off('click').on('click', function() {
    const tema = $(this).data('theme');
    if (tema === 'absorbible') {
      $('#featuredTitle').text('Poliglactina 910 (Absorbible)');
      $('#featuredImg').attr('src', 'images/poliglactina.svg');
      irACalculador('Poliglactina 910', 180, 'images/poliglactina.svg');
      mostrarToast('🟣 Línea Absorbible activada');
    } else if (tema === 'no-absorbible') {
      $('#featuredTitle').text('Nylon Monofilamento (No Absorbible)');
      $('#featuredImg').attr('src', 'images/nylon.svg');
      irACalculador('Nylon Monofilamento', 120, 'images/nylon.svg');
      mostrarToast('🟢 Línea No Absorbible activada');
    } else if (tema === 'cardio') {
      $('#featuredTitle').text('Polipropileno Prolene (Cardiovascular)');
      $('#featuredImg').attr('src', 'images/polipropileno.svg');
      irACalculador('Polipropileno Prolene', 210, 'images/polipropileno.svg');
      mostrarToast('🔵 Línea Cardiovascular activada');
    }
  });

  // Stepper de cajas
  $('#btnMinus').off('click').on('click', function() {
    let val = parseInt($('#boxQty').val()) || 1;
    if (val > 1) {
      $('#boxQty').val(val - 1).trigger('input');
    }
  });

  $('#btnPlus').off('click').on('click', function() {
    let val = parseInt($('#boxQty').val()) || 1;
    if (val < 100) {
      $('#boxQty').val(val + 1).trigger('input');
    }
  });

  $('#boxQty').off('input').on('input', function() {
    let cant = parseInt($(this).val()) || 1;
    if (cant < 1) { cant = 1; $(this).val(1); }
    const total = cant * productoSeleccionado.precio;
    $('#calcTotalLarge').text(total);
    $('#hudTotal').text(total);
  });

  // El Gran Botón Dorado & Modal 30s
  $('#btnLaunchModal').off('click').on('click', function() {
    const cant = parseInt($('#boxQty').val()) || 1;
    const total = cant * productoSeleccionado.precio;

    $('#modalProdTitle').text(productoSeleccionado.nombre);
    $('#modalProdQty').text(cant);
    $('#modalProdTotal').text(total + ' BOB');

    iniciarTemporizadorModal();
    $('#modalCotizacion').fadeIn(200).css('display', 'flex');
  });

  $('#closeModalBtn, #cancelModalBtn').off('click').on('click', function() {
    cerrarModal();
  });

  $('#confirmOrderBtn').off('click').on('click', function() {
    detenerTemporizador();
    $('#modalCotizacion').fadeOut(200);

    const cant = parseInt($('#modalProdQty').text()) || 1;
    let stockActual = parseInt($('#hudStock').text().replace(',', '')) || 2983;
    stockActual -= cant;
    $('#hudStock').text(stockActual.toLocaleString());

    mostrarToast(`🎉 ¡Pedido Confirmado de ${cant} caja(s)!`);
  });

  // Validación Formulario
  $('#pwaForm').off('submit').on('submit', function(e) {
    e.preventDefault();
    let valido = true;

    const nombre = $('#nombreInput').val().trim();
    const correo = $('#correoInput').val().trim();

    if (nombre === '') {
      $('#errNombre').fadeIn();
      valido = false;
    } else {
      $('#errNombre').fadeOut();
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(correo)) {
      $('#errCorreo').fadeIn();
      valido = false;
    } else {
      $('#errCorreo').fadeOut();
    }

    if (valido) {
      $('#successBox').slideDown().delay(3500).slideUp();
      $('#pwaForm')[0].reset();
      mostrarToast(`✅ Solicitud médica registrada para ${nombre}`);
    }
  });

});

function cambiarPestana(paneId) {
  $('.tab-btn').removeClass('active');
  $(`.tab-btn[data-target="${paneId}"]`).addClass('active');

  $('.view-pane').removeClass('active');
  $('#' + paneId).addClass('active');
}

function irACalculador(nombre, precio, img) {
  productoSeleccionado.nombre = nombre;
  productoSeleccionado.precio = precio;
  if (img) productoSeleccionado.img = img;

  $('#calcItemTitle').text(nombre);
  $('#calcItemPrice').text(precio);
  
  const cant = parseInt($('#boxQty').val()) || 1;
  const total = cant * precio;
  $('#calcTotalLarge').text(total);
  $('#hudTotal').text(total);

  cambiarPestana('pane-calculador');
}

function iniciarTemporizadorModal() {
  detenerTemporizador();
  segundosRestantes = 30;
  actualizarTextoTimer();

  timerModalInterval = setInterval(() => {
    segundosRestantes--;
    actualizarTextoTimer();

    if (segundosRestantes <= 0) {
      detenerTemporizador();
      $('#modalCotizacion').fadeOut('slow');
      alert('⚠️ Tarifa Flash Expirada: Los 30 segundos de vigencia de la reserva concluyeron.');
    }
  }, 1000);
}

function detenerTemporizador() {
  if (timerModalInterval) {
    clearInterval(timerModalInterval);
    timerModalInterval = null;
  }
}

function actualizarTextoTimer() {
  const seg = segundosRestantes < 10 ? `0${segundosRestantes}` : segundosRestantes;
  $('#temporizadorVisual').text(`00:${seg}s`);
}

function cerrarModal() {
  detenerTemporizador();
  $('#modalCotizacion').fadeOut(200);
}

function mostrarToast(msg) {
  const $t = $('#toastAlert');
  $t.text(msg);
  $t.stop(true, true).slideDown(250).delay(2800).fadeOut(300);
}
