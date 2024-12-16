# Client

This directory contains Seed protocol implementation on
top of socket directory. It contains all the requests and
server events. 

However, in order to decode messages, you need access to storage, 
so this layer still operates with encoded messages opposed to worker
which works with database and can actually decode messages.
