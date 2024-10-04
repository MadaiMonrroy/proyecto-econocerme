// router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

import LoginForm from "@/views/auth/loginForm.vue";
import RegistroForm from "@/views/auth/formularioRegistro.vue";
import panelControl from "@/components/panelControl.vue";
import administradores from "@/views/adm.usuarios/admins.vue";
import coaches from "@/views/adm.usuarios/coaches.vue";
import estudiantes from "@/views/adm.usuarios/estudiantes.vue";
import cursos from "@/views/adm.cursos/cursos.vue";
import listaCursos from "@/views/listaCursos.vue";
import modulos from "@/views/adm.cursos/modulos.vue";
import formCurso from "@/views/adm.cursos/formCurso.vue";
import anuncios from "@/views/adm.anuncios/anuncios.vue";
import formAnuncio from "@/views/adm.anuncios/formAnuncio.vue";
import inscripciones from "@/views/adm.inscripciones/inscripciones.vue";
import formInscripcion from "@/views/adm.inscripciones/formInscripcion.vue";
import panelCoaches from "@/components/panelCoaches.vue";
import menuUser from "@/components/menuUser.vue";
import prueba from "@/components/pruebas.vue";
import curso from "@/views/user.curso/curso.vue";
import main from "@/views/main.vue";
import lecciones from "@/views/adm.cursos/lecciones.vue";
import ConfirmarUsuario from "@/views/adm.usuarios/ConfirmarUsuario.vue";
import panelEstudiante from "@/components/panelEstudiante.vue";
import misCursos from "@/views/est.cursos/misCursos.vue";
import dashboard from "@/views/est.cursos/dashboard.vue";
import certificaciones from "@/views/est.cursos/certificaciones.vue";
import panelCurso from "@/components/panelCurso.vue";
import contenidoLeccion from "@/views/est.cursos/contenidoLeccion.vue";
import contenidoModulo from "@/views/est.cursos/contenidoModulo.vue";
import evaluacion from "@/views/adm.cursos/evaluacion.vue";
import formEvaluacion from "@/views/adm.cursos/formEvaluacion.vue";
import cuotas from "@/views/adm.inscripciones/cuotas.vue";
import formEdit from "@/views/adm.usuarios/formEdit.vue";
import vistaPrevia from "@/views/adm.cursos/vistaPreviaEvalua.vue";
import detalleInscripcion from "@/views/adm.inscripciones/detalleInscripcion.vue";
import reciboPago from "@/views/adm.inscripciones/reciboPago.vue";
import preInscripciones from "@/views/adm.inscripciones/preInscripciones.vue";
import verMas from "@/views/est.cursos/verMas.vue";
const routes = [
  { path: "/", component: LoginForm },
  { path: "/Registro", component: RegistroForm },
  {
    path: "/panelControl",
    component: panelControl,
    meta: { requiresAuth: true },
    children: [
      { path: "administradores", component: administradores },
      { path: "coaches", component: coaches },
      { path: "estudiantes", component: estudiantes },
      { path: "cursos", component: cursos },
      { path: "modulos", component: listaCursos },
      { path: "lecciones/:idModulo", component: lecciones },
      { path: "modulos/:idCurso", component: modulos },
      { path: "formCurso", component: formCurso }, // Ruta para agregar curso
      { path: "formCurso/:idCurso", component: formCurso },
      { path: "anuncios", component: anuncios }, // Ruta para editar curso
      { path: "formAnuncio", component: formAnuncio }, // Ruta para agregar curso
      { path: "formAnuncio/:id", component: formAnuncio },
      { path: "prueba", component: prueba },
      { path: "main", component: main },
      { path: "formEdit", component: formEdit },
      { path: "inscripciones", component: inscripciones },
      { path: "preInscripciones", component: preInscripciones },
      { path: "formInscripcion", component: formInscripcion },
      { path: "formInscripcion/:idInscripcion", component: formInscripcion },
      { path: "evaluacion/:idCurso", component: evaluacion },
      { path: "vistaPrevia/:idCurso", component: vistaPrevia },
      { path: "cuotas/:idInscripcion", component: cuotas },
      {
        path: "detalleInscripcion/:idInscripcion",
        component: detalleInscripcion,
      },
    ],
  },
  { path: "/generarPdf/:idInscripcion", component: reciboPago },

  {
    path: "/panelEstudiante",
    component: panelEstudiante,
    meta: { requiresAuth: true },
    children: [
      { path: "dashboard", component: dashboard },
      { path: "verMasCurso/:idCurso", component: verMas },
      { path: "misCursos", component: misCursos },
      { path: "formEdit", component: formEdit },
      { path: "certificaciones", component: certificaciones },
      {
        path: "panelCurso/:id",
        component: panelCurso,
        children: [
          { path: "modulo/:idModulo", component: contenidoModulo },
          { path: "leccion/:idLeccion", component: contenidoLeccion },
        ],
      },
    ],
  },
  {
    path: "/panelCoaches",
    component: panelCoaches,
    meta: { requiresAuth: true },
    children: [
      { path: "formEdit", component: formEdit },
      { path: "cursos", component: cursos },
      { path: "modulos", component: listaCursos },
      { path: "lecciones/:idModulo", component: lecciones },
      { path: "modulos/:idCurso", component: modulos },
      { path: "formCurso", component: formCurso }, // Ruta para agregar curso
      { path: "formCurso/:idCurso", component: formCurso },
      { path: "anuncios", component: anuncios }, // Ruta para editar curso
      { path: "formAnuncio", component: formAnuncio }, // Ruta para agregar curso
      { path: "formAnuncio/:id", component: formAnuncio },
      { path: "evaluacion/:idCurso", component: evaluacion },
    ],
  },
  { path: "/menuUser", component: menuUser },
  { path: "/prueba", component: prueba },
  { path: "/confirmar/:token", component: ConfirmarUsuario },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // Aquí agregamos el scrollBehavior
  scrollBehavior(to, from, savedPosition) {
    // Si hay una posición guardada (navegación hacia atrás/adelante), vuelve a esa posición
    if (savedPosition) {
      return savedPosition;
    } else {
      // Si no, vuelve a la parte superior de la página
      return { top: 0 };
    }
  },
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole; // Obtener el rol del usuario
  // console.log('Navigating to:', to.path);
  // console.log('Authenticated:', isAuthenticated);
  // console.log('User Role:', userRole);

  if (
    !isAuthenticated &&
    to.matched.some((record) => record.meta.requiresAuth)
  ) {
    next("/"); // Si no está autenticado y la ruta requiere autenticación, redirige al login
  } else {
    // Verifica los roles según las rutas
    if (to.path.startsWith("/panelControl") && userRole !== "admin") {
      next("/"); // Si no es administrador, redirige
    } else if (to.path.startsWith("/panelCoaches") && userRole !== "coach") {
      next("/"); // Si no es coach, redirige
    } else if (
      to.path.startsWith("/panelEstudiante") &&
      userRole !== "usuario"
    ) {
      next("/"); // Si no es estudiante, redirige
    } else {
      next(); // Si tiene acceso, permite la navegación
    }
  }
});

export default router;
