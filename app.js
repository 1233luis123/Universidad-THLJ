// ===========================
// Variables Globales
// ===========================
let matriculas = [];
let matriculasFiltradas = [];

// ===========================
// Funciones de Almacenamiento
// ===========================
function getMatriculas() {
  try {
    const data = localStorage.getItem("matriculasUV");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error al leer localStorage:", error);
    return [];
  }
}

function saveMatriculas(data) {
  try {
    localStorage.setItem("matriculasUV", JSON.stringify(data));
  } catch (error) {
    console.error("Error al guardar en localStorage:", error);
    showAlert("Error al guardar los datos. Verifique el almacenamiento del navegador.", "danger");
  }
}

// ===========================
// Página Index
// ===========================
if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
  document.addEventListener("DOMContentLoaded", () => {
    const matriculas = getMatriculas();
    const studentsCount = document.getElementById('studentsCount');
    if (studentsCount) {
      animateCounter(studentsCount, matriculas.length);
    }
  });
}

// ===========================
// Página Carreras
// ===========================
if (window.location.pathname.includes('carreras.html')) {
  document.addEventListener("DOMContentLoaded", () => {
    const searchCarrera = document.getElementById('searchCarrera');
    if (searchCarrera) {
      searchCarrera.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.career-card');
        
        cards.forEach(card => {
          const title = card.querySelector('.card-title').textContent.toLowerCase();
          const text = card.querySelector('.card-text').textContent.toLowerCase();
          
          if (title.includes(searchTerm) || text.includes(searchTerm)) {
            card.parentElement.style.display = '';
          } else {
            card.parentElement.style.display = 'none';
          }
        });
      });
    }
  });
}

// ===========================
// Página Matrícula
// ===========================
if (window.location.pathname.includes('matriculas.html')) {
  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("formMatricula");
    
    if (form) {
      const inputs = form.querySelectorAll('input, select');
      inputs.forEach(input => {
        input.addEventListener('change', updateProgressBar);
        input.addEventListener('input', updateProgressBar);
      });

      document.querySelectorAll("input[name='asignaturas']").forEach(chk => {
        chk.addEventListener("change", updateCredits);
      });

      form.addEventListener("submit", handleSubmit);
    }
  });
}

function updateProgressBar() {
  const form = document.getElementById("formMatricula");
  if (!form) return;

  const fields = [
    document.getElementById('nombre')?.value,
    document.getElementById('dni')?.value,
    document.getElementById('email')?.value,
    document.getElementById('telefono')?.value,
    document.getElementById('programa')?.value,
    document.getElementById('ciclo')?.value,
    document.querySelector('input[name="modalidad"]:checked')?.value,
    document.querySelectorAll('input[name="asignaturas"]:checked').length >= 3
  ];

  const completed = fields.filter(field => field).length;
  const percentage = Math.round((completed / fields.length) * 100);
  
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    progressBar.style.width = percentage + '%';
    progressBar.textContent = percentage + '%';
  }
}

function updateCredits() {
  const checkboxes = document.querySelectorAll('input[name="asignaturas"]:checked');
  let totalCredits = 0;
  let totalSubjects = checkboxes.length;

  checkboxes.forEach(chk => {
    const credits = parseInt(chk.value.split("|")[1]);
    totalCredits += credits;
  });

  const creditosElement = document.getElementById('creditosTotales');
  const asignaturasElement = document.getElementById('asignaturasCount');
  const creditosInfo = document.getElementById('creditosInfo');

  if (creditosElement) {
    creditosElement.textContent = `Créditos seleccionados: ${totalCredits}`;
  }

  if (asignaturasElement) {
    asignaturasElement.textContent = `Asignaturas: ${totalSubjects}`;
  }

  if (creditosInfo) {
    if (totalSubjects < 3 || totalSubjects > 7) {
      creditosInfo.classList.remove('alert-success');
      creditosInfo.classList.add('alert-warning');
    } else {
      creditosInfo.classList.remove('alert-warning');
      creditosInfo.classList.add('alert-success');
    }
  }
}

function handleSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  
  if (!form.checkValidity()) {
    e.stopPropagation();
    form.classList.add('was-validated');
    showAlert('Por favor complete todos los campos requeridos.', 'warning');
    return;
  }

  const asignaturas = [...document.querySelectorAll("input[name='asignaturas']:checked")];
  if (asignaturas.length < 3 || asignaturas.length > 7) {
    showAlert("Debe seleccionar entre 3 y 7 asignaturas.", 'warning');
    return;
  }

  const modalidad = document.querySelector("input[name='modalidad']:checked");
  if (!modalidad) {
    showAlert("Debe seleccionar una modalidad de estudio.", 'warning');
    return;
  }

  let totalCreditos = 0;
  const asignaturasSel = asignaturas.map(a => {
    const [nombre, creditos] = a.value.split("|");
    totalCreditos += parseInt(creditos);
    return { nombre, creditos: parseInt(creditos) };
  });

  const matricula = {
    id: Date.now(),
    nombre: document.getElementById("nombre").value,
    dni: document.getElementById("dni").value,
    email: document.getElementById("email").value,
    telefono: document.getElementById("telefono")?.value || "No especificado",
    fechaNacimiento: document.getElementById("fechaNacimiento")?.value || "No especificada",
    programa: document.getElementById("programa").value,
    modalidad: modalidad.value,
    ciclo: document.getElementById("ciclo").value,
    asignaturas: asignaturasSel,
    creditosTotales: totalCreditos,
    fecha: new Date().toLocaleString('es-PE')
  };

  let matriculas = getMatriculas();
  matriculas.push(matricula);
  saveMatriculas(matriculas);

  showSuccessModal(matricula);
  
  form.reset();
  form.classList.remove('was-validated');
  updateCredits();
  updateProgressBar();
}

