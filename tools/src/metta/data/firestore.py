#  Copyright (C) 2023 Erwin Jansen
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
from typing import Dict, List, Union

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.collection import CollectionReference
from google.cloud.firestore_v1.document import DocumentReference
from google.cloud.firestore_v1.base_document import DocumentSnapshot
from metta.data.entry import Entry

class Firestore:
    def __init__(self) -> None:
        # Application Default credentials are automatically created.
        cred = credentials.Certificate("../firebase-admin.json")
        app = firebase_admin.initialize_app(cred)
        self.db = firestore.client()
        self.collection: CollectionReference = self.db.collection("entries")

    def get(self, id: str):
        return Entry.from_doc(self.collection.document(id))

    def list(self) -> List[Entry]:
        return map(Entry.from_doc, self.collection.list())

    def query(self, field: str, op_string: str, value: str) -> List[Entry]:
        """
        Returns a list of Entry objects from a Firestore collection that match the given filter criteria.

        :param field (str): A field path (.-delimited list of field names) for the field to filter on.
        :param op_string (str): A comparison operation in the form of a string. Acceptable values are <, <=, ==, >=, >, and in.
        :param value (str): The value to compare the field against in the filter. If value is None or a NaN, then == is the only allowed operation. If op_string is 'in', value must be a sequence of values.
        :return: A list of Entry objects that match the filter criteria.
        :rtype: List[Entry]
        """
        return map(Entry.from_doc, self.collection.where(field, op_string, value).get())

    def add(self, item: Entry):
        return self.collection.add(item.to_dict())

    def list(self) -> List[DocumentReference]:
        return map(Entry.from_doc, self.collection.list_documents())

    def update(self, item: Entry):
        return self.collection.add(item.to_dict())
