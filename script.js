//Declaraciones
// variables
let dolaresAComprar = null; // inicia sin valor
let saldoPesos = 135000;
let saldoDolares = 0; 
const tipoDeCambio = 1350;
let montoEnPesos; 
console.log('El saldo inicial es de $',saldoPesos)


//Apuntar al doc
const aputarSaldo = document.getElementById("saldo");
const aputarSaldoDolares = document.getElementById("saldo-dolares");
const apuntarDolares = document.getElementById("dolares");
// Capturar el valor ingresado por el usuario
document.getElementById("comprar").addEventListener("click", comprarDolares);

//Funciones

function inicializarSaldos() {
    // Obtener saldos del localStorage
    const saldoPesosGuardado = localStorage.getItem("saldoPesos");
    const saldoDolaresGuardado = localStorage.getItem("saldoDolares");
    
    // Si hay valores en localStorage, usarlos. De lo contrario, usar los valores iniciales.
    saldoPesos = saldoPesosGuardado ? parseFloat(saldoPesosGuardado) : saldoPesos;
    saldoDolares = saldoDolaresGuardado ? parseFloat(saldoDolaresGuardado) : saldoDolares;

    // Actualizar la interfaz
    aputarSaldo.innerHTML = `Saldo en Pesos: $ ${saldoPesos}`;
    aputarSaldoDolares.innerHTML = `Saldo en Dolares: USD ${saldoDolares}`;
}

function comprarDolares(){
    // 1. Capturar cuánto quiere comprar el usuario

    dolaresAComprar = parseFloat(apuntarDolares.value);
    console.log('el usuario quiere comprar USD',dolaresAComprar);

    //2. Verificar que el usuario ha ingresado un número válido
        if (isNaN(dolaresAComprar) || dolaresAComprar <= 0) {
            console.log("el usuario no está ingresando un número válido");
            alert("por favor ingrese un número válido.") 
            return; // Salir de la función si el número no es válido
        }
    // 3. Calcular el costo en pesos
        montoEnPesos = dolaresAComprar*tipoDeCambio;
        const continuar = confirm(`Estas a punto de comprar USD${dolaresAComprar} por $${montoEnPesos}`)
            if (continuar){
                // El usuario está de acuerdo con la operación
                console.log(`El costo en pesos es de $${montoEnPesos}`)
                apuntarDolares.value = '';
            } else { // El usuario hizo clic en "Cancelar"
                console.log("El usuario ha cancelado.");
                apuntarDolares.value = '';
            }

    // 4. Comparar el costo con el saldo actual
    if(saldoPesos<montoEnPesos){
        // el usuario no tiene suficiente saldo
        alert(`No tienes suficiente saldo para comprar USD${dolaresAComprar}.`);
        apuntarDolares.value = '';
    }else{
        // el usuario tiene suficiente saldo
        saldoPesos= saldoPesos-montoEnPesos;
        saldoDolares= saldoDolares + dolaresAComprar
        localStorage.setItem("saldoPesos",saldoPesos);
        localStorage.setItem("saldoDolares",saldoDolares);
        console.log("El saldo en pesos restante es: $",saldoPesos);
        console.log("El saldo en dolares es: $",saldoDolares);
        alert("Compra exitosa. Su saldo se ha actualizado.");
        aputarSaldo.innerHTML = `Saldo en Pesos: $ ${saldoPesos} `;
        aputarSaldoDolares.innerHTML = `Saldo en Dolares: USD ${saldoDolares}`
    }

}

// Inicializar saldos al cargar la página
window.onload = inicializarSaldos;






