import { createBrowserRouter, RouterProvider } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { LoginPage } from "./pages/LoginPage";
import "./index.css";

//All routes in the app. Add new pages under children
const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: "*", element: <LoginPage /> },
            { path: "*", element: <NotFoundPage /> },
            
        ],
    },
]);

export function App() {
  return <RouterProvider router={router} />;
}

export default App;
