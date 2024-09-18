<template>
	<div class="p-6 max-w-screen-sm mx-auto">
		<h2 class="text-3xl mb-4">Cursos de: <span class="font-bold">{{ nombreCompleto }}</span></h2> <!-- Muestra el nombre completo del usuario -->
		<div class="flex flex-wrap justify-center gap-6">
			<div v-for="curso in cursos" :key="curso.idCurso"
				class="flex w-full overflow-hidden !shadow-2xl !border !border-gray-400 rounded-xl">
				<!-- Imagen a la izquierda -->
				<img alt="user header" v-if="curso.miniatura" :src="curso.miniatura" class="w-1/3 h-auto object-cover">
				<!-- Contenido a la derecha -->
				<div class="flex-1 p-4">
					<h3 class="text-xl font-semibold">{{ curso.titulo }}</h3>
					<!-- <p class="text-sm text-gray-600 mt-1">Card subtitle</p> -->
					<!-- Descripción con altura fija y botón para mostrar más -->
					<div class="relative">
						<p :class="{
							'line-clamp-3': !isExpanded[curso.idCurso] && curso.descripcion.length > 165,
							'line-clamp-none': isExpanded[curso.idCurso],
							'text-gray-700': true
						}">
							{{ curso.descripcion }}
						</p>
						<!-- Solo mostrar el botón si la descripción es más larga de 165 caracteres -->
						<button v-if="curso.descripcion.length > 165" @click="toggleExpand(curso.idCurso)"
							class="absolute -bottom-6 right-0 text-blue-500 mt-2">
							{{ isExpanded[curso.idCurso] ? '...Ver menos' : '...Ver más' }}
						</button>
					</div>
					<div class="flex flex-col md:flex-row gap-4 mt-7 md:mt-4">
						<Message severity="warn" icon="pi pi-clock">
							<Tag severity="warn" :value="`${curso.duracion} hora(s).`"></Tag>
						</Message>
						<Message severity="info" icon="pi pi-money-bill">
							<Tag severity="success" :value="`${curso.precio} Bs.`"></Tag>
						</Message>

						<Message severity="secondary" rounded>
						<Tag v-if="curso.estado === 1" value="Activo" severity="success" class="px-2 py-1" />
						<Tag v-else-if="curso.estado === 0" value="Eliminado" severity="danger" class="px-2 py-1" />
						<Tag v-else-if="curso.estado === 2" value="Inactivo" severity="warn" class="px-2 py-1" />
						<Tag v-else value="Desconocido" severity="warning" class="px-2 py-1" />
						</Message>
					</div>
				</div>
			</div>
		</div>
		<!-- <div
			class="max-w-md p-4 mx-auto mt-4 bg-gray-200 sm:shadow-md sm::rounded-md sm:bg-gray-100 sm:p-6 md:bg-green-100">
			<h2 class="text-lg font-semibold text-center text-blue-500 sm:text-xl">Me adapto a todo</h2>
			<p class="mt-3 text-gray-600">Esta caja es adaptable. Diseño primero para las dimensiones pequeñas y voy
				aumentando para las grandes.</p>
		</div> -->
		<div class="flex justify-between items-center mt-6">
			<Tag severity="info" :value="`Total de cursos: ${cursos.length}`" />
			<Button label="Cerrar" @click="closeDialog" />
		</div>
	</div>
</template>


<script setup>
import { inject, ref } from 'vue';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Tag from 'primevue/tag';

// Estado para controlar la expansión de cada descripción individualmente
const isExpanded = ref({});

const dialogRef = inject('dialogRef');
const cursos = dialogRef.value?.data?.cursos || []; // Protege contra datos undefined
const nombreCompleto = dialogRef.value?.data?.nombreCompleto || '';
// mostrar en todo el array en formato texto
console.log(JSON.stringify(cursos, null, 2));

const closeDialog = () => {
	dialogRef.value.close(); // Cierra el diálogo dinámico
};

const toggleExpand = (idCurso) => {
	isExpanded.value[idCurso] = !isExpanded.value[idCurso];
};
</script>



<style scoped>
/* Utiliza line-clamp para truncar el texto después de cierto número de líneas */
.line-clamp-3 {
	display: -webkit-box;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	-webkit-line-clamp: 3;
	/* Número de líneas visibles antes del truncamiento */
}

.line-clamp-none {
	display: block;
}
</style>
