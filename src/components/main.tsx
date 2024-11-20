import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {MessagesListScreen} from "@/components/messages-list/MessagesListScreen.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MessagesListScreen messages={[
      {
        title: "Alex",
        text: "Penis!",
        isAuthor: true
      }, {
        title: "Alex",
        text: "Xuy!",
        isAuthor: true
      }, {
        title: "Matt",
        text: "Ya Mangal!",
        isAuthor: false
      }, {
        title: "Mark",
        text: "ZV0!",
        isAuthor: false
      }
    ]}/>
  </StrictMode>
)
