import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/LoginPage";
import "./index.css";
import { EmployeesPage } from "./pages/EmployeesPage";

//All routes in the app. Add new pages under children
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "login", element: <LoginPage /> },
            { path: "employees", element: <EmployeesPage />},
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
