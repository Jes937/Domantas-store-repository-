import { serve } from "bun";
import index from "./index.html";

//Dev server for the React client
const server = serve({
  port:3000,
  routes: {
    //Send all routes to React Router
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
