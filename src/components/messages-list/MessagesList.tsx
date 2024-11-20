import {ChatBubble, ChatBubbleAvatar, ChatBubbleMessage} from "@/components/ui/chat/chat-bubble.tsx";
import {ChatMessage} from "@/components/messages-list/ChatMessage.ts";
import {ChatMessageList} from "@/components/ui/chat/chat-message-list.tsx";

export function MessagesList(
  {messages}: {
    messages: ChatMessage[];
  }
) {
  return <>
    <ChatMessageList>
      {messages.map((message) => {
        const variant = message.isAuthor ? 'sent' : 'received';

        return <ChatBubble variant={variant}>
          <ChatBubbleAvatar fallback={message.title}/>
          <ChatBubbleMessage variant={variant}>{message.text}</ChatBubbleMessage>
        </ChatBubble>
      })}
    </ChatMessageList>
  </>;
}
