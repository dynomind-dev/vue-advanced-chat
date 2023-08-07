import { firestoreDb } from '@/database'

import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	deleteField,
	doc,
	endAt,
	getDoc,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
	setDoc,
	startAfter,
	startAt,
	updateDoc,
	where
} from 'firebase/firestore'

const BUILDINGS_PATH = 'buildings'
const USERS_PATH = 'users'
const USER_PATH = buildingId => {
	return `${BUILDINGS_PATH}/${buildingId}/${USERS_PATH}`
}
const ROOMS_PATH = 'rooms'
const ROOM_PATH = buildingId => {
	return `${BUILDINGS_PATH}/${buildingId}/${ROOMS_PATH}`
}
const MESSAGES_PATH = 'messages'
const MESSAGE_PATH = (buildingId, roomId) => {
	return `${ROOM_PATH(buildingId)}/${roomId}/${MESSAGES_PATH}`
}

const TIMESTAMP_FIELD = 'timestamp'
const LAST_UPDATED_FIELD = 'lastUpdated'
const TYPING_USERS_FIELD = 'typingUsers'
const MESSAGE_REACTIONS_FIELD = 'reactions'
const ROOM_USERS_FIELD = 'users'

export const firestoreListener = onSnapshot
export const deleteDbField = deleteField()

const getDocuments = query => {
	return getDocs(query).then(docs => {
		return { data: formatQueryDataArray(docs), docs: docs.docs }
	})
}

const getDocument = ref => {
	return getDoc(ref).then(doc => formatQueryDataObject(doc))
}

const addDocument = (ref, data) => {
	return addDoc(ref, data)
}

const setDocument = (path, docId, data) => {
	return setDoc(doc(firestoreDb, path, docId), data)
}

const updateDocument = (ref, data) => {
	return updateDoc(ref, data)
}

const deleteDocument = (ref, docId) => {
	return deleteDoc(doc(firestoreDb, ref, docId))
}

// USERS
const usersRef = collection(firestoreDb, USERS_PATH)

const userRef = (buildingId, userId) => {
	return doc(firestoreDb, BUILDINGS_PATH, buildingId, USERS_PATH, userId)
}

export const getAllUsers = () => {
	return getDocuments(query(usersRef))
}

export const getUser = (buildingId, userId) => {
	return getDocument(userRef(buildingId, userId))
}

export const addUser = data => {
	return addDocument(usersRef, data)
}

export const addIdentifiedUser = (buildingId, userId, data) => {
	return setDocument(USER_PATH(buildingId), userId, data)
}

export const updateUser = (buildingId, userId, data) => {
	return updateDocument(userRef(buildingId, userId), data)
}

export const deleteUser = userId => {
	return deleteDocument(USERS_PATH, userId)
}

// ROOMS
const roomsRef = buildingId => {
	return collection(firestoreDb, BUILDINGS_PATH, buildingId, ROOMS_PATH)
}

const roomRef = (buildingId, roomId) => {
	return doc(firestoreDb, BUILDINGS_PATH, buildingId, ROOMS_PATH, roomId)
}

export const roomsQuery = (
	buildingId,
	currentUserId,
	roomsPerPage,
	lastRoom
) => {
	if (lastRoom) {
		return query(
			roomsRef(buildingId),
			where(USERS_PATH, 'array-contains', currentUserId),
			orderBy(LAST_UPDATED_FIELD, 'desc'),
			limit(roomsPerPage),
			startAfter(lastRoom)
		)
	} else {
		return query(
			roomsRef(buildingId),
			where(USERS_PATH, 'array-contains', currentUserId),
			orderBy(LAST_UPDATED_FIELD, 'desc'),
			limit(roomsPerPage)
		)
	}
}

export const getAllRooms = buildingId => {
	return getDocuments(query(roomsRef(buildingId)))
}

export const getRooms = query => {
	return getDocuments(query)
}

export const addRoom = (buildingId, data) => {
	return addDocument(roomsRef(buildingId), data)
}

export const updateRoom = (buildingId, roomId, data) => {
	return updateDocument(roomRef(buildingId, roomId), data)
}

export const deleteRoom = (buildingId, roomId) => {
	return deleteDocument(ROOM_PATH(buildingId), roomId)
}

export const getUserRooms = (buildingId, currentUserId, userId) => {
	return getDocuments(
		query(
			roomsRef(buildingId),
			where(USERS_PATH, '==', [currentUserId, userId])
		)
	)
}

export const addRoomUser = (buildingId, roomId, userId) => {
	return updateRoom(buildingId, roomId, {
		[ROOM_USERS_FIELD]: arrayUnion(userId)
	})
}

