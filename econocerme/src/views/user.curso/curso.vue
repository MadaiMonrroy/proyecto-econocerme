<template>
  <div :class="['relative grid h-screen w-full transition-all', { 'grid-cols-1': !sidebarOpen, 'md:grid-cols-[300px_1fr]': sidebarOpen }]">
    <!-- Panel Izquierdo -->
    <div :class="['bg-muted/40 border-r p-4 overflow-auto transition-all', { 'hidden': !sidebarOpen, 'w-72': sidebarOpen }]">
      <button @click="toggleSidebar" class="text-sm bg-muted-foreground p-3 rounded-md hover:bg-muted absolute top-4 -left-10 z-50">
        {{ sidebarOpen ? "<<" : ">>" }}
      </button>
      <div v-if="sidebarOpen" class="mt-12 space-y-4">
        <h2 class="text-2xl font-bold">Capítulos</h2>
        <div class="grid gap-2">
          <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
            <span class="font-medium">Introducción a React</span>
          </button>
          <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
            <span class="font-medium">Configuración del entorno de desarrollo</span>
          </button>
          <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
            <span class="font-medium">Componentes en React</span>
          </button>
          <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
            <span class="font-medium">Manejo de estado</span>
          </button>
          <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
            <span class="font-medium">Enrutamiento en React</span>
          </button>
          <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
            <span class="font-medium">Consumo de APIs</span>
          </button>
          <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
            <span class="font-medium">Despliegue de aplicaciones React</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Botón de Expansión del Panel Izquierdo -->
    <button @click="toggleSidebar" class="text-sm bg-muted-foreground p-3 rounded-md hover:bg-muted absolute top-4 -left-10 z-50">
      {{ sidebarOpen ? "<<" : ">>" }}
    </button>

    <!-- Panel Derecho con Video y Detalles -->
    <div class="flex flex-col w-full h-full">
      <div class="relative flex-1">
        <video
          ref="videoRef"
          class="w-full h-full object-cover"
          src="https://res.cloudinary.com/dgzjotfzz/video/upload/v1722029075/planta_baja_v5ynh9.mp4"
          controls="false"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button @click="handlePlay" class="w-8 h-8 hover:bg-black/50">
              {{ isPlaying ? 'Pause' : 'Play' }}
            </button>
            <input type="range" v-model="currentTime" @input="handleSeek" :max="duration" class="flex-1" />
            <div class="text-sm text-white">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="handleMute" class="w-8 h-8 hover:bg-black/50">
              {{ isMuted ? 'Unmute' : 'Mute' }}
            </button>
            <input type="range" v-model="volume" @input="handleVolumeChange" max="100" class="w-20" />
            <button @click="handleFullscreen" class="w-8 h-8 hover:bg-black/50">
              {{ isFullscreen ? 'Minimize' : 'Fullscreen' }}
            </button>
          </div>
        </div>
      </div>
      <div class="p-6 flex-1 overflow-auto">
        <div class="space-y-4">
          <h1 class="text-3xl font-bold">Introducción a React</h1>
          <p class="text-muted-foreground">
            En este curso aprenderás los conceptos fundamentales de React, una de las bibliotecas de JavaScript más
            populares para el desarrollo de aplicaciones web.
          </p>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-1 text-muted-foreground">
              <span>4h 30m</span>
            </div>
            <div class="flex items-center gap-1 text-muted-foreground">
              <span>12,345 estudiantes</span>
            </div>
            <div class="flex items-center gap-1 text-muted-foreground">
              <span>4.8</span>
            </div>
          </div>
        </div>
        <Separator class="my-6" />
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Contenido del curso</h2>
          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">Introducción a React</span>
              </div>
              <span class="text-muted-foreground">10:24</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">Configuración del entorno de desarrollo</span>
              </div>
              <span class="text-muted-foreground">15:32</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">Componentes en React</span>
              </div>
              <span class="text-muted-foreground">22:18</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">Manejo de estado</span>
              </div>
              <span class="text-muted-foreground">30:45</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">Enrutamiento en React</span>
              </div>
              <span class="text-muted-foreground">25:12</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">Consumo de APIs</span>
              </div>
              <span class="text-muted-foreground">35:00</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="font-medium">Despliegue de aplicaciones React</span>
              </div>
              <span class="text-muted-foreground">18:42</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";

export default {
  name: "CourseView",
  setup() {
    const videoRef = ref(null);
    const isPlaying = ref(false);
    const isMuted = ref(false);
    const isFullscreen = ref(false);
    const volume = ref(50);
    const currentTime = ref(0);
    const duration = ref(0);
    const sidebarOpen = ref(true);

    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value;
    };

    onMounted(() => {
      if (videoRef.value) {
        videoRef.value.volume = volume.value / 100;
        videoRef.value.addEventListener("timeupdate", updateTime);
        videoRef.value.addEventListener("loadedmetadata", updateDuration);
      }
    });

    onBeforeUnmount(() => {
      if (videoRef.value) {
        videoRef.value.removeEventListener("timeupdate", updateTime);
        videoRef.value.removeEventListener("loadedmetadata", updateDuration);
      }
    });

    const handlePlay = () => {
      if (videoRef.value) {
        if (isPlaying.value) {
          videoRef.value.pause();
        } else {
          videoRef.value.play();
        }
        isPlaying.value = !isPlaying.value;
      }
    };

    const handleMute = () => {
      if (videoRef.value) {
        videoRef.value.muted = !isMuted.value;
        isMuted.value = !isMuted.value;
      }
    };

    const handleVolumeChange = () => {
      if (videoRef.value) {
        videoRef.value.volume = volume.value / 100;
      }
    };

    const handleSeek = () => {
      if (videoRef.value) {
        videoRef.value.currentTime = currentTime.value;
      }
    };

    const handleFullscreen = () => {
      if (videoRef.value) {
        if (isFullscreen.value) {
          document.exitFullscreen();
        } else {
          videoRef.value.requestFullscreen();
        }
        isFullscreen.value = !isFullscreen.value;
      }
    };

    const updateTime = () => {
      currentTime.value = videoRef.value.currentTime;
    };

    const updateDuration = () => {
      duration.value = videoRef.value.duration;
    };

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return {
      videoRef,
      isPlaying,
      isMuted,
      isFullscreen,
      volume,
      currentTime,
      duration,
      handlePlay,
      handleMute,
      handleVolumeChange,
      handleSeek,
      handleFullscreen,
      toggleSidebar,
      formatTime,
      sidebarOpen,
    };
  },
};
</script>

<style scoped>
/* Estilo para centrar el contenido del video */
video {
  object-fit: cover; /* Asegura que el contenido del video se ajuste y llene el contenedor */
}

/* Estilo para el botón de expansión */
button {
  transition: background-color 0.3s ease;
}

/* Posicionar el botón fuera del panel y sobre el video */
button {
  position: absolute;
  top: 50%;
  left: -24px; /* Ajustar el valor según el tamaño del botón */
  transform: translateY(-50%);
  z-index: 50;
  background-color: #333; /* Cambiar según el diseño deseado */
  color: white;
  border-radius: 50%;
  width: 40px; /* Ajustar tamaño según sea necesario */
  height: 40px; /* Ajustar tamaño según sea necesario */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>
