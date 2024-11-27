import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {ChatScreen} from "@/components/chat/ChatScreen.tsx";
import {createAppDependencies} from "@/components/AppDependencies.ts";
import {App} from "@/components/App.tsx";

const app = await createAppDependencies();
const chat = app.createChat();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App app={app} chat={chat}/>
  </StrictMode>
)