export const removeRoomUser = (buildingId, roomId, userId) => {
	return updateRoom(buildingId, roomId, {
		[ROOM_USERS_FIELD]: arrayRemove(userId)
	})
}

export const updateRoomTypingUsers = (
	buildingId,
	roomId,
	currentUserId,
	action
) => {
	const arrayUpdate =
		action === 'add' ? arrayUnion(currentUserId) : arrayRemove(currentUserId)

	return updateRoom(buildingId, roomId, { [TYPING_USERS_FIELD]: arrayUpdate })
}

// MESSAGES
const messagesRef = (buildingId, roomId) => {
	return collection(firestoreDb, MESSAGE_PATH(buildingId, roomId))
}

const messageRef = (buildingId, roomId, messageId) => {
	return doc(firestoreDb, MESSAGE_PATH(buildingId, roomId), messageId)
}

export const getMessages = (
	buildingId,
	roomId,
	messagesPerPage,
	lastLoadedMessage
) => {
	if (lastLoadedMessage) {
		return getDocuments(
			query(
				messagesRef(buildingId, roomId),
				orderBy(TIMESTAMP_FIELD, 'desc'),
				limit(messagesPerPage),
				startAfter(lastLoadedMessage)
			)
		)
	} else if (messagesPerPage) {
		return getDocuments(
			query(
				messagesRef(buildingId, roomId),
				orderBy(TIMESTAMP_FIELD, 'desc'),
				limit(messagesPerPage)
			)
		)
	} else {
		return getDocuments(messagesRef(buildingId, roomId))
	}
}

export const getMessage = (buildingId, roomId, messageId) => {
	return getDocument(messageRef(buildingId, roomId, messageId))
}

export const addMessage = (buildingId, roomId, data) => {
	return addDocument(messagesRef(buildingId, roomId), data)
}

export const updateMessage = (buildingId, roomId, messageId, data) => {
	return updateDocument(messageRef(buildingId, roomId, messageId), data)
}

export const deleteMessage = (buildingId, roomId, messageId) => {
	return deleteDocument(MESSAGE_PATH(buildingId, roomId), messageId)
}

export const listenRooms = (query, callback) => {
	return firestoreListener(query, rooms => {
		callback(formatQueryDataArray(rooms))
	})
}

export const paginatedMessagesQuery = (
	buildingId,
	roomId,
	lastLoadedMessage,
	previousLastLoadedMessage
) => {
	if (lastLoadedMessage && previousLastLoadedMessage) {
		return query(
			messagesRef(buildingId, roomId),
			orderBy(TIMESTAMP_FIELD),
			startAt(lastLoadedMessage),
			endAt(previousLastLoadedMessage)
		)
	} else if (lastLoadedMessage) {
		return query(
			messagesRef(buildingId, roomId),
			orderBy(TIMESTAMP_FIELD),
			startAt(lastLoadedMessage)
		)
	} else if (previousLastLoadedMessage) {
		return query(
			messagesRef(buildingId, roomId),
			orderBy(TIMESTAMP_FIELD),
			endAt(previousLastLoadedMessage)
		)
	} else {
		return query(messagesRef(buildingId, roomId), orderBy(TIMESTAMP_FIELD))
	}
}

export const listenMessages = (
	buildingId,
	roomId,
	lastLoadedMessage,
	previousLastLoadedMessage,
	callback
) => {
	return firestoreListener(
		paginatedMessagesQuery(
			buildingId,
			roomId,
			lastLoadedMessage,
			previousLastLoadedMessage
		),
		messages => {
			callback(formatQueryDataArray(messages))
		}
	)
}

const formatQueryDataObject = queryData => {
	return { ...queryData.data(), id: queryData.id }
}

const formatQueryDataArray = queryDataArray => {
	const formattedData = []

	queryDataArray.forEach(data => {
		formattedData.push(formatQueryDataObject(data))
	})
	return formattedData
}

const lastMessageQuery = (buildingId, roomId) => {
	return query(
		messagesRef(buildingId, roomId),
		orderBy(TIMESTAMP_FIELD, 'desc'),
		limit(1)
	)
}

export const listenLastMessage = (buildingId, roomId, callback) => {
	return firestoreListener(
		query(lastMessageQuery(buildingId, roomId)),
		messages => {
			callback(formatQueryDataArray(messages))
		}
	)
}

export const updateMessageReactions = (
	buildingId,
	roomId,
	messageId,
	currentUserId,
	reactionUnicode,
	action
) => {
	const arrayUpdate =
		action === 'add' ? arrayUnion(currentUserId) : arrayRemove(currentUserId)

	return updateMessage(buildingId, roomId, messageId, {
		[`${MESSAGE_REACTIONS_FIELD}.${reactionUnicode}`]: arrayUpdate
	})
}
