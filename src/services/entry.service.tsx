import { firestore } from "../config/firebase";
import {
  collection,
  addDoc,
  DocumentReference,
  DocumentData,
  deleteDoc,
  query,
  limit,
  startAfter,
  doc,
  setDoc,
  CollectionReference,
} from "firebase/firestore";
import { UserInfo } from "firebase/auth";
import IEntry from "../types/Entry.type";
import IUser from "../types/User.type";

// This is just a helper to add the type to the db responses
const createCollection = <T = DocumentData,>(collectionName: string) => {
  return collection(firestore, collectionName) as CollectionReference<T>;
};

const entries = createCollection<IEntry>("entries");
const users = createCollection<IUser>("users");

class UserDataService {
  async update(userEntryRef: DocumentReference<DocumentData>, entry: IEntry) {
    return setDoc(userEntryRef, entry, { merge: true });
  }

  async create(userInfo: UserInfo) {
    const user: IUser = {
      user: userInfo.uid,
      last_vote_id: "",
    };
    return await addDoc(users, user);
  }

  async get(userInfo: UserInfo) {
    return doc(users, userInfo.uid);
  }
}

class EntryDataService {
  async getAll(after: IEntry) {
    if (after) {
      return query(entries, startAfter(after), limit(25));
    }

    return query(entries, limit(25));
  }

  async create(entry: IEntry) {
    return await addDoc(entries, entry);
  }

  async update(singleEntryRef: DocumentReference<DocumentData>, entry: IEntry) {
    return setDoc(singleEntryRef, entry, { merge: true });
  }

  async delete(singleEntryRef: DocumentReference<DocumentData>) {
    return deleteDoc(singleEntryRef);
  }
}

export const entryService = new EntryDataService();
export const userService = new UserDataService();
export default entryService;
