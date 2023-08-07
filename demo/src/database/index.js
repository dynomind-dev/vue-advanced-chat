import { initializeApp } from 'firebase/app'
import {
	getAuth,
	connectAuthEmulator,
	signInWithCredential,
	GoogleAuthProvider
} from 'firebase/auth'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const config =
	import.meta.env.MODE === 'development'
		? JSON.parse(import.meta.env.VITE_APP_FIREBASE_CONFIG)
		: JSON.parse(import.meta.env.VITE_APP_FIREBASE_CONFIG_PUBLIC)

initializeApp(config)

export const auth = getAuth()
connectAuthEmulator(auth, 'http://127.0.0.1:4100')
export const firestoreDb = getFirestore()
connectFirestoreEmulator(firestoreDb, '127.0.0.1', 4101)
export const realtimeDb = getDatabase()
connectDatabaseEmulator(realtimeDb, '127.0.0.1', 4102)
export const storage = getStorage()
connectStorageEmulator(storage, '127.0.0.1', 4103)

export async function signIn(userId, name) {
	try {
		const result = await signInWithCredential(
			auth,
			GoogleAuthProvider.credential(JSON.stringify({ sub: userId, name }))
		)
		console.log(result.user.uid)
		console.log(await result.user.getIdTokenResult())
		return result
	} catch (error) {
		console.error(error)
	}
}
