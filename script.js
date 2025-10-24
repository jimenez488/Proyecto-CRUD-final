
// Almacenamiento de datos y funcionalidad principal

class EquipmentManager {
    constructor() {
        this.equipment = JSON.parse(localStorage.getItem('equipment')) || [];
        this.initializeEventListeners();
        this.updateDisplay();
        this.updateStatistics();
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Formulario de registro
        const form = document.querySelector('.registro');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            form.addEventListener('reset', () => this.handleFormReset());
        }

        // Formulario de edición
        const editForm = document.getElementById('editequipmentform');
        if (editForm) {
            editForm.addEventListener('submit', (e) => this.handleEditFormSubmit(e));
        }

        // Botón de ocultar/mostrar formulario
        const toggleButton = document.querySelector('.panel-control button');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleForm());
        }

        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Botón de búsqueda
        const searchButton = document.getElementById('clearsearch');
        if (searchButton) {
            searchButton.addEventListener('click', () => this.clearSearch());
        }

        // Filtros
        const typeFilter = document.getElementById('tipofiltro');
        const statusFilter = document.getElementById('fitro-estado');
        
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        // Limpiar filtros
        const clearFiltersButton = document.getElementById('clearfilter');
        if (clearFiltersButton) {
            clearFiltersButton.addEventListener('click', () => this.clearFilters());
        }

        // Modal close buttons
        const modalCloses = document.querySelectorAll('.modal-close');
        modalCloses.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    // Manejar envío del formulario
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const equipment = {
            id: Date.now(), // ID único basado en timestamp
            equipmentId: formData.get('IDequipo'),
            type: formData.get('tipo'),
            brand: formData.get('brand'),
            model: formData.get('model'),
            serialNumber: formData.get('serialnumber'),
            status: formData.get('status'),
            purchaseDate: formData.get('calendario'),
            warranty: formData.get('garantia'),
            notes: formData.get('notes'),
            registrationDate: new Date().toISOString()
        };

        // Validar que el ID del equipo no exista
        if (this.equipment.some(eq => eq.equipmentId === equipment.equipmentId)) {
            this.showToast('Error: El ID del equipo ya existe', 'error');
            return;
        }

        // Agregar equipo
        this.equipment.push(equipment);
        this.saveToLocalStorage();
        this.updateDisplay();
        this.updateStatistics();
        
        // Mostrar mensaje de éxito
        this.showToast('Equipo registrado exitosamente', 'success');
        
        // Limpiar formulario
        e.target.reset();
    }

    // Limpiar formulario
    handleFormReset() {
        this.showToast('Formulario limpiado', 'info');
    }

    // Manejar envío del formulario de edición
    handleEditFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const equipmentId = parseInt(document.getElementById('editindex').value);
        
        // Encontrar el equipo a editar
        const equipmentIndex = this.equipment.findIndex(eq => eq.id === equipmentId);
        if (equipmentIndex === -1) {
            this.showToast('Error: Equipo no encontrado', 'error');
            return;
        }

        // Validar que el nuevo ID del equipo no exista en otros equipos
        const newEquipmentId = formData.get('equipmentid');
        const existingEquipment = this.equipment.find(eq => eq.equipmentId === newEquipmentId && eq.id !== equipmentId);
        if (existingEquipment) {
            this.showToast('Error: El ID del equipo ya existe', 'error');
            return;
        }

        // Actualizar el equipo
        this.equipment[equipmentIndex] = {
            ...this.equipment[equipmentIndex],
            equipmentId: newEquipmentId,
            type: formData.get('equipmenttype'),
            brand: formData.get('brand'),
            model: formData.get('model'),
            serialNumber: formData.get('serialNumber'),
            status: formData.get('status'),
            purchaseDate: formData.get('purchaseDate'),
            warranty: formData.get('warranty'),
            notes: formData.get('notes'),
            lastModified: new Date().toISOString()
        };

        // Guardar y actualizar vista
        this.saveToLocalStorage();
        this.updateDisplay();
        this.updateStatistics();
        this.closeModals();
        
        this.showToast('Equipo actualizado exitosamente', 'success');
    }

    // Toggle formulario
    toggleForm() {
        const formSection = document.querySelector('.seccion-formulario');
        const button = document.querySelector('.panel-control button');
        
        if (formSection && button) {
            if (formSection.style.display === 'none') {
                formSection.style.display = 'block';
                button.textContent = 'Ocultar Formulario';
            } else {
                formSection.style.display = 'none';
                button.textContent = 'Mostrar Formulario';
            }
        }
    }

    // Búsqueda
    handleSearch(query) {
        this.currentSearch = query.toLowerCase();
        this.applyFilters();
    }

    // Limpiar búsqueda
    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            this.currentSearch = '';
            this.applyFilters();
        }
    }

    // Aplicar filtros
    applyFilters() {
        const typeFilter = document.getElementById('tipofiltro')?.value || '';
        const statusFilter = document.getElementById('fitro-estado')?.value || '';
        const searchQuery = this.currentSearch || '';

        let filteredEquipment = this.equipment.filter(eq => {
            const matchesType = !typeFilter || eq.type === typeFilter;
            const matchesStatus = !statusFilter || eq.status.toLowerCase() === statusFilter.toLowerCase();
            const matchesSearch = !searchQuery || 
                eq.equipmentId.toLowerCase().includes(searchQuery) ||
                eq.brand.toLowerCase().includes(searchQuery) ||
                eq.model.toLowerCase().includes(searchQuery) ||
                eq.serialNumber.toLowerCase().includes(searchQuery);

            return matchesType && matchesStatus && matchesSearch;
        });

        this.displayEquipment(filteredEquipment);
        this.updateEquipmentCount(filteredEquipment.length);
    }

    // Limpiar filtros
    clearFilters() {
        const typeFilter = document.getElementById('tipofiltro');
        const statusFilter = document.getElementById('fitro-estado');
        const searchInput = document.getElementById('searchInput');

        if (typeFilter) typeFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        if (searchInput) searchInput.value = '';

        this.currentSearch = '';
        this.updateDisplay();
    }

    // Actualizar pantalla
    updateDisplay() {
        this.displayEquipment(this.equipment);
        this.updateEquipmentCount(this.equipment.length);
    }

    // Mostrar equipos en la tabla
    displayEquipment(equipmentList) {
        const tableBody = document.getElementById('equipmenttablebody');
        if (!tableBody) return;

        if (equipmentList.length === 0) {
            tableBody.innerHTML = `
                <tr class="no-data">
                    <td colspan="7">
                        <div class="no-data-message">
                            <p>No hay equipos registrados</p>
                            <small>Utiliza el formulario de arriba para registrar tu primer equipo</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = equipmentList.map(eq => `
            <tr>
                <td>${eq.equipmentId}</td>
                <td>
                    <i class="${this.getTypeIcon(eq.type)}"></i>
                    ${this.getTypeLabel(eq.type)}
                </td>
                <td>${eq.brand}</td>
                <td>${eq.model}</td>
                <td>
                    <span class="status-badge status-${eq.status.toLowerCase().replace(/\s+/g, '-')}">
                        <i class="${this.getStatusIcon(eq.status)}"></i>
                        ${eq.status}
                    </span>
                </td>
                <td>${this.formatDate(eq.purchaseDate)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="equipmentManager.editEquipment(${eq.id})">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="equipmentManager.deleteEquipment(${eq.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Obtener icono según tipo
    getTypeIcon(type) {
        const icons = {
            'desktop': 'fas fa-desktop',
            'laptop': 'fas fa-laptop',
            'servidor': 'fas fa-server',
            'impresora': 'fas fa-print',
            'monitor': 'fas fa-tv',
            'router': 'fas fa-wifi',
            'switch': 'fas fa-network-wired',
            'otro': 'fas fa-question-circle'
        };
        return icons[type] || 'fas fa-computer';
    }

    // Obtener etiqueta según tipo
    getTypeLabel(type) {
        const labels = {
            'desktop': 'Computadora de Escritorio',
            'laptop': 'Laptop',
            'servidor': 'Servidor',
            'impresora': 'Impresora',
            'monitor': 'Monitor',
            'router': 'Router',
            'switch': 'Switch',
            'otro': 'Otro'
        };
        return labels[type] || type;
    }

    // Obtener icono según estado
    getStatusIcon(status) {
        const icons = {
            'operativo': 'fas fa-check-circle',
            'en mantenimiento': 'fas fa-tools',
            'fuera de servicio': 'fas fa-times-circle',
            'en reparación': 'fas fa-wrench',
            'retirado': 'fas fa-trash'
        };
        return icons[status.toLowerCase()] || 'fas fa-circle';
    }

    // Formatear fecha
    formatDate(dateString) {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    }

    // Actualizar contador de equipos
    updateEquipmentCount(count) {
        const countElement = document.getElementById('equipmentCount');
        if (countElement) {
            countElement.textContent = `${count} Equipos Encontrados`;
        }
    }

    // Actualizar estadísticas
    updateStatistics() {
        const total = this.equipment.length;
        const operational = this.equipment.filter(eq => eq.status.toLowerCase() === 'operativo').length;
        const maintenance = this.equipment.filter(eq => eq.status.toLowerCase() === 'en mantenimiento').length;
        const outOfService = this.equipment.filter(eq => eq.status.toLowerCase() === 'fuera de servicio').length;

        // Actualizar elementos
        const totalElement = document.getElementById('totalEquipment');
        const operationalElement = document.getElementById('operationalEquipment');
        const maintenanceElement = document.getElementById('maintenanceEquipment');
        const outOfServiceElement = document.getElementById('outOfServiceEquipment');

        if (totalElement) totalElement.textContent = total;
        if (operationalElement) operationalElement.textContent = operational;
        if (maintenanceElement) maintenanceElement.textContent = maintenance;
        if (outOfServiceElement) outOfServiceElement.textContent = outOfService;
    }

    // Editar equipo
    editEquipment(id) {
        const equipment = this.equipment.find(eq => eq.id === id);
        if (!equipment) return;

        // Abrir modal de edición
        const modal = document.getElementById('editModal');
        if (modal) {
            // Rellenar formulario con datos actuales
            document.getElementById('editindex').value = id;
            document.getElementById('editequipmentid').value = equipment.equipmentId;
            document.getElementById('editequipmenttype').value = equipment.type;
            document.getElementById('editBrand').value = equipment.brand;
            document.getElementById('editModel').value = equipment.model;
            document.getElementById('editSerialNumber').value = equipment.serialNumber;
            document.getElementById('editStatus').value = equipment.status;
            document.getElementById('editPurchaseDate').value = equipment.purchaseDate;
            document.getElementById('editWarranty').value = equipment.warranty;
            document.getElementById('editNotes').value = equipment.notes;

            modal.style.display = 'block';
        }
    }

    // Eliminar equipo
    deleteEquipment(id) {
        const equipment = this.equipment.find(eq => eq.id === id);
        if (!equipment) return;

        // Mostrar modal de confirmación
        const modal = document.getElementById('deleteModal');
        const equipmentInfo = document.getElementById('deleteEquipmentInfo');
        
        if (modal && equipmentInfo) {
            equipmentInfo.innerHTML = `
                <strong>ID:</strong> ${equipment.equipmentId}<br>
                <strong>Tipo:</strong> ${this.getTypeLabel(equipment.type)}<br>
                <strong>Marca:</strong> ${equipment.brand}<br>
                <strong>Modelo:</strong> ${equipment.model}
            `;

            // Configurar botón de confirmación
            const confirmButton = document.getElementById('confirmDelete');
            if (confirmButton) {
                confirmButton.onclick = () => {
                    this.confirmDelete(id);
                };
            }

            modal.style.display = 'block';
        }
    }

    // Confirmar eliminación
    confirmDelete(id) {
        this.equipment = this.equipment.filter(eq => eq.id !== id);
        this.saveToLocalStorage();
        this.updateDisplay();
        this.updateStatistics();
        this.closeModals();
        this.showToast('Equipo eliminado exitosamente', 'success');
    }

    // Cerrar modales
    closeModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Guardar en localStorage
    saveToLocalStorage() {
        localStorage.setItem('equipment', JSON.stringify(this.equipment));
    }

    // Mostrar notificación toast
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="${this.getToastIcon(type)}"></i>
            <span>${message}</span>
            <button class="toast-close">&times;</button>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
        }
    }

    // Obtener icono para toast
    getToastIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-info-circle';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.equipmentManager = new EquipmentManager();
});

// Exportar datos como JSON
function exportData() {
    const data = JSON.stringify(window.equipmentManager.equipment, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    window.equipmentManager.showToast('Datos exportados exitosamente', 'success');
}

// Importar datos desde JSON
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                window.equipmentManager.equipment = importedData;
                window.equipmentManager.saveToLocalStorage();
                window.equipmentManager.updateDisplay();
                window.equipmentManager.updateStatistics();
                window.equipmentManager.showToast('Datos importados exitosamente', 'success');
            } else {
                window.equipmentManager.showToast('Formato de archivo inválido', 'error');
            }
        } catch (error) {
            window.equipmentManager.showToast('Error al importar datos', 'error');
        }
    };
    reader.readAsText(file);
}
