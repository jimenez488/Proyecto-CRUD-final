//Almacenamiento de datos y funcionalidad principal

class EquipmentManager {
    constructor() {
        this.equipment = JSON.parse(localStorage.getItem('equipment')) || [];
        this.initializeEventListeners();
        this.updateDisplay();
        this.updateStatistics();
    }

    //inicializae event listeners
    initializeEventListeners() {
        // Formulario de registro
        const form = document.querySelector('.registro');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            form.addEventListener('reset', () => this.handleFormReset());
        }


        //
}