import {
  createRouter,
  createWebHistory,
  type RouteLocationNormalizedLoaded,
} from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ForgotPasswordView from '@/views/auth/pages/ForgotPasswordView.vue'
import LoginView from '@/views/auth/pages/LoginView.vue'
import RegisterView from '@/views/auth/pages/RegisterView.vue'
import ResetPasswordView from '@/views/auth/pages/ResetPasswordView.vue'
import AdminLayout from '@/views/admin/layout/AdminLayout.vue'
import FrontLayout from '@/views/front/layout/FrontLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: FrontLayout,
      children: [
        {
          path: 'cursos',
          name: 'public-courses',
          meta: { title: 'Cursos' },
          component: () => import('@/views/front/pages/PublicCourses.vue'),
        },
        {
          path: 'cursos/:slug/cadastro',
          name: 'public-course-register',
          meta: { title: 'Cadastro no curso' },
          component: () => import('@/views/front/pages/PublicCourseRegister.vue'),
        },
      ],
    },

    {
      path: '/dashboard',
      component: AdminLayout,
      meta: { requiredAuth: true, title: 'Dashboard' },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/admin/pages/home/IndexHome.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          meta: { title: 'Perfil' },
          component: () => import('@/views/admin/pages/profile/IndexProfile.vue'),
        },
        {
          path: 'profile/change-password',
          name: 'change-password',
          meta: { title: 'Trocar senha' },
          component: () => import('@/views/admin/pages/profile/ChangePassword.vue'),
        },
        {
          path: 'users',
          name: 'users',
          meta: { title: 'Usuarios', permission: 'users.read' },
          component: () => import('@/views/admin/pages/user/IndexUser.vue'),
        },
        {
          path: 'users/create',
          name: 'users-create',
          meta: { title: 'Criar usuario', permission: 'users.create' },
          component: () => import('@/views/admin/pages/user/CreateUser.vue'),
        },
        {
          path: 'users/:id/edit',
          name: 'users-edit',
          meta: { title: 'Editar usuario', permission: 'users.update' },
          component: () => import('@/views/admin/pages/user/EditUser.vue'),
        },
        {
          path: 'users/:id/delete',
          name: 'users-delete',
          meta: { title: 'Excluir usuario', permission: 'users.delete' },
          component: () => import('@/views/admin/pages/user/DeleteUser.vue'),
        },
        {
          path: 'roles',
          name: 'roles',
          meta: { title: 'Roles', permission: 'roles.read' },
          component: () => import('@/views/admin/pages/role/IndexRole.vue'),
        },
        {
          path: 'roles/create',
          name: 'roles-create',
          meta: { title: 'Criar role', permission: 'roles.create' },
          component: () => import('@/views/admin/pages/role/CreateRole.vue'),
        },
        {
          path: 'roles/:id/edit',
          name: 'roles-edit',
          meta: { title: 'Editar role', permission: 'roles.update' },
          component: () => import('@/views/admin/pages/role/EditRole.vue'),
        },
        {
          path: 'roles/:id/delete',
          name: 'roles-delete',
          meta: { title: 'Excluir role', permission: 'roles.delete' },
          component: () => import('@/views/admin/pages/role/DeleteRole.vue'),
        },
        {
          path: 'permissions',
          name: 'permissions',
          meta: { title: 'Permissoes', permission: 'permissions.read' },
          component: () => import('@/views/admin/pages/permission/IndexPermission.vue'),
        },
        {
          path: 'permissions/create',
          name: 'permissions-create',
          meta: { title: 'Criar permissao', permission: 'permissions.create' },
          component: () => import('@/views/admin/pages/permission/CreatePermission.vue'),
        },
        {
          path: 'permissions/:id/edit',
          name: 'permissions-edit',
          meta: { title: 'Editar permissao', permission: 'permissions.update' },
          component: () => import('@/views/admin/pages/permission/EditPermission.vue'),
        },
        {
          path: 'permissions/:id/delete',
          name: 'permissions-delete',
          meta: { title: 'Excluir permissao', permission: 'permissions.delete' },
          component: () => import('@/views/admin/pages/permission/DeletePermission.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          meta: { title: 'Settings', permission: 'settings.read' },
          component: () => import('@/views/admin/pages/setting/IndexSetting.vue'),
        },
        {
          path: 'settings/create',
          name: 'settings-create',
          meta: { title: 'Criar setting', permission: 'settings.create' },
          component: () => import('@/views/admin/pages/setting/CreateSetting.vue'),
        },
        {
          path: 'settings/:id/edit',
          name: 'settings-edit',
          meta: { title: 'Editar setting', permission: 'settings.update' },
          component: () => import('@/views/admin/pages/setting/EditSetting.vue'),
        },
        {
          path: 'settings/:id/delete',
          name: 'settings-delete',
          meta: { title: 'Excluir setting', permission: 'settings.delete' },
          component: () => import('@/views/admin/pages/setting/DeleteSetting.vue'),
        },
        {
          path: 'videos',
          name: 'videos',
          meta: { title: 'Videos', permission: 'videos.read' },
          component: () => import('@/views/admin/pages/video/IndexVideo.vue'),
        },
        {
          path: 'videos/create',
          name: 'videos-create',
          meta: { title: 'Novo video', permission: 'videos.create' },
          component: () => import('@/views/admin/pages/video/CreateVideo.vue'),
        },
        {
          path: 'videos/:id/view',
          name: 'videos-view',
          meta: { title: 'Visualizar video', permission: 'videos.read' },
          component: () => import('@/views/admin/pages/video/ViewVideo.vue'),
        },
        {
          path: 'videos/:id/edit',
          name: 'videos-edit',
          meta: { title: 'Editar video', permission: 'videos.update' },
          component: () => import('@/views/admin/pages/video/EditVideo.vue'),
        },
        {
          path: 'folders',
          name: 'folders',
          meta: { title: 'Folders', permission: 'folders.read' },
          component: () => import('@/views/admin/pages/folder/IndexFolder.vue'),
        },
        {
          path: 'folders/:id/edit',
          name: 'folders-edit',
          meta: { title: 'Editar folder', permission: 'folders.update' },
          component: () => import('@/views/admin/pages/folder/EditFolder.vue'),
        },
        {
          path: 'folders/:id/delete',
          name: 'folders-delete',
          meta: { title: 'Excluir folder', permission: 'folders.delete' },
          component: () => import('@/views/admin/pages/folder/DeleteFolder.vue'),
        },
        {
          path: 'categories',
          name: 'categories',
          meta: { title: 'Categorias', permission: 'categories.read' },
          component: () => import('@/views/admin/pages/category/IndexCategory.vue'),
        },
        {
          path: 'categories/create',
          name: 'categories-create',
          meta: { title: 'Nova categoria', permission: 'categories.create' },
          component: () => import('@/views/admin/pages/category/CreateCategory.vue'),
        },
        {
          path: 'categories/:id/edit',
          name: 'categories-edit',
          meta: { title: 'Editar categoria', permission: 'categories.update' },
          component: () => import('@/views/admin/pages/category/EditCategory.vue'),
        },
        {
          path: 'categories/:id/delete',
          name: 'categories-delete',
          meta: { title: 'Excluir categoria', permission: 'categories.delete' },
          component: () => import('@/views/admin/pages/category/DeleteCategory.vue'),
        },
        {
          path: 'courses',
          name: 'courses',
          meta: { title: 'Cursos', permission: 'courses.read' },
          component: () => import('@/views/admin/pages/course/IndexCourse.vue'),
        },
        {
          path: 'my-courses',
          name: 'my-courses',
          meta: { title: 'Meus cursos' },
          component: () => import('@/views/admin/pages/course/MyCourses.vue'),
        },
        {
          path: 'courses/create',
          name: 'courses-create',
          meta: { title: 'Novo curso', permission: 'courses.create' },
          component: () => import('@/views/admin/pages/course/CreateCourse.vue'),
        },
        {
          path: 'courses/:id/edit',
          name: 'courses-edit',
          meta: { title: 'Editar curso', permission: 'courses.update' },
          component: () => import('@/views/admin/pages/course/EditCourse.vue'),
        },
        {
          path: 'courses/:id/enrollments',
          name: 'courses-enrollments',
          meta: { title: 'Matriculas do curso', permission: 'courses.update' },
          component: () => import('@/views/admin/pages/course/EnrollCourse.vue'),
        },
        {
          path: 'courses/:id/delete',
          name: 'courses-delete',
          meta: { title: 'Excluir curso', permission: 'courses.delete' },
          component: () => import('@/views/admin/pages/course/DeleteCourse.vue'),
        },
      ],
    },
    {
      path: '',
      redirect: '/auth/login',
    },
    {
      path: '/register',
      redirect: '/auth/register',
    },

    {
      path: '/auth/login',
      name: 'Login',
      component: LoginView,
      meta: {
        title: 'Login',
        guestOnly: true,
      },
    },
    {
      path: '/auth/forgot-password',
      name: 'ForgotPassword',
      component: ForgotPasswordView,
      meta: {
        title: 'Recuperar senha',
        guestOnly: true,
      },
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: ResetPasswordView,
      meta: {
        title: 'Redefinir senha',
        guestOnly: true,
      },
    },
    {
      path: '/auth/register',
      name: 'Register',
      component: RegisterView,
      meta: {
        title: 'Cadastro',
        guestOnly: true,
      },
    },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

function getRouteTitle(to: RouteLocationNormalizedLoaded) {
  const matchedTitle = [...to.matched]
    .reverse()
    .find((item) => typeof item.meta?.title === 'string' && item.meta.title.trim())
    ?.meta.title

  if (typeof matchedTitle === 'string') {
    return matchedTitle
  }

  if (typeof to.name === 'string' && to.name.trim()) {
    return to.name
  }

  return 'Sistema'
}

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiredAuth && !authStore.isAuthenticated) {
    return {
      path: '/auth/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  const permission = to.meta.permission

  if (
    typeof permission === 'string' &&
    authStore.isAuthenticated &&
    !authStore.hasPermission(permission)
  ) {
    return '/dashboard'
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return '/dashboard'
  }

  return true
})

router.afterEach((to, from, failure) => {
  if (!failure) {
    document.title = `${getRouteTitle(to)} | Gestao IDI`
    setTimeout(() => window.HSStaticMethods?.autoInit(), 100)
  }
})

export default router
