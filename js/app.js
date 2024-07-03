// objeto
let cliente = {
	mesa : '',
	hora : '',
	pedido : []
}

const categorias = {
	1: 'Comida',
	2: 'Bebidas',
	3: 'Postres'
}

// Establecer referencias 
const btnGuardarCliente = document.querySelector('#guardar-cliente');
const contenido = document.querySelector('#resumen .contenido');

// Eventos
btnGuardarCliente.addEventListener('click', guardarCliente);

// Funciones
function guardarCliente(){
	const mesa = document.querySelector('#mesa').value;
	const hora = document.querySelector('#hora').value;
	
	// Validar los campos
	const validarCampo = [mesa, hora].some( campo => campo === '');	

	if(validarCampo){
		// Comprueba si la alerta existe
		const alertaExiste = document.querySelector('.invalid-feedback');
		alertaExiste?.remove();

		// Crea la alerta
		const alerta = document.createElement('div');
		alerta.classList.add('invalid-feedback', 'd-block', 'text-center')
		alerta.textContent = 'Todos los campos son obligatorios';

		//! Una forma de agregar un elemento rapidamente
		document.querySelector('.modal-body').appendChild(alerta);
		setTimeout(() => {
			alerta.remove()
		}, 2000);
		return;
	}

	// Llenar el objeto
	// cliente = { mesa, hora} //? Se pierde la llave de pedido
	// cliente = { mesa, hora, ...cliente} //? Se pierde la información de mesa y hora
	cliente = { ...cliente, mesa, hora} //* Se conserva la información y la llave de pedido
	//! Se debe a que primero se toma un objeto vacio 'cliente' y luego se sobre escribe los campos
	//! de mesa y hora
	
	// Ocultar modal
	const formulario = document.querySelector('#formulario'); // referencia al modal
	const modalBootstrap = bootstrap.Modal.getInstance(formulario); // se le pasa la referencia al controlador de Modal de Bootstrap
	modalBootstrap.hide(); // De esta forma ocultará el modal

	// Mostrar las secciones
	mostrarSecciones();

	// Obtener platillos de la API de json-server
	obtenerPlatillos();
}

function mostrarSecciones(){
	const seccionesOcultas = document.querySelectorAll('.d-none');
	seccionesOcultas.forEach( seccion => {
		seccion.classList.remove('d-none')
	})
	// seccionesOcultas.classList.remove('d-none')
}

function obtenerPlatillos(){
	const url = 'http://localhost:3000/platillos';

	fetch(url)
		.then(respuesta => respuesta.json())
		.then(resultado => mostrarPlatillos(resultado))
		.catch(error => {
			console.log(error)
		})
	
}

function mostrarPlatillos(platillos){
	const contenido = document.querySelector('#platillos .contenido');

	platillos.forEach( platillo => {

		const row = document.createElement('div');
		row.classList.add('row', 'py-3', 'border-top');

		const nombre = document.createElement('div');
		nombre.classList.add('col-md-4');
		nombre.textContent = platillo.nombre;

		const precio = document.createElement('div');
		precio.classList.add('col-md-3', 'fw-bold');
		precio.textContent = `$${platillo.precio}`;

		const categoria = document.createElement('div');
		categoria.classList.add('col-md-3');
		categoria.textContent = categorias[platillo.categoria];

		const inputCantidad = document.createElement('input');
		inputCantidad.type = 'number';
		inputCantidad.min = 0;
		inputCantidad.value = 0;
		inputCantidad.id = `producto-${platillo.id}`;
		inputCantidad.classList.add('form-control');

		//! Función que detecta la cantidad y el platillo que se esta agregando
		inputCantidad.onchange = function(){
			const cantidad = parseInt(inputCantidad.value);
			agregarPlatillo({...platillo, cantidad}); //! De esta forma de convierte en un objeto
			//? El espred operator abre el objeto
		};

		const agregar = document.createElement('div');
		agregar.classList.add('col-md-2');
		agregar.appendChild(inputCantidad);

		row.appendChild(nombre);
		row.appendChild(precio);
		row.appendChild(categoria);
		row.appendChild(agregar);
		contenido.appendChild(row);
	})
}

function agregarPlatillo(producto){
	// Extraer el pedido actual 
	let { pedido } = cliente;

	// Revisar que la cantidad sea mayor a 0 
	if(producto.cantidad > 0){

		//? Comprueba si el elemento ya existe dentro del array
		if( pedido.some( articulo => articulo.id === producto.id )){
			// El articulo ya existe se actualiza la cantidad
			const pedidoActualizado = pedido.map( articulo => {
				if( articulo.id === producto.id ){
					articulo.cantidad = producto.cantidad
				}
				return articulo;
			});
			// Se asigna el nuevo array a cliente.pedido
			cliente.pedido = [...pedidoActualizado];
		} else {
			//? El articulo no existe, se agrega al array de pedido
			cliente.pedido = [...pedido, producto];
		}
	}else {
		// Eliminar elementos cuando su cantidad es cero
		const resultado = pedido.filter( articulo => articulo.id !== producto.id )
		cliente.pedido = [...resultado];
	}
	// Limpiar el código HTML previo
	limpiarHtml(contenido);

	if(cliente.pedido.length ){
		// Mostrar el resumen
		mostrarResumen();
	} else {
		mensajePedidoVacio()
	}
}

