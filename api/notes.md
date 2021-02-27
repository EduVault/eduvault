# notes

session renewal policy:
expiry is 2 days
expiry will renew on every request

jwt renewal policy:
JWT lasts for 30 days. Renew only after a day (>29 left). send back new and old jwt, in case they need the old jwt to unlock keys.
