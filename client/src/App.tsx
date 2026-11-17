
import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import "./index.css";

const router = createBrowserRouter([
    {
        children: [
            { index: true, element: <LoginPage /> },
            { path: "login", element: <LoginPage /> },
            { path: "/", element: <HomePage /> },
            { path: "users/:userId/schedule", element: <SchedulePage /> },
            { path: "*", element: <NotFoundPage /> },
        ],
    },
]);

export function App() {
    return <RouterProvider router={router} />;
}

export default App;
