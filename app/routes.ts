import { type RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/home.tsx",
    index: true,
  },
  {
    path: "/auth",
    file: "routes/auth.tsx",
  }
] satisfies RouteConfig;
