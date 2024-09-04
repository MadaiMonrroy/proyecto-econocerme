<template>
  <div class="dashboard min-h-screen bg-gray-100">
    <!-- Topbar -->
    <div class="topbar flex justify-between items-center p-4 shadow-md bg-pink-500 text-white">
      <img src="@/assets/logoec.png" alt="Logo" class="logo w-12 h-auto" />

      <div class="menu-items flex items-center space-x-6">
        <!-- Mega Menu -->
        <MegaMenu :model="items" class="flex-1" />

        <!-- Search Bar -->
        <div class="relative">
          <InputIcon class="pi pi-search absolute top-2.5 left-3 text-gray-500" />
          <InputText
            v-model="searchValue"
            placeholder="Buscar"
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>

        <!-- Notification Icons -->
        <div class="notification-icons flex items-center gap-4">
          <OverlayBadge value="2">
            <i class="pi pi-bell text-2xl" />
          </OverlayBadge>
          <OverlayBadge value="4" severity="danger">
            <i class="pi pi-calendar text-2xl" />
          </OverlayBadge>
          <OverlayBadge severity="danger">
            <i class="pi pi-envelope text-2xl" />
          </OverlayBadge>
        </div>

        <!-- My Learning Button -->
        <Button label="Mi aprendizaje" class="bg-transparent text-white border-white" outlined />

        <!-- Avatar -->
        <Avatar icon="pi pi-user" class="ml-3 bg-white text-gray-700" size="large" shape="circle" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="content p-6">
      <div class="card bg-white shadow-lg rounded-lg p-6">
        <!-- Aquí se incluirá el contenido del curso -->
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MegaMenu from 'primevue/megamenu';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import OverlayBadge from 'primevue/overlaybadge';
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';

const items = ref([
  {
    label: 'Desarrollo Personal',
    icon: 'pi pi-user',
    items: [
      [
        {
          label: 'Amor Propio',
          icon: 'pi pi-heart',
          items: [
            { label: 'Autoaceptación', icon: 'pi pi-check' },
            { label: 'Autoconfianza', icon: 'pi pi-shield' },
            { label: 'Cuidado Personal', icon: 'pi pi-star' }
          ]
        }
      ],
      [
        {
          label: 'Inteligencia Emocional',
          icon: 'pi pi-brain',
          items: [
            { label: 'Autoconocimiento', icon: 'pi pi-info-circle' },
            { label: 'Gestión de Emociones', icon: 'pi pi-signal' },
            { label: 'Empatía', icon: 'pi pi-users' }
          ]
        }
      ],
      [
        {
          label: 'Motivación y Productividad',
          icon: 'pi pi-bolt',
          items: [
            { label: 'Establecimiento de Metas', icon: 'pi pi-target' },
            { label: 'Manejo del Tiempo', icon: 'pi pi-clock' },
            { label: 'Mindfulness', icon: 'pi pi-spell-check' }
          ]
        }
      ],
      [
        {
          label: 'Relaciones Personales',
          icon: 'pi pi-users',
          items: [
            { label: 'Comunicación Efectiva', icon: 'pi pi-comments' },
            { label: 'Resolución de Conflictos', icon: 'pi pi-exclamation-circle' },
            { label: 'Construcción de Relaciones', icon: 'pi pi-link' }
          ]
        }
      ]
    ]
  },
  {
    label: 'Habilidades de Vida',
    icon: 'pi pi-lifesaver',
    items: [
      [
        {
          label: 'Resiliencia',
          icon: 'pi pi-refresh',
          items: [
            { label: 'Superación de Obstáculos', icon: 'pi pi-arrow-up' },
            { label: 'Adaptación al Cambio', icon: 'pi pi-exchange' }
          ]
        }
      ],
      [
        {
          label: 'Creatividad',
          icon: 'pi pi-pencil',
          items: [
            { label: 'Pensamiento Creativo', icon: 'pi pi-lightbulb' },
            { label: 'Innovación', icon: 'pi pi-star' }
          ]
        }
      ],
      [
        {
          label: 'Autodisciplina',
          icon: 'pi pi-lock',
          items: [
            { label: 'Hábitos Saludables', icon: 'pi pi-check-circle' },
            { label: 'Control de Impulsos', icon: 'pi pi-snooze' }
          ]
        }
      ]
    ]
  },
  {
    label: 'Autodescubrimiento',
    icon: 'pi pi-search',
    items: [
      [
        {
          label: 'Coaching Personal',
          icon: 'pi pi-briefcase',
          items: [
            { label: 'Plan de Acción', icon: 'pi pi-calendar' },
            { label: 'Técnicas de Coaching', icon: 'pi pi-lightbulb' }
          ]
        }
      ],
      [
        {
          label: 'Técnicas de Meditación',
          icon: 'pi pi-meditation',
          items: [
            { label: 'Mindfulness', icon: 'pi pi-spell-check' },
            { label: 'Meditación Guiada', icon: 'pi pi-volume-up' }
          ]
        }
      ]
    ]
  }
]);

const searchValue = ref('');
</script>

<style scoped>
.dashboard {
  font-family: Arial, sans-serif;
  min-height: 100vh;
}

.topbar {
  background-color: #e91e63; /* Color rosa vibrante */
}

.logo {
  width: 50px;
}

.notification-icons .pi {
  color: white;
}

.button {
  color: white;
  border-color: white;
}

.avatar .pi {
  color: gray-700; /* Color del icono en el avatar */
}

.content {
  margin-top: 20px;
}

.card {
  margin-top: 20px;
}
</style>
