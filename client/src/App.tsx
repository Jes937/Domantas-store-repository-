import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/LoginPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { ApplyPage } from "./pages/ApplyPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";

import SchedulePage from "./pages/SchedulePage";
import "./index.css";
import {RequireLogin} from "@/RequireLogin.tsx";

//All routes in the app. Pages that need a login go inside RequireLogin
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { path: "login", element: <LoginPage /> },
            {
                element: <RequireLogin />,
                children: [
                    { index: true, element: <HomePage /> },

                    { path: "apply", element: <ApplyPage /> },

                    { path: "users/:userId/schedule", element: <SchedulePage /> },

                    { path: "employees", element: <EmployeesPage /> },

                    { path: "approvals", element: <ApprovalsPage /> },
                ],
            },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

export function App() {
    return <RouterProvider router={router} />;
}

export default App;