import { createContext, useContext, useState, ReactNode } from 'react';

export type Route =
  | '/'
  | '/features'
  | '/pricing'
  | '/faq'
  | '/about'
  | '/contact'
  | '/privacy'
  | '/terms'
  | '/login'
  | '/register'
  | '/forgot-password'
  | '/dashboard'
  | '/dashboard/links'
  | '/dashboard/links/create'
  | '/dashboard/links/detail'
  | '/dashboard/analytics'
  | '/dashboard/settings'
  | '/dashboard/profile'
  | '/resources'
  | '/resources/article';

interface RouterCtx {
  route: Route;
  navigate: (r: Route) => void;
}

const Ctx = createContext<RouterCtx>({ route: '/', navigate: () => {} });

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>('/');
  return (
    <Ctx.Provider value={{ route, navigate: setRoute }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRouter() {
  return useContext(Ctx);
}
