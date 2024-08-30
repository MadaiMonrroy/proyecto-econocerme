<template>
  <div class="dashboard">
    <div class="topbar flex justify-between items-center p-4 shadow">
      <img src="@/assets/logoec.png" alt="Logo" class="logo w-12 h-auto" />
      <div class="menu-items flex items-center space-x-4">
        <MegaMenu :model="items" class="flex-1" />
        <IconField>
          <InputIcon class="pi pi-search bg" />
          <InputText
            placeholder="Buscar"
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
          />
        </IconField>
        <div class="notification-icons flex items-center gap-3">
          <OverlayBadge value="2">
            <i class="pi pi-bell text-xl" />
          </OverlayBadge>
          <OverlayBadge value="4" severity="danger">
            <i class="pi pi-calendar text-xl" />
          </OverlayBadge>
          <OverlayBadge severity="danger">
            <i class="pi pi-envelope text-xl" />
          </OverlayBadge>
        </div>
        <div class="topbar flex justify-between items-center p-1 bg-white">
          <Button label="Mi aprendizaje" severity="secondary" size="medium" class="bg-white" outlined />
        </div>
        <Avatar icon="pi pi-user" class="ml-3" size="large" shape="circle" />
      </div>
    </div>
    <div class="content p-4">
      <div class="card bg-white shadow-md rounded-lg p-4">
        <!-- Contenido adicional aquí -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import MegaMenu from 'primevue/megamenu';
import IconField from 'primevue/iconfield';
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
}

.topbar {
  background-color: #ff69b4; /* Color rosa */
  color: white; /* Asegura que el texto sea legible */
}

.logo {
  width: 50px;
  height: auto;
}

.menu-items {
  display: flex;
  align-items: center;
}

.notification-icons .pi {
  color: white; /* Color blanco para los iconos */
}

.button {
  color: white; /* Color blanco para los botones */
}

.avatar .pi {
  color: white; /* Color blanco para los iconos de avatar */
}

.content {
  margin-top: 20px;
}

.card {
  margin-top: 20px;
}
</style>
