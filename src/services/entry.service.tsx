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
import { IEntry } from "../types/Entry.type"

// This is just a helper to add the type to the db responses
const createCollection = <T = DocumentData,>(collectionName: string) => {
  return collection(firestore, collectionName) as CollectionReference<T>
}

const calculateRating = (users: Map<string, number> | null | undefined): number => {
  if (!users)
    return 0

  const values = Array.from(users.values())
  const totalVotes = values.reduce((acc, cur) => acc + cur, 0)
  const averageVotes = totalVotes / values.length
  return averageVotes
}

const userSerializer = {
  serialize(users: Map<string, number> | null | undefined): string {
    const obj = users ? Object.fromEntries(users.entries()) : null
    return JSON.stringify(obj)
  },
  deserialize(data: string | null): Map<string, number> {
    if (data && data.length > 0) return new Map(Object.entries(JSON.parse(data)))
    return new Map<string, number>()
  }
}

const entryConverter = {
  toFirestore(entry: IEntry): DocumentData {
    const { question, answer, context, generated_by, users, created_by, created_by_uid } = entry
    return {
      question: question,
      answer: answer,
      context: context,
      gnerated_by: generated_by,
      users: userSerializer.serialize(users),
      created_by: created_by,
      created_by_uid: created_by_uid
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>): IEntry {
    const data = snapshot.data()
    const id = snapshot.id
    const { question, answer, context, generated_by, users, created_by, created_by_uid } = data as {
      question: string
      answer: string
      context: string
      generated_by: string | null
      users: string | null,
      created_by: string | null,
      created_by_uid: string | null,
    }
    const userMap = userSerializer.deserialize(users)
    const calculatedVotes = calculateRating(userMap)
    return {
      id,
      question,
      answer,
      context,
      generated_by,
      rating: calculatedVotes,
      users: userMap,
      created_by: created_by ? created_by : "unknown",
      created_by_uid: created_by_uid ? created_by_uid : "unknown"
    }
  },
}

const entries = createCollection<IEntry>("entries").withConverter(entryConverter)

class EntryDataService {
  async getAll(after: IEntry | null) {
    let docs: Query<IEntry>
    if (after) {
      docs = query(entries, startAfter(after), limit(25))
    } else {
      docs = query(entries)
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
    return setDoc(singleEntryRef, entry, { merge: true })
  }

  async updateUserVote(entry: IEntry) {
    if (!entry.id) {
      throw new Error(`ERROR: no id in entry: ${entry}`)
    }
    const data = userSerializer.serialize(entry.users)
    const entryRef = doc(entries, entry.id)
    console.log(`Updating ${data}`)
    updateDoc(entryRef, { users: data })
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
export default entryService
