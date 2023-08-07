# Chat - Proof Of Concept 

## Introduction

This is a proof of concept for new chat data structure.

## Development

Minimal data export are injected to project.

We can use Firebase emulator suite to check it locally.

Run Emulator

```
cd demo
firebase emulators:start --import=./firebase-export --export-on-exit
```

Run Application

```
cd demo
npm run dev
```

## Data Structure

```
/buildings/{buildingId}/users/6R0MijpK6M4AIrwaaCY2
{
    _id: "6R0MijpK6M4AIrwaaCY2",
    avatar: "https://66.media.tumblr.com/avatar_c6a8eae4303e_512.pnj",
    username: "Luke"
}

/buildings/{buildingId}/rooms/k0EJ7xzkgot8D9XZSDXE
{
    lastUpdated: Mon Aug 07 2023 14:25:59 GMT+0300 (Israel Daylight Time),
    typingUsers: [],
    users: [
        "6R0MijpK6M4AIrwaaCY2",
        "SGmFnBZB4xxMv9V4CVlW",
        "6jMsIXUrBHBj7o2cRlau",
    ]
}

/buildings/{buildingId}/rooms/k0EJ7xzkgot8D9XZSDXE/messages/RAsAPAK2Bp8sfFK6pKWw
{
    content: "ABC"
    seen: {
        6R0MijpK6M4AIrwaaCY2 : Mon Aug 07 2023 14:25:47 GMT+0300 (Israel Daylight Time)
        SGmFnBZB4xxMv9V4CVlW : Mon Aug 07 2023 14:25:54 GMT+0300 (Israel Daylight Time)
    }
    sender_id: "6jMsIXUrBHBj7o2cRlau"
    timestamp: Mon Aug 07 2023 14:25:47 GMT+0300 (Israel Daylight Time)
}
```