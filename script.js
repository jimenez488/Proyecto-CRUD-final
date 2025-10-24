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
    }}