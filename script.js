//Declaraciones

let dolaresAComprar = null; // inicia sin valor
let saldoPesos = 2000000;  // saldo inicial del simulador
let saldoDolares = 10; 
let tipoDeCambio = null;   
let tipoDeCambioVenta= null; 
let montoEnPesos;  
let montoEnPesosVenta; // pesos ganados por la venta de dolares
const url = 'https://dolarapi.com/v1/dolares/blue'; 
console.log('El saldo inicial es de $',saldoPesos,"y USD",saldoDolares)



//Elementos del DOM
const apuntarSaldo = document.getElementById("saldo");
const apuntarSaldoDolares = document.getElementById("saldo-dolares");
const apuntarDolares = document.getElementById("dolares");
const apuntarDolaresVenta = document.getElementById("vender-dolares");
const apuntarTransacciones = document.getElementById("historial-transacciones");
const apuntarListaTransacciones =document.getElementById("lista-transacciones");
const apuntarReiniciar=document.getElementById("reiniciar");
const botonAnterior = document.getElementById('anterior');
const botonSiguiente = document.getElementById('siguiente');
const apuntarCotizacionC = document.getElementById("cotizacionCompra")
const apuntarCotizacionV = document.getElementById("cotizacionVenta")

// Capturar el valor ingresado por el usuario
document.getElementById("comprar").addEventListener("click", comprarDolares);
document.getElementById("vender").addEventListener("click", venderDolares);
document.getElementById("reiniciar").addEventListener("click",reiniciarSimulador); 
    
  function reiniciarSimulador(){
    const continuarReinicio = confirm("Estás a punto de reiniciar el simulador");
    if(continuarReinicio){
        localStorage.clear();
        window.location.reload();
    }
}

//Funciones

async function obtenerCotizacionDolar() {
    try{
        const response = await fetch(url); // Espera a que se complete la solicitud fetch
        const data = await response.json();  // Espera a que se conviertan los datos a JSON

        tipoDeCambio = data.compra; 
        tipoDeCambioVenta = data.venta; 
        
        console.log("Dolar compra:",tipoDeCambio, "//Dolar venta:",tipoDeCambioVenta);
        //console.log(data)

        apuntarCotizacionC.innerHTML = `Cotización de compra: ${formatearMoneda(tipoDeCambio,'ARS')}`;
        apuntarCotizacionV.innerHTML = `Cotización de venta:  ${formatearMoneda(tipoDeCambioVenta,'ARS')}`;
        //document.getElementById("time").innerHTML = `ultima Actualización ${data.fechaActualizacion}`;

        // Llamar a las funciones que necesitan las cotizaciones
        inicializarSaldos();
        inicializarTransacciones();
        mostrarHistorialTransacciones();

    }
    catch(err){
        console.error('Error al obtener los datos de la API', err);
    }

}

// transformar a formato monedas
function formatearMoneda(valor,tipo){
    if (tipo === 'USD'){
        return valor.toLocaleString('es-AR',{
            style: 'currency',
            currency: 'USD'
        })
        //.replace('$','USD ')
    }else if (tipo === 'ARS'){
        return valor.toLocaleString('es-AR',{
            style:'currency',
            currency: 'ARS',
        })
    }
}

function inicializarSaldos() {
    // Obtener saldos del localStorage
    const saldoPesosGuardado = localStorage.getItem("saldoPesos");
    const saldoDolaresGuardado = localStorage.getItem("saldoDolares");
    
    // Si hay valores en localStorage, usarlos. De lo contrario, usar los valores iniciales.
    saldoPesos = saldoPesosGuardado ? parseFloat(saldoPesosGuardado) : saldoPesos;
    saldoDolares = saldoDolaresGuardado ? parseFloat(saldoDolaresGuardado) : saldoDolares;

    // Actualizar la interfaz con valores formateados
    apuntarSaldo.innerHTML = `Saldo en Pesos:  ${formatearMoneda(saldoPesos,'ARS')}`;
    apuntarSaldoDolares.innerHTML = `Saldo en Dolares: ${formatearMoneda(saldoDolares,'USD')}`;
}

function inicializarTransacciones(){
    const transaccionesCompraGuardadas = localStorage.getItem("transaccionesCompra");
    const transaccionesVentaGuardadas = localStorage.getItem("transaccionesVenta");
    transaccionesCompra = transaccionesCompraGuardadas ? JSON.parse(transaccionesCompraGuardadas) : [];
    transaccionesVenta = transaccionesVentaGuardadas ? JSON.parse(transaccionesVentaGuardadas) : [];
}