function limpiarHtml(objetivo){
	
	while(objetivo.firstChild){
		objetivo.removeChild(objetivo.firstChild);
	}
}

function mostrarResumen(){
	const contenido = document.querySelector('#resumen .contenido');

	const resumen = document.createElement('div');
	resumen.classList.add('col-md-6', 'card', 'py-5', 'px-3', 'shadow');

	// Información de la mesa
	const mesa = document.createElement('p');
	mesa.textContent = 'Mesa: ';
	mesa.classList.add('fw-bold');

	const mesaSpan = document.createElement('SPAN');
	mesaSpan.textContent = cliente.mesa;
	mesaSpan.classList.add('fw-normal');

	// Información de la hora
	const hora = document.createElement('p');
	hora.textContent = 'Hora: ';
	hora.classList.add('fw-bold');

	const horaSpan = document.createElement('SPAN');
	horaSpan.textContent = cliente.hora;
	horaSpan.classList.add('fw-normal');

	// Estructurar en su correspondiente
	mesa.appendChild(mesaSpan);
	hora.appendChild(horaSpan);

	//Titulo de la sección
	const heading = document.createElement('h3');
	heading.textContent = 'Platillos Consumidos';
	heading.classList.add('my-4', 'text-center');

	//Iterar sobre el array de pedidos
	const grupo = document.createElement('ul');
	grupo.classList.add('list-group');
	
	const { pedido } = cliente;

	pedido.forEach( articulo => {
		const { nombre, cantidad, precio, id } = articulo;
		
		const lista = document.createElement('li');
		lista.classList.add('list-group-item');

		const nombreEl = document.createElement('h4');
		nombreEl.classList.add('my-4');
		nombreEl.textContent = nombre;

		const cantidadEl = document.createElement('p');
		cantidadEl.classList.add('fw-bold');
		cantidadEl.textContent = 'Cantidad: ';

		const cantidadValor = document.createElement('span')
		cantidadValor.classList.add('fw-normal');
		cantidadValor.textContent = cantidad;

		cantidadEl.appendChild(cantidadValor); // Agrega los dos elementos

		const precioEl = document.createElement('p');
		precioEl.classList.add('fw-bold');
		precioEl.textContent = 'Precio: ';

		const precioValor = document.createElement('span')
		precioValor.classList.add('fw-normal');
		precioValor.textContent = `$${precio}`;

		precioEl.appendChild(precioValor); // Agrega los dos elementos

		const subtotalEl = document.createElement('p');
		subtotalEl.classList.add('fw-bold');
		subtotalEl.textContent = 'Subtotal: ';

		const subtotalValor = document.createElement('span')
		subtotalValor.classList.add('fw-normal');
		subtotalValor.textContent = calcularSubtotal(cantidad, precio);

		subtotalEl.appendChild(subtotalValor); // Agrega los dos elementos

		// Botón para eliminar
		const btnEliminar = document.createElement('button');
		btnEliminar.classList.add('btn', 'btn-danger');
		btnEliminar.textContent = 'Eliminar del pedido';
		// Función para eliminar del pedido
		btnEliminar.onclick = function(){
			eliminarProducto(id);
		}

		// Agregando elementos
		lista.appendChild(nombreEl);
		lista.appendChild(cantidadEl);
		lista.appendChild(precioEl);
		lista.appendChild(subtotalEl);
		lista.appendChild(btnEliminar);

		// Agregar lista al grupo principal
		grupo.appendChild(lista);
	});

	// Estructurar al primer contenedor
	resumen.appendChild(heading);
	resumen.appendChild(mesa);
	resumen.appendChild(hora);
	resumen.appendChild(grupo);

	// Estructurar en su contenedor padre
	contenido.appendChild(resumen);

	// Mostrar formulario de propinas
	formularioPropinas();
};

