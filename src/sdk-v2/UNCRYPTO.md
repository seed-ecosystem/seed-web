# Uncrypto

We want to keep our protocol as easy as it can be to implement. To achieve that,
we decided to send plain text data in the same format that we send encrypted
data. This helps us with keeping all the data in a single table under the hood
and in a single `send` request for all the messages. I believe that there is
no point in maintaining 2 separate methods solely for this purpose.