function showSuccessModal(matricula) {
  const modalHTML = `
    <div class="modal fade" id="modalExito" tabindex="-1" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="fas fa-check-circle me-2"></i>¡Matrícula Exitosa!
            </h5>
          </div>
          <div class="modal-body text-center py-4">
            <div class="mb-4">
              <i class="fas fa-graduation-cap fa-5x text-success"></i>
            </div>
            <h4 class="mb-3">¡Felicitaciones ${matricula.nombre.split(' ')[0]}!</h4>
            <p class="lead">Tu matrícula ha sido registrada exitosamente</p>
            <div class="alert alert-light mt-4">
              <div class="row text-start">
                <div class="col-12 mb-2">
                  <strong><i class="fas fa-book me-2 text-primary"></i>Programa:</strong> ${matricula.programa}
                </div>
                <div class="col-12 mb-2">
                  <strong><i class="fas fa-layer-group me-2 text-primary"></i>Ciclo:</strong> ${matricula.ciclo}
                </div>
                <div class="col-12 mb-2">
                  <strong><i class="fas fa-laptop me-2 text-primary"></i>Modalidad:</strong> ${matricula.modalidad}
                </div>
                <div class="col-12">
                  <strong><i class="fas fa-star me-2 text-primary"></i>Créditos:</strong> ${matricula.creditosTotales}
                </div>
              </div>
            </div>
            <p class="text-muted mt-3">
              <small><i class="fas fa-envelope me-2"></i>Recibirás un correo de confirmación en: <strong>${matricula.email}</strong></small>
            </p>
          </div>
          <div class="modal-footer justify-content-center">
            <button type="button" class="btn btn-success" onclick="irAMatriculados()">
              <i class="fas fa-users me-2"></i>Ver Matriculados
            </button>
            <button type="button" class="btn btn-outline-secondary" onclick="cerrarModalExito()">
              <i class="fas fa-home me-2"></i>Ir al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const oldModal = document.getElementById('modalExito');
  if (oldModal) oldModal.remove();

  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modal = new bootstrap.Modal(document.getElementById('modalExito'));
  modal.show();
}

function irAMatriculados() {
  window.location.href = 'matriculados.html';
}

function cerrarModalExito() {
  window.location.href = 'index.html';
}

// ===========================
// Página Matriculados
// ===========================
if (window.location.pathname.includes('matriculados.html')) {
  document.addEventListener("DOMContentLoaded", () => {
    matriculas = getMatriculas();
    matriculasFiltradas = [...matriculas];
    
    loadMatriculados();
    updateStats();

    const searchInput = document.getElementById('buscarEstudiante');
    if (searchInput) {
      searchInput.addEventListener('input', filterMatriculas);
    }

    const filtroPrograma = document.getElementById('filtroPrograma');
    const filtroModalidad = document.getElementById('filtroModalidad');
    
    if (filtroPrograma) {
      filtroPrograma.addEventListener('change', filterMatriculas);
    }
    
    if (filtroModalidad) {
      filtroModalidad.addEventListener('change', filterMatriculas);
    }

    const btnExportar = document.getElementById("btnExportar");
    if (btnExportar) {
      btnExportar.addEventListener("click", exportToJSON);
    }

    const btnConfirmarLimpiar = document.getElementById("btnConfirmarLimpiar");
    if (btnConfirmarLimpiar) {
      btnConfirmarLimpiar.addEventListener("click", clearAllData);
    }
  });
}

function loadMatriculados() {
  const tbody = document.getElementById('tbodyMatriculados');
  const noDataMessage = document.getElementById('noDataMessage');
  const tableResponsive = document.querySelector('.table-responsive');
  
  if (!tbody) return;

  tbody.innerHTML = '';

  if (matriculasFiltradas.length === 0) {
    if (noDataMessage) noDataMessage.style.display = 'block';
    if (tableResponsive) tableResponsive.style.display = 'none';
    return;
  }

  if (noDataMessage) noDataMessage.style.display = 'none';
  if (tableResponsive) tableResponsive.style.display = 'block';

  matriculasFiltradas.forEach((m, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${index + 1}</strong></td>
      <td>${m.nombre}</td>
      <td>${m.dni}</td>
      <td>${m.email}</td>
      <td>${m.telefono || 'N/A'}</td>
      <td><span class="badge bg-primary">${m.programa}</span></td>
      <td>
        <span class="badge ${m.modalidad === 'Presencial' ? 'bg-info' : 'bg-warning'}">
          <i class="fas ${m.modalidad === 'Presencial' ? 'fa-school' : 'fa-laptop'}"></i>
          ${m.modalidad}
        </span>
      </td>
      <td><strong>${m.ciclo}</strong></td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="showAsignaturas(${m.id})">
          <i class="fas fa-eye"></i> Ver (${m.asignaturas.length})
        </button>
      </td>
      <td><span class="badge bg-success">${m.creditosTotales}</span></td>
      <td>
        <button class="btn btn-sm btn-info" onclick="showDetail(${m.id})" title="Ver detalle">
          <i class="fas fa-info-circle"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteMatricula(${m.id})" title="Eliminar">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  const resultadosCount = document.getElementById('resultadosCount');
  if (resultadosCount) {
    resultadosCount.textContent = `${matriculasFiltradas.length} resultado(s)`;
  }
}

function updateStats() {
  const totalEstudiantes = document.getElementById('totalEstudiantes');
  const totalPresencial = document.getElementById('totalPresencial');
  const totalVirtual = document.getElementById('totalVirtual');
  const totalCreditos = document.getElementById('totalCreditos');

  if (totalEstudiantes) {
    animateCounter(totalEstudiantes, matriculas.length);
  }

  if (totalPresencial) {
    const presencial = matriculas.filter(m => m.modalidad === 'Presencial').length;
    animateCounter(totalPresencial, presencial);
  }

  if (totalVirtual) {
    const virtual = matriculas.filter(m => m.modalidad === 'Virtual').length;
    animateCounter(totalVirtual, virtual);
  }

  if (totalCreditos) {
    const creditos = matriculas.reduce((sum, m) => sum + m.creditosTotales, 0);
    animateCounter(totalCreditos, creditos);
  }
}

function filterMatriculas() {
  const searchTerm = document.getElementById('buscarEstudiante')?.value.toLowerCase() || '';
  const programa = document.getElementById('filtroPrograma')?.value || '';
  const modalidad = document.getElementById('filtroModalidad')?.value || '';

  matriculasFiltradas = matriculas.filter(m => {
    const matchSearch = 
      m.nombre.toLowerCase().includes(searchTerm) ||
      m.dni.includes(searchTerm) ||
      m.email.toLowerCase().includes(searchTerm);
    
    const matchPrograma = !programa || m.programa === programa;
    const matchModalidad = !modalidad || m.modalidad === modalidad;

    return matchSearch && matchPrograma && matchModalidad;
  });

  loadMatriculados();
}

function showAsignaturas(id) {
  const matricula = matriculas.find(m => m.id === id);
  if (!matricula) return;

  const asignaturasHTML = matricula.asignaturas.map(a => 
    `<li class="list-group-item d-flex justify-content-between">
      <span><i class="fas fa-book text-primary me-2"></i>${a.nombre}</span>
      <span class="badge bg-primary">${a.creditos} créditos</span>
    </li>`
  ).join('');

  const content = `
    <div class="modal fade" id="modalAsignaturas" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="fas fa-book-reader me-2"></i>Asignaturas de ${matricula.nombre}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <ul class="list-group">
              ${asignaturasHTML}
            </ul>
            <div class="alert alert-info mt-3">
              <strong>Total de créditos:</strong> ${matricula.creditosTotales}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const oldModal = document.getElementById('modalAsignaturas');
  if (oldModal) oldModal.remove();

  document.body.insertAdjacentHTML('beforeend', content);
  
  const modal = new bootstrap.Modal(document.getElementById('modalAsignaturas'));
  modal.show();
}

