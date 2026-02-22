import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId="740227334215-obur9ajh3ev10fv4pv59uiaif8nnq7c2.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </BrowserRouter>
);
