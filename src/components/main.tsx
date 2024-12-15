import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {createLogic} from "@/modules/umbrella/logic/logic.ts";
import {App} from "@/modules/umbrella/components/app.tsx";
import {Router} from "wouter";

const logic = await createLogic();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router base="/seed-web">
      <App logic={logic}/>
    </Router>
  </StrictMode>
)
