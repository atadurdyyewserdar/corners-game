import { Router, Route, RootRoute, RouterProvider } from '@tanstack/react-router'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import './App.css'

const rootRoute = new RootRoute()

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const notFoundRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
})

const routeTree = rootRoute.addChildren([homeRoute, notFoundRoute])

const router = new Router({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  return <RouterProvider router={router} />
}

export default App