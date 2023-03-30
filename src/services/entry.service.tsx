import { firestore } from "../config/firebase"
import {
  collection,
  addDoc,
  DocumentReference,
  DocumentData,
  deleteDoc,
  query,
  getDocs,
  limit,
  startAfter,
  doc,
  Query,
  setDoc,
  getDoc,
  updateDoc,
  QueryDocumentSnapshot,
  CollectionReference,
} from "firebase/firestore"
import { UserInfo } from "firebase/auth"
import { IEntry } from "../types/Entry.type"
import IUser from "../types/User.type"

// This is just a helper to add the type to the db responses
const createCollection = <T = DocumentData,>(collectionName: string) => {
  return collection(firestore, collectionName) as CollectionReference<T>
}

const calculateAverageVotes = (users: Map<string, number> | null | undefined): number => {
  if (!users)
    return 0

  const values = Array.from(users.values())
  const totalVotes = values.reduce((acc, cur) => acc + cur, 0)
  const averageVotes = totalVotes / values.length
  return averageVotes
}

const serializeVotes = {
  serialize(users: Map<string, number> | null | undefined): string {
    console.log(`Serialize firestore ${users}`)
      
    const obj = users ? Object.fromEntries(users.entries()) : null
    return JSON.stringify(obj)
  },
  deserialize(data: string | null)  : Map<string, number>{
    console.log(`Deserialize firestore ${data}`)
    if (data && data.length > 0) return new Map(Object.entries(JSON.parse(data)))
    return new Map<string, number>()
  }
}

const entryConverter = {
    toFirestore(entry: IEntry): DocumentData {
      const { question, answer, context, generated_by, votes, users } = entry
      return {
        question: question,
        answer: answer,
        context: context,
        gnerated_by: generated_by,
        votes: votes,
        users: serializeVotes.serialize(entry.users)
      }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): IEntry {
      const data = snapshot.data()
      const id = snapshot.id
      const { question, answer, context, generated_by, votes, users } = data as {
        question: string
        answer: string
        context: string
        generated_by: string | null
        votes: number
        users: string | null
      }
      const userMap = serializeVotes.deserialize(users)
      const calculatedVotes = calculateAverageVotes(userMap)
      return {
        id,
        question,
        answer,
        context,
        generated_by,
        votes: calculatedVotes,
        users: userMap
      }
    },
  }

const entries = createCollection<IEntry>("entries").withConverter(entryConverter)
const users = createCollection<IUser>("users")

class UserDataService {
    async update(userEntryRef: DocumentReference<DocumentData>, entry: IEntry) {
      return setDoc(userEntryRef, entry, { merge: true })
    }

  async create(userInfo: UserInfo) {
  const user: IUser = {
    user: userInfo.uid,
    last_vote_id: "",
  }
  return await addDoc(users, user)
}

  async get(userInfo: UserInfo) {
  return doc(users, userInfo.uid)
}
}



class EntryDataService {
  async getAll(after: IEntry | null) {
    let docs: Query<IEntry>
    if (after) {
      docs = query(entries, startAfter(after), limit(25))
    } else {
      docs = query(entries, limit(25))
    }

    return getDocs(docs)
  }

  async get(id: string) {
    const docRef = doc(entries, id)
    return getDoc(docRef)
  }

  async create(entry: IEntry) {
    return addDoc(entries, entry)
  }

  async updateByRef(
    singleEntryRef: DocumentReference<DocumentData>,
    entry: IEntry
  ) {
    const averageVotes = calculateAverageVotes(entry.users)
    entry.votes = averageVotes
    return setDoc(singleEntryRef, entry, { merge: true })
  }

  async updateUserVote(entry: IEntry) {
    if (!entry.id) {
      throw new Error(`ERROR: no id in entry: ${entry}`)
    }
    const averageVotes = calculateAverageVotes(entry.users)
    const data = serializeVotes.serialize(entry.users)
    const entryRef = doc(entries, entry.id)
    console.log(`Updating ${data}`)
    updateDoc(entryRef, { votes: averageVotes, users: data })

  }

  async update(entry: IEntry) {
    if (!entry.id) {
      throw new Error(`ERROR: no id in entry: ${entry}`)
    }
    const entryRef = doc(entries, entry.id)
    return this.updateByRef(entryRef, entry)
  }

  async delete(singleEntryRef: DocumentReference<DocumentData>) {
    return deleteDoc(singleEntryRef)
  }

  async deleteById(id: string) {
    const entryRef = doc(entries, id)
    return deleteDoc(entryRef)
  }
}

export const entryService = new EntryDataService()
export const userService = new UserDataService()
export default entryService