function showDetail(id) {
  const matricula = matriculas.find(m => m.id === id);
  if (!matricula) return;

  const detalleEstudiante = document.getElementById('detalleEstudiante');
  if (!detalleEstudiante) return;

  detalleEstudiante.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h5><i class="fas fa-user me-2 text-primary"></i>Información Personal</h5>
        <ul class="list-group">
          <li class="list-group-item"><strong>Nombre:</strong> ${matricula.nombre}</li>
          <li class="list-group-item"><strong>DNI:</strong> ${matricula.dni}</li>
          <li class="list-group-item"><strong>Email:</strong> ${matricula.email}</li>
          <li class="list-group-item"><strong>Teléfono:</strong> ${matricula.telefono}</li>
          <li class="list-group-item"><strong>Fecha de Nacimiento:</strong> ${matricula.fechaNacimiento || 'No especificada'}</li>
        </ul>
      </div>
      <div class="col-md-6">
        <h5><i class="fas fa-graduation-cap me-2 text-primary"></i>Información Académica</h5>
        <ul class="list-group">
          <li class="list-group-item"><strong>Programa:</strong> ${matricula.programa}</li>
          <li class="list-group-item"><strong>Modalidad:</strong> 
            <span class="badge ${matricula.modalidad === 'Presencial' ? 'bg-info' : 'bg-warning'}">
              ${matricula.modalidad}
            </span>
          </li>
          <li class="list-group-item"><strong>Ciclo:</strong> ${matricula.ciclo}</li>
          <li class="list-group-item"><strong>Créditos Totales:</strong> 
            <span class="badge bg-success">${matricula.creditosTotales}</span>
          </li>
          <li class="list-group-item"><strong>Fecha de Matrícula:</strong> ${matricula.fecha || 'No disponible'}</li>
        </ul>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col-12">
        <h5><i class="fas fa-book-reader me-2 text-primary"></i>Asignaturas Matriculadas</h5>
        <div class="table-responsive">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Asignatura</th>
                <th class="text-center">Créditos</th>
              </tr>
            </thead>
            <tbody>
              ${matricula.asignaturas.map((a, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td><i class="fas fa-book text-primary me-2"></i>${a.nombre}</td>
                  <td class="text-center"><span class="badge bg-primary">${a.creditos}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
  modal.show();
}

function deleteMatricula(id) {
  if (!confirm('¿Está seguro que desea eliminar esta matrícula?')) return;

  matriculas = matriculas.filter(m => m.id !== id);
  matriculasFiltradas = matriculasFiltradas.filter(m => m.id !== id);
  
  saveMatriculas(matriculas);
  loadMatriculados();
  updateStats();
  
  showAlert('Matrícula eliminada correctamente', 'success');
}

function exportToJSON() {
  if (matriculas.length === 0) {
    showAlert('No hay datos para exportar. Primero registre algunas matrículas.', 'warning');
    return;
  }

  try {
    const exportData = {
      metadata: {
        titulo: "Matrículas Universidad Virtual",
        fechaExportacion: new Date().toLocaleString('es-PE'),
        totalRegistros: matriculas.length,
        version: "1.0"
      },
      estadisticas: {
        totalEstudiantes: matriculas.length,
        totalPresencial: matriculas.filter(m => m.modalidad === 'Presencial').length,
        totalVirtual: matriculas.filter(m => m.modalidad === 'Virtual').length,
        totalCreditos: matriculas.reduce((sum, m) => sum + m.creditosTotales, 0),
        promedioCreditos: Math.round(matriculas.reduce((sum, m) => sum + m.creditosTotales, 0) / matriculas.length)
      },
      matriculas: matriculas
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `matriculas_universidad_virtual_${fecha}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert('Archivo JSON exportado exitosamente', 'success');
    
  } catch (error) {
    console.error('Error al exportar JSON:', error);
    showAlert('Error al exportar el archivo. Intente nuevamente.', 'danger');
  }
}

function clearAllData() {
  localStorage.removeItem("matriculasUV");
  matriculas = [];
  matriculasFiltradas = [];
  loadMatriculados();
  updateStats();
  
  const modalElement = document.getElementById('modalConfirmar');
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
  
  showAlert('Todos los datos han sido eliminados correctamente', 'info');
}

function showAlert(message, type = 'info') {
  const alertContainer = document.createElement('div');
  alertContainer.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  alertContainer.style.zIndex = '9999';
  alertContainer.style.minWidth = '350px';
  alertContainer.style.maxWidth = '500px';
  alertContainer.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'danger' ? 'times-circle' : 'info-circle'} me-2"></i>
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(alertContainer);
  
  setTimeout(() => {
    alertContainer.remove();
  }, 5000);
}

function animateCounter(element, target) {
  if (!element) return;
  
  let current = 0;
  const increment = target / 50;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 20);
}

document.addEventListener('DOMContentLoaded', () => {
  const dniInput = document.getElementById('dni');
  if (dniInput) {
    dniInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  const telefonoInput = document.getElementById('telefono');
  if (telefonoInput) {
    telefonoInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
  }

  const nombreInput = document.getElementById('nombre');
  if (nombreInput) {
    nombreInput.addEventListener('blur', (e) => {
      const words = e.target.value.split(' ');
      const capitalized = words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      e.target.value = capitalized;
    });
  }

  const fechaNacInput = document.getElementById('fechaNacimiento');
  if (fechaNacInput) {
    fechaNacInput.addEventListener('change', (e) => {
      const fecha = new Date(e.target.value);
      const hoy = new Date();
      const edad = hoy.getFullYear() - fecha.getFullYear();
      
      if (edad < 16) {
        e.target.setCustomValidity('Debe ser mayor de 16 años');
        showAlert('Debe ser mayor de 16 años para matricularse', 'warning');
      } else {
        e.target.setCustomValidity('');
      }
    });
  }
});

window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 50) {
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
      navbar.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.2)';
    }
  }
});

let isSubmitting = false;

document.addEventListener('submit', (e) => {
  if (e.target.id === 'formMatricula') {
    if (isSubmitting) {
      e.preventDefault();
      return;
    }
    isSubmitting = true;
    setTimeout(() => {
      isSubmitting = false;
    }, 3000);
  }
});

console.log('Sistema de Matrícula Universidad Virtual - Cargado correctamente');
console.log('Matrículas registradas:', getMatriculas().length);