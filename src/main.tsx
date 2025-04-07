import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import App from "./pages/App.tsx";
import Viewer from "./pages/Viewer.tsx";
import Layout from "./pages/Layout.tsx";
import Prepare from "./pages/Prepare.tsx";
import Load from "./pages/Load.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Prepare />}/>
                    <Route path="/assessment" element={<App />}/>
                    <Route path="/viewer" element={<Viewer />}/>
                    {/* <Route path="/test" element={<Test />}/> */}
                    <Route path="/load" element={<Load />}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
