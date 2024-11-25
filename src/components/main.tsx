import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {MessagesListScreen} from "@/components/messages-list/MessagesListScreen.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MessagesListScreen messages={[
      {
        nonce: { server: 0 },
        isSending: false,
        content: {
          title: "Mark",
          text: "ZOV!",
        },
        isAuthor: true
      }, {
        nonce: { server: 0 },
        isSending: false,
        content: {
          title: "Alex",
          text: "Penis!",
        },
        isAuthor: true
      }
    ]}/>
  </StrictMode>
)
