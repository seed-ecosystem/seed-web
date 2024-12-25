# Socket

This directory provides a websocket implementation with some features on 
top of it that are required to implement Seed Protocol, such as:

- Auto-Reconnect

- Guaranteed Delivery – if socket is reconnected, request is still
  to be sent as soon as connection restores

- Bounded requests – requests that can be automatically resent
  in the case of reconnection
