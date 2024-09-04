// router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

import LoginForm from '@/views/auth/loginForm.vue';
import RegistroForm from '@/views/auth/formularioRegistro.vue';
import panelControl from '@/components/panelControl.vue';
import usuarios from '@/views/adm.usuarios/usuarios.vue';
import coaches from '@/views/adm.usuarios/coaches.vue';
import estudiantes from '@/views/adm.usuarios/estudiantes.vue';
import cursos from '@/views/adm.cursos/cursos.vue';
import listaCursos from '@/views/listaCursos.vue';
import modulos from '@/views/adm.cursos/modulos.vue';
import formCurso from '@/views/adm.cursos/formCurso.vue';
import anuncios from '@/views/adm.anuncios/anuncios.vue';
import formAnuncio from '@/views/adm.anuncios/formAnuncio.vue'; 
import inscripciones from '@/views/adm.inscripciones/inscripciones.vue';
import formInscripcion from '@/views/adm.inscripciones/formInscripcion.vue';
import panelUsuario from '@/components/panelUsuario.vue';
import menuUser from '@/components/menuUser.vue';
import prueba from '@/components/pruebas.vue';
import curso from '@/views/user.curso/curso.vue';
import main from '@/views/main.vue';
import ConfirmarUsuario from '@/views/adm.usuarios/ConfirmarUsuario.vue';


const routes = [
  { path: '/', component: LoginForm },
  { path: '/Registro', component: RegistroForm },
  { path: '/panelControl', component: panelControl, meta: { requiresAuth: true },
    children: [
      { path: 'usuarios', component: usuarios },
      { path: 'coaches', component: coaches },
      { path: 'estudiantes', component: estudiantes },
      { path: 'cursos', component: cursos },
      { path: 'modulos', component: listaCursos },
      { path: 'modulos/:idCurso', component: modulos },
      { path: 'formCurso', component: formCurso },  // Ruta para agregar curso
      { path: 'formCurso/:idCurso', component: formCurso },
      { path: 'anuncios', component: anuncios },  // Ruta para editar curso
      { path: 'formAnuncio', component: formAnuncio },  // Ruta para agregar curso
      { path: 'formAnuncio/:id', component: formAnuncio },
      { path: 'prueba', component: prueba },
      { path: 'main', component: main },
      { path: 'inscripciones', component: inscripciones },
      { path: 'formInscripcion', component: formInscripcion },  
      ]
   },
  { path: '/panelUsuario', component: panelUsuario, 
    children: [
      { path: 'misCursos', component: curso },
    ]
  },
  { path: '/menuUser', component: menuUser },
  { path: '/prueba', component: prueba },
  { path: '/confirmar/:token', component: ConfirmarUsuario },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware para verificar la autenticación
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  console.log(`Navegando a: ${to.path}`); // Verificar a dónde intentas navegar
  console.log(`Requiere autenticación: ${to.matched.some(record => record.meta.requiresAuth)}`);
  console.log(`Autenticado: ${authStore.isAuthenticated}`);
  if (to.matched.some(record => record.meta.requiresAuth) && !authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
