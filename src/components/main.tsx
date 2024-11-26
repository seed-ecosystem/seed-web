import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {ChatScreen} from "@/components/chat/ChatScreen.tsx";
import {createAppDependencies} from "@/components/AppDependencies.ts";

const app = await createAppDependencies();

const chat = { chatId: "bHKhl2cuQ01pDXSRaqq/OMJeDFJVNIY5YuQB2w7ve+c=" };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChatScreen app={app} chat={chat}/>
  </StrictMode>
)
