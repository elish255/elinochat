/* eslint-disable */
// @ts-nocheck
// Generated route tree. The TanStack Router plugin will regenerate this file.
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as RegisterRouteImport } from './routes/register'
import { Route as LoginRouteImport } from './routes/login'
import { Route as PaymentRouteImport } from './routes/payment'
import { Route as DashboardRouteImport } from './routes/dashboard'
import { Route as ChatNameRouteImport } from './routes/chat/$name'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as ApiAuthRegisterRouteImport } from './routes/api/auth/register'
import { Route as ApiAuthLoginRouteImport } from './routes/api/auth/login'
import { Route as ApiPaymentCreateRouteImport } from './routes/api/payment/create'
import { Route as ApiPaymentStatusRouteImport } from './routes/api/payment/status'
import { Route as ApiAdminUsersRouteImport } from './routes/api/admin/users'
import { Route as ApiAdminActionRouteImport } from './routes/api/admin/action'

const IndexRoute = IndexRouteImport.update({ id: '/', path: '/', getParentRoute: () => rootRouteImport } as any)
const RegisterRoute = RegisterRouteImport.update({ id: '/register', path: '/register', getParentRoute: () => rootRouteImport } as any)
const LoginRoute = LoginRouteImport.update({ id: '/login', path: '/login', getParentRoute: () => rootRouteImport } as any)
const PaymentRoute = PaymentRouteImport.update({ id: '/payment', path: '/payment', getParentRoute: () => rootRouteImport } as any)
const DashboardRoute = DashboardRouteImport.update({ id: '/dashboard', path: '/dashboard', getParentRoute: () => rootRouteImport } as any)
const ChatNameRoute = ChatNameRouteImport.update({ id: '/chat/$name', path: '/chat/$name', getParentRoute: () => rootRouteImport } as any)
const AdminRoute = AdminRouteImport.update({ id: '/admin', path: '/admin', getParentRoute: () => rootRouteImport } as any)
const ApiAuthRegisterRoute = ApiAuthRegisterRouteImport.update({ id: '/api/auth/register', path: '/api/auth/register', getParentRoute: () => rootRouteImport } as any)
const ApiAuthLoginRoute = ApiAuthLoginRouteImport.update({ id: '/api/auth/login', path: '/api/auth/login', getParentRoute: () => rootRouteImport } as any)
const ApiPaymentCreateRoute = ApiPaymentCreateRouteImport.update({ id: '/api/payment/create', path: '/api/payment/create', getParentRoute: () => rootRouteImport } as any)
const ApiPaymentStatusRoute = ApiPaymentStatusRouteImport.update({ id: '/api/payment/status', path: '/api/payment/status', getParentRoute: () => rootRouteImport } as any)
const ApiAdminUsersRoute = ApiAdminUsersRouteImport.update({ id: '/api/admin/users', path: '/api/admin/users', getParentRoute: () => rootRouteImport } as any)
const ApiAdminActionRoute = ApiAdminActionRouteImport.update({ id: '/api/admin/action', path: '/api/admin/action', getParentRoute: () => rootRouteImport } as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/register': typeof RegisterRoute
  '/login': typeof LoginRoute
  '/payment': typeof PaymentRoute
  '/dashboard': typeof DashboardRoute
  '/chat/$name': typeof ChatNameRoute
  '/admin': typeof AdminRoute
  '/api/auth/register': typeof ApiAuthRegisterRoute
  '/api/auth/login': typeof ApiAuthLoginRoute
  '/api/payment/create': typeof ApiPaymentCreateRoute
  '/api/payment/status': typeof ApiPaymentStatusRoute
  '/api/admin/users': typeof ApiAdminUsersRoute
  '/api/admin/action': typeof ApiAdminActionRoute
}
export interface FileRoutesByTo extends FileRoutesByFullPath {}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: keyof FileRoutesByFullPath
  fileRoutesByTo: FileRoutesByTo
  to: keyof FileRoutesByFullPath
  id: '__root__' | keyof FileRoutesByFullPath
  fileRoutesById: { __root__: typeof rootRouteImport } & FileRoutesByFullPath
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/register': { id: '/register'; path: '/register'; fullPath: '/register'; preLoaderRoute: typeof RegisterRouteImport; parentRoute: typeof rootRouteImport }
    '/login': { id: '/login'; path: '/login'; fullPath: '/login'; preLoaderRoute: typeof LoginRouteImport; parentRoute: typeof rootRouteImport }
    '/payment': { id: '/payment'; path: '/payment'; fullPath: '/payment'; preLoaderRoute: typeof PaymentRouteImport; parentRoute: typeof rootRouteImport }
    '/dashboard': { id: '/dashboard'; path: '/dashboard'; fullPath: '/dashboard'; preLoaderRoute: typeof DashboardRouteImport; parentRoute: typeof rootRouteImport }
    '/chat/$name': { id: '/chat/$name'; path: '/chat/$name'; fullPath: '/chat/$name'; preLoaderRoute: typeof ChatNameRouteImport; parentRoute: typeof rootRouteImport }
    '/admin': { id: '/admin'; path: '/admin'; fullPath: '/admin'; preLoaderRoute: typeof AdminRouteImport; parentRoute: typeof rootRouteImport }
    '/api/auth/register': { id: '/api/auth/register'; path: '/api/auth/register'; fullPath: '/api/auth/register'; preLoaderRoute: typeof ApiAuthRegisterRouteImport; parentRoute: typeof rootRouteImport }
    '/api/auth/login': { id: '/api/auth/login'; path: '/api/auth/login'; fullPath: '/api/auth/login'; preLoaderRoute: typeof ApiAuthLoginRouteImport; parentRoute: typeof rootRouteImport }
    '/api/payment/create': { id: '/api/payment/create'; path: '/api/payment/create'; fullPath: '/api/payment/create'; preLoaderRoute: typeof ApiPaymentCreateRouteImport; parentRoute: typeof rootRouteImport }
    '/api/payment/status': { id: '/api/payment/status'; path: '/api/payment/status'; fullPath: '/api/payment/status'; preLoaderRoute: typeof ApiPaymentStatusRouteImport; parentRoute: typeof rootRouteImport }
    '/api/admin/users': { id: '/api/admin/users'; path: '/api/admin/users'; fullPath: '/api/admin/users'; preLoaderRoute: typeof ApiAdminUsersRouteImport; parentRoute: typeof rootRouteImport }
    '/api/admin/action': { id: '/api/admin/action'; path: '/api/admin/action'; fullPath: '/api/admin/action'; preLoaderRoute: typeof ApiAdminActionRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren = {
  IndexRoute,
  RegisterRoute,
  LoginRoute,
  PaymentRoute,
  DashboardRoute,
  ChatNameRoute,
  AdminRoute,
  ApiAuthRegisterRoute,
  ApiAuthLoginRoute,
  ApiPaymentCreateRoute,
  ApiPaymentStatusRoute,
  ApiAdminUsersRoute,
  ApiAdminActionRoute,
}
export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
