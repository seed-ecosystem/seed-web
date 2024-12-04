import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {App} from "@/components/App.tsx";
import {createLogic} from "@/modules/umbrella/logic/logic.ts";

const logic = await createLogic();
const chat = logic.createChat();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App chat={chat}/>
  </StrictMode>
)