function formularioPropinas(){
	const contenido = document.querySelector('#resumen .contenido');
	
	const formulario = document.createElement('div');
	formulario.classList.add('col-md-6', 'formulario');

	const divFormulario = document.createElement('div');
	divFormulario.classList.add('card', 'py-5', 'px-3', 'shadow')

	const heading = document.createElement('h3');
	heading.classList.add('my-4', 'text-center');
	heading.textContent = 'Propina';

	// Selectores
	const radio10 = document.createElement('input'); // 10%
	radio10.type = 'radio';
	radio10.name = 'propina';
	radio10.value = '10';
	radio10.classList.add('form-check-input');
	radio10.onclick = calcularPropina;

	const radio10Label = document.createElement('label');
	radio10Label.textContent = '10%';
	radio10Label.classList.add('form-check-label');

	const radio10Div = document.createElement('div');
	radio10Div.classList.add('form-check');

	radio10Div.appendChild(radio10);
	radio10Div.appendChild(radio10Label);

	const radio15 = document.createElement('input'); // 15%
	radio15.type = 'radio';
	radio15.name = 'propina';
	radio15.value = '15';
	radio15.classList.add('form-check-input');
	radio15.onclick = calcularPropina;

	const radio15Label = document.createElement('label');
	radio15Label.textContent = '15%';
	radio15Label.classList.add('form-check-label');

	const radio15Div = document.createElement('div');
	radio15Div.classList.add('form-check');

	radio15Div.appendChild(radio15);
	radio15Div.appendChild(radio15Label);

	const radio20 = document.createElement('input'); // 20%
	radio20.type = 'radio';
	radio20.name = 'propina';
	radio20.value = '20';
	radio20.classList.add('form-check-input');
	radio20.onclick = calcularPropina;

	const radio20Label = document.createElement('label');
	radio20Label.textContent = '20%';
	radio20Label.classList.add('form-check-label');

	const radio20Div = document.createElement('div');
	radio20Div.classList.add('form-check');

	radio20Div.appendChild(radio20);
	radio20Div.appendChild(radio20Label);

	// Estructuración de los elementos
	divFormulario.appendChild(heading);
	divFormulario.appendChild(radio10Div);
	divFormulario.appendChild(radio15Div);
	divFormulario.appendChild(radio20Div);
	
	formulario.appendChild(divFormulario);
	
	contenido.appendChild(formulario);
}

function calcularPropina(){
	const { pedido } = cliente;
	let subtotal = 0;

	// Calcular el subtotal a pagar
	pedido.forEach( articulo => {
		subtotal += articulo.cantidad * articulo.precio;
	});

	// Seleccionar el radio Button	con la propina del cliente
	const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

	// Calcular la propina
	const propina = ((subtotal * parseInt(propinaSeleccionada)) / 100)

	// Calcular el total a pagar 
	const total = propina + subtotal;

	mostrarTotalHtml(subtotal, propina, total);
}

function mostrarTotalHtml(subtotal, propina, total){
	//! Valida si ya existe un total previo y lo elimina
	const totalPagarDiv = document.querySelector('.total-pagar');
	if(totalPagarDiv){
		totalPagarDiv.remove();	
	}

	const divTotales = document.createElement('div');
	divTotales.classList.add('total-pagar', 'my-5');
	const formulario = document.querySelector('.formulario > div');


	// subtotal
	const subTotalParrafo = document.createElement('p');
	subTotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-1', 'mb-1');
	subTotalParrafo.textContent = 'Subtotal consumo: ';

	const subTotalSpan = document.createElement('span');
	subTotalSpan.classList.add('fw-normal', );
	subTotalSpan.textContent = `$${subtotal}`
	subTotalParrafo.appendChild(subTotalSpan)

	// propina
	const propinaParrafo = document.createElement('p');
	propinaParrafo.classList.add('fs-3', 'fw-bold', 'mt-1', 'mb-1');
	propinaParrafo.textContent = 'Cantidad de propina: ';

	const propinaSpan = document.createElement('span');
	propinaSpan.classList.add('fw-normal', );
	propinaSpan.textContent = `$${propina}`;
	propinaParrafo.appendChild(propinaSpan);

	// total
	const totalParrafo = document.createElement('p');
	totalParrafo.classList.add('fs-3', 'fw-bold', 'mt-1');
	totalParrafo.textContent = 'Total a pagar: ';

	const totalSpan = document.createElement('span');
	totalSpan.classList.add('fw-normal', );
	totalSpan.textContent = `$${total}`;
	totalParrafo.appendChild(totalSpan);

	// Agregando elementos
	divTotales.appendChild(subTotalParrafo);
	divTotales.appendChild(propinaParrafo);
	divTotales.appendChild(totalParrafo);

	// Agregando al contenedor principal
	formulario.appendChild(divTotales)

}

function mensajePedidoVacio(){
	const contenido = document.querySelector('#resumen .contenido');

	const texto = document.createElement('p')
	texto.classList.add('text-center');
	texto.textContent = 'Añade los elementos del pedido';

	contenido.appendChild(texto)
}

function eliminarProducto(id){
	const { pedido } = cliente;
	const resultado = pedido.filter( articulo => articulo.id !== id )
	cliente.pedido = [...resultado];

	limpiarHtml(contenido);

	if(cliente.pedido.length ){
		// Mostrar el resumen
		mostrarResumen();
	} else {
		mensajePedidoVacio()
	}

	// El producto se elimino entonces la cantidad debe volver a cero
	const productoEliminado = `#producto-${id}`;
	const producto = document.querySelector(productoEliminado);
	producto.value = 0;
}

function calcularSubtotal(cantidad, precio){
	resultado = (cantidad * precio);
	return `$${resultado}`;
}