function comprarDolares(){
    //0. verifica si las cotizaciones están cargadas: 

    console.log("el tipo de cambio es",tipoDeCambio)
    if (tipoDeCambio === null) { // revisar esta parte
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "La cotización no está disponible. Intente nuevamente más tarde.",
        });
        return;
    }

    // acá está el error seguramente

    // 1. Capturar cuánto quiere comprar el usuario
    dolaresAComprar = parseFloat(apuntarDolares.value);
    console.log('el usuario quiere comprar USD',dolaresAComprar);

    //2. Verificar que el usuario ha ingresado un número válido
        if (isNaN(dolaresAComprar) || dolaresAComprar <= 0) {
            console.log("el usuario no está ingresando un número válido para la compra");
            //alert("por favor ingrese un número válido.") 
            Swal.fire({
                icon: "error",
                title: "Número inválido.",
                text: "Por favor, ingrese un número mayor a cero.",
              });
              apuntarDolares.value='';
            return; // Salir de la función si el número no es válido
        }


    // 3. Calcular el costo en pesos e informar al usuario
        montoEnPesos = dolaresAComprar*tipoDeCambio;

        Swal.fire({
            title: `Estas a punto de comprar ${formatearMoneda(dolaresAComprar,'USD')} por ${formatearMoneda(montoEnPesos,'ARS')}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, comprar",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {  // El usuario hizo clic en "Sí, comprar"
            // 4. Verificar si hay suficiente saldo después de la confirmación del usuario

                if(saldoPesos<montoEnPesos){
                // el usuario no tiene suficiente saldo
                    Swal.fire({
                        icon: "error",
                        title: "Saldo insuficiente.",
                        text: `No tienes suficiente saldo para comprar ${formatearMoneda(dolaresAComprar,'USD')}.`,
                    });
                    console.log('Saldo insuficiente.');
                    apuntarDolares.value = '';
                }else{
                // el usuario tiene suficiente saldo, proceder con la compra
                    saldoPesos= saldoPesos-montoEnPesos;
                    saldoDolares= saldoDolares + dolaresAComprar
                    localStorage.setItem("saldoPesos",saldoPesos);
                    localStorage.setItem("saldoDolares",saldoDolares);
        
                // Crear y añadir una nueva transacción al array
                const nuevaTransaccionCompra = {
                    fecha: new Date().toLocaleString(),
                    dolaresComprados: dolaresAComprar,
                    montoEnPesos: montoEnPesos,
                    saldo: saldoPesos,
                    saldoDolares:saldoDolares
                };
        
                transaccionesCompra.push(nuevaTransaccionCompra);
                localStorage.setItem("transaccionesCompra",JSON.stringify(transaccionesCompra));
        
                // Mostrar notificación de éxito y actualizar el saldo en la interfaz
                console.log("Operación confirmada: compra de dólares // El saldo en pesos restante es: $",saldoPesos, "// El saldo en dolares es: $",saldoDolares);
                Swal.fire({
                    icon: "success",
                    title: "Compra exitosa",
                    text: `Su saldo se ha actualizado.`,
                  });
                  apuntarDolares.value = '';
                  apuntarSaldo.innerHTML = `Saldo en Pesos: ${formatearMoneda(saldoPesos,'ARS')} `;
                  apuntarSaldoDolares.innerHTML = `Saldo en Dolares:${formatearMoneda(saldoDolares,'USD')}`
                  mostrarHistorialTransacciones();
                }    
            }else{
                // El usuario canceló
                console.log("El usuario ha cancelado.");
                apuntarDolares.value = '';  // Limpiar el campo de entrada
              }
          });



    }

function venderDolares(){
    // Verifica si las cotizaciones están cargadas
    console.log("El tipo de cambio para la venta es",tipoDeCambioVenta)
    if (!tipoDeCambioVenta) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "La cotización no está disponible. Intente nuevamente más tarde.",
        });
        return;
    }
    // 1. Capturar cuánto quiere vener el usuario
    dolaresAVender = parseFloat(apuntarDolaresVenta.value);
    console.log('el usuario quiere vender USD',dolaresAVender);

    //2. Verificar que el usuario ha ingresado un número válido
    if (isNaN(dolaresAVender) || dolaresAVender <= 0) {
        console.log("el usuario no está ingresando un número válido para la venta");
        Swal.fire({
            icon: "error",
            title: "Número inválido.",
            text: "Por favor, ingrese un número mayor a cero.",
          });
          apuntarDolaresVenta.value='';
        return // Salir de la función si el número no es válido
    }

    // 3. Calcular el costo en pesos
    montoEnPesosVenta = dolaresAVender*tipoDeCambioVenta;
    
    Swal.fire({
        title: `Estas a punto de vender ${formatearMoneda(dolaresAVender,'USD')} por ${formatearMoneda(montoEnPesosVenta,'ARS')}`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si, vender",
        cancelButtonText: "Cancelar"
        
    }).then((result)=>{
            if (result.isConfirmed) {
            // Comparar el costo con el saldo actual

                if(saldoDolares<dolaresAVender){
                //el usuario no tiene suficiente saldo para vender
                    Swal.fire({
                        icon: "error",
                        title: "Saldo insuficiente.",
                        text: `No tienes suficiente saldo para vender ${formatearMoneda(dolaresAVender,'USD')}.`
                    });
                    apuntarDolaresVenta.value = "";
                    return;
                    
                }else{
                    // el usuario tiene suficiente saldo, proceder con la venta
                    saldoPesos= saldoPesos+montoEnPesosVenta;
                    saldoDolares= saldoDolares - dolaresAVender
                    localStorage.setItem("saldoPesos",saldoPesos);
                    localStorage.setItem("saldoDolares",saldoDolares);
                
                    // Crear y añadir una nueva transacción al array
                    const nuevaTransaccionVenta = {
                        fecha: new Date().toLocaleString(),
                        dolaresVendidos: dolaresAVender,
                        montoEnPesos: montoEnPesosVenta,
                        saldo: saldoPesos,
                        saldoDolares: saldoDolares
                    };

                    transaccionesVenta.push(nuevaTransaccionVenta);
                    localStorage.setItem("transaccionesVenta",JSON.stringify(transaccionesVenta));
                
                    // Mostrar notificación de éxito y actualizar el saldo en la interfaz
                    console.log("Operación confirmada: venta de dólares // El saldo en pesos restante es: $",saldoPesos, "// El saldo en dolares es: $",saldoDolares);
                    Swal.fire({
                        icon: "success",
                        title: "Venta exitosa",
                        text: `Su saldo se ha actualizado.`,
                    });
                    apuntarDolaresVenta.value = '';
                    apuntarSaldo.innerHTML = `Saldo en Pesos: ${formatearMoneda(saldoPesos,'ARS')} `;
                    apuntarSaldoDolares.innerHTML = `Saldo en Dolares: ${formatearMoneda(saldoDolares,'USD')}`
                    mostrarHistorialTransacciones();
                   
            };
        }else{
            // The user clicked "Cancel"
            console.log("El usuario ha cancelado.");
            apuntarDolaresVenta.value = '';  // Limpiar el campo de entrada
        }

    })    



}

// Mostrar transacciones dentro de UL como Li
function mostrarHistorialTransacciones(){
    apuntarTransacciones.innerHTML= ""; // limpiar el contenido anterior

    const transaccionesCombinadas = [...transaccionesCompra,...transaccionesVenta];
    transaccionesCombinadas.sort((a,b)=> new Date (a.fecha)- new Date(b.fecha));

    transaccionesCombinadas.forEach(transaccion => {
        const li = document.createElement("li");

        if (transaccion.dolaresComprados){
            li.textContent = `Fecha: ${transaccion.fecha} - Compraste ${formatearMoneda(transaccion.dolaresComprados,'USD')} por ${formatearMoneda(transaccion.montoEnPesos,'ARS')}. Saldo restante:${formatearMoneda(transaccion.saldo,'ARS')} y ${formatearMoneda(transaccion.saldoDolares,'USD')}`
            apuntarListaTransacciones.innerHTML= ""; // limpiar el contenido anterior
        }else{
            li.textContent= `Fecha: ${transaccion.fecha} - Vendiste ${formatearMoneda(transaccion.dolaresVendidos,'USD')} por ${formatearMoneda(transaccion.montoEnPesos,'ARS')}. Saldo restante:${formatearMoneda(transaccion.saldo,'ARS')} y ${formatearMoneda(transaccion.saldoDolares,'USD')}`
            apuntarListaTransacciones.innerHTML= ""; // limpiar el contenido anterior
        }
        
        apuntarTransacciones.appendChild(li);
    });
}






// Inicializar saldos al cargar la página
window.onload = function() {

    obtenerCotizacionDolar();
};
