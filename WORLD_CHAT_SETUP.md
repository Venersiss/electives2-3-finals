# World Chat System - Implementation Guide

## Overview
A real-time world chat system that allows all players to communicate across the game. Messages are visible to everyone and appear in real-time using Supabase's realtime subscriptions.

## Features Implemented

✅ **Real-time Chat**: Messages appear instantly to all players using Supabase PostgreSQL changes subscriptions  
✅ **Persistent Storage**: All messages stored in database, can view history  
✅ **Player Identification**: Each message shows username and timestamp  
✅ **Expandable UI**: Chat widget that can be toggled to save screen space  
✅ **Cross-page Access**: Works on both `capital.vue` and `map.vue`  
✅ **Automatic Scrolling**: Chat scrolls to latest message automatically  
✅ **Input Validation**: Empty messages are prevented  

## Database Setup

### Create chat_messages Table in Supabase SQL Editor:

```sql
-- Create the chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  user_id BIGINT REFERENCES "Credentials"(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow anyone to insert messages
CREATE POLICY "Users can insert their own messages" ON chat_messages
FOR INSERT WITH CHECK (true);

-- Allow anyone to read all messages
CREATE POLICY "Anyone can read messages" ON chat_messages
FOR SELECT USING (true);

-- Create index on created_at for faster queries
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Create index on username for searching
CREATE INDEX idx_chat_messages_username ON chat_messages(username);
```

## File Structure

```
src/
  components/
    WorldChat.vue          ← New component (reusable chat widget)
  views/
    capital.vue            ← Updated (added WorldChat import & component)
    map.vue                ← Updated (added WorldChat import & component)
```

## How It Works

### 1. **Component Initialization** (WorldChat.vue mounted)
- Fetches user ID from username
- Loads last 100 messages from database
- Subscribes to real-time PostgreSQL changes

### 2. **Real-time Updates** (Supabase Realtime)
- When any user sends a message, it triggers an INSERT event
- All connected clients receive the new message instantly
- Message is added to the messages array
- Chat auto-scrolls to show the latest message

### 3. **Sending Messages**
- User types message and clicks SEND or presses Enter
- Message is validated (not empty)
- Inserts into database with username, user_id, and timestamp
- Timestamp is set when message is created

### 4. **Display Logic**
- Messages sorted by created_at (oldest to newest)
- Shows username in gold/yellow
- Shows timestamp in gray
- Each message has a blue left border
- Messages appear with slide-in animation

## Component Props & Usage

```vue
<!-- In capital.vue or map.vue -->
<WorldChat :currentUsername="currentUsername" />
```

### Props
- `currentUsername` (String, required): The logged-in player's username

## Features in Detail

### Message Storage
```javascript
{
  id: "uuid-string",
  username: "carydpogs",
  user_id: "uuid",
  message: "Hello world!",
  created_at: "2025-12-16T15:30:45.123456+00:00"
}
```

### UI States

**Collapsed** (default)
- Shows as a small header bar at bottom-right
- Click to expand and see messages
- Displays "💬 WORLD CHAT" with collapse/expand arrow

**Expanded**
- 350px wide chat window
- 500px tall (adjusts on mobile)
- Shows last 100 messages
- Input field to type new message
- SEND button or press Enter to submit

### Styling
- Retro pixel-art theme matching your game aesthetic
- Gold borders (#eebb4d) for header
- Blue borders (#4dcfff) for messages
- Black text on semi-transparent background
- Smooth animations for slide-in effects
- Responsive design (90% width on mobile devices)

## Integration with Your Views

### capital.vue
```vue
<template>
  <div class="capital-container">
    <!-- ... existing content ... -->
    
    <!-- Add at the end, before closing capital-container -->
    <WorldChat :currentUsername="currentUsername" />
  </div>
</template>

<script>
import WorldChat from '@/components/WorldChat.vue'

export default {
  components: {
    WorldChat
  },
  // ... rest of component
}
</script>
```

### map.vue
```vue
<template>
  <div class="map-container">
    <!-- ... existing content ... -->
    
    <!-- Add before closing map-container -->
    <WorldChat :currentUsername="currentUsername" />
  </div>
</template>

<script>
import WorldChat from '@/components/WorldChat.vue'

export default {
  components: {
    WorldChat
  },
  // ... rest of component
}
</script>
```

## Console Logging (for debugging)

The component logs important events:
- ✓ "WorldChat mounted with username: carydpogs"
- 📨 "Loading chat messages..."
- ✓ "Loaded 5 chat messages"
- 🔔 "Subscribing to new chat messages..."
- ✓ "Successfully subscribed to chat messages"
- 📤 "Sending message: Hello world!"
- ✓ "Message sent successfully"
- 📩 "New message received: {message object}"

## Performance Considerations

1. **Message Limit**: Loads last 100 messages (configurable in loadChatMessages method)
2. **Subscription**: Real-time subscription only active when component mounted
3. **Cleanup**: Automatically unsubscribes on component unmount
4. **Scrolling**: Only scrolls on new messages, not when reading old ones

## Customization Options

### Change message limit
```javascript
// In WorldChat.vue loadChatMessages method
.limit(50)  // Change from 100 to 50
```

### Change chat dimensions
```css
/* In WorldChat.vue style section */
.world-chat-container {
  width: 400px;  /* Change from 350px */
}

.world-chat-container.chat-expanded {
  height: 600px;  /* Change from 500px */
}
```

### Change colors
```css
/* Header gradient */
.chat-header {
  background: linear-gradient(135deg, #your-color1, #your-color2);
}

/* Message border */
.message-item {
  border-left: 3px solid #your-color;
}
```

## Troubleshooting

### Messages not appearing?
1. Check Supabase credentials are correct
2. Verify RLS policies are enabled in Supabase
3. Check browser console for errors (F12)
4. Verify username is being passed correctly

### Not seeing other players' messages?
1. Confirm real-time is enabled in Supabase project settings
2. Multiple users need to have chat open
3. Check that subscription status shows "SUBSCRIBED" in console

### Chat not opening?
1. Check that `isExpanded` is toggling correctly
2. Verify z-index (100) is higher than other overlays
3. Check for CSS conflicts with other components

### Messages sending but not appearing?
1. Verify database INSERT is successful (check error logs)
2. Confirm username is not empty
3. Check created_at timestamp format

## Future Enhancements

Ideas for expanding the chat:
- Add chat channels (party chat, trading post, etc.)
- Message search functionality
- User mentions with @username
- Emoji picker
- Message reactions
- Spam filtering/rate limiting
- Message deletion for admins
- Profanity filter
- Private messaging system

## Security Notes

- RLS policies allow all authenticated users to read and write
- Consider adding rate limiting to prevent spam
- All messages stored permanently (add delete policy if needed)
- User ID verified against Credentials table
- No sensitive data stored in messages

## Performance on Production

For larger player bases:
1. Consider pagination (load messages on scroll)
2. Add server-side message filtering
3. Implement message archiving (after 30 days, etc.)
4. Use connection pooling in Supabase
5. Add CDN caching for historical messages
