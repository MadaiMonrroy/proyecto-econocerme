<template>
    <div class="grid grid-cols-1 md:grid-cols-[1fr_300px] h-screen w-full">
      <div class="flex flex-col">
        <div class="aspect-video bg-muted rounded-lg overflow-hidden relative">
          <video
            ref="videoRef"
            class="w-full h-full object-cover"
            src="https://res.cloudinary.com/dgzjotfzz/video/upload/v1722029075/planta_baja_v5ynh9.mp4"
            controls="false"
          />
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button @click="handlePlay" class="w-8 h-8 hover:bg-black/50">
                <!-- Aquí puedes agregar tu icono de play/pausa -->
                <!-- <PauseIcon v-if="isPlaying" class="w-5 h-5 fill-white" /> -->
                <!-- <PlayIcon v-else class="w-5 h-5 fill-white" /> -->
                {{ isPlaying ? 'Pause' : 'Play' }}
              </button>
              <input type="range" v-model="currentTime" @input="handleSeek" :max="duration" class="flex-1" />
              <div class="text-sm text-white">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button @click="handleMute" class="w-8 h-8 hover:bg-black/50">
                <!-- Aquí puedes agregar tu icono de mute/volume -->
                <!-- <VolumeXIcon v-if="isMuted" class="w-5 h-5 fill-white" /> -->
                <!-- <Volume2Icon v-else class="w-5 h-5 fill-white" /> -->
                {{ isMuted ? 'Unmute' : 'Mute' }}
              </button>
              <input type="range" v-model="volume" @input="handleVolumeChange" max="100" class="w-20" />
              <button @click="handleFullscreen" class="w-8 h-8 hover:bg-black/50">
                <!-- Aquí puedes agregar tu icono de fullscreen/minimize -->
                <!-- <MinimizeIcon v-if="isFullscreen" class="w-5 h-5 fill-white" /> -->
                <!-- <MaximizeIcon v-else class="w-5 h-5 fill-white" /> -->
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
                <!-- <ClockIcon class="w-4 h-4" /> -->
                <span>4h 30m</span>
              </div>
              <div class="flex items-center gap-1 text-muted-foreground">
                <!-- <UsersIcon class="w-4 h-4" /> -->
                <span>12,345 estudiantes</span>
              </div>
              <div class="flex items-center gap-1 text-muted-foreground">
                <!-- <StarIcon class="w-4 h-4 fill-primary" /> -->
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
                  <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
                  <span class="font-medium">Introducción a React</span>
                </div>
                <span class="text-muted-foreground">10:24</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
                  <span class="font-medium">Configuración del entorno de desarrollo</span>
                </div>
                <span class="text-muted-foreground">15:32</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
                  <span class="font-medium">Componentes en React</span>
                </div>
                <span class="text-muted-foreground">22:18</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
                  <span class="font-medium">Manejo de estado</span>
                </div>
                <span class="text-muted-foreground">30:45</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
                  <span class="font-medium">Enrutamiento en React</span>
                </div>
                <span class="text-muted-foreground">25:12</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
                  <span class="font-medium">Consumo de APIs</span>
                </div>
                <span class="text-muted-foreground">35:00</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
                  <span class="font-medium">Despliegue de aplicaciones React</span>
                </div>
                <span class="text-muted-foreground">18:42</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-muted/40 border-l p-6 overflow-auto">
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Capítulos</h2>
          <div class="grid gap-2">
            <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
              <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
              <span class="font-medium">Introducción a React</span>
            </button>
            <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
              <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
              <span class="font-medium">Configuración del entorno de desarrollo</span>
            </button>
            <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
              <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
              <span class="font-medium">Componentes en React</span>
            </button>
            <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
              <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
              <span class="font-medium">Manejo de estado</span>
            </button>
            <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
              <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
              <span class="font-medium">Enrutamiento en React</span>
            </button>
            <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
              <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
              <span class="font-medium">Consumo de APIs</span>
            </button>
            <button class="justify-start gap-2 px-4 py-2 rounded-md hover:bg-muted/50">
              <!-- <PlayIcon class="w-4 h-4 text-muted-foreground" /> -->
              <span class="font-medium">Despliegue de aplicaciones React</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, onBeforeUnmount, reactive } from "vue";
  
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
        if (videoRef.value) {
          currentTime.value = videoRef.value.currentTime;
        }
      };
  
      const updateDuration = () => {
        if (videoRef.value) {
          duration.value = videoRef.value.duration;
        }
      };
  
      const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
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
        formatTime,
      };
    },
  };
  </script>
  
  <style scoped>
  /* Estilos adicionales aquí si es necesario */
  </style>
  