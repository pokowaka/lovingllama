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
import json
import logging
from typing import Dict, List, Union

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.collection import CollectionReference
from google.cloud.firestore_v1.document import DocumentReference
from google.cloud.firestore_v1.base_document import DocumentSnapshot


class Entry:
    """
    A class representing an entry in the Firestore database.

    Attributes:
        id (str): The ID of the entry.
        question (str): The question associated with the entry.
        answer (str): The answer associated with the entry.
        context (str): The context associated with the entry.
        generated_by (Union[str, None]): The ID entry which was used as a source.
        users (Dict[str, int]): A dictionary of user IDs and their ratings for the entry.
        created_by (str): The display name of the user who created the entry.
        created_by_uid (str): The ID of the user who created the entry.
        rating (float): The average rating of the entry.
    """

    def __init__(
        self,
        id: str,
        question: str,
        answer: str,
        context: str = "",
        generated_by: Union[str, None] = "",
        users: Dict[str, int] = {},
        created_by: str = "",
        created_by_uid: str = "",
    ):
        self.id = id
        self.question = question
        self.answer = answer
        self.context = context
        self.generated_by = generated_by
        self.users = users
        self.created_by = created_by
        self.created_by_uid = created_by_uid
        self.calculate_rating()

    def to_instruction(self) -> Dict:
        return {"instrcution": self.question, "input": "", "output": self.answer}

    def to_dict(self) -> Dict:
        return {
            "question": self.question,
            "answer": self.answer,
            "context": self.context,
            "generated_by": self.generated_by,
            "users": json.dumps(self.users),  # serialize to JSON
            "created_by": self.created_by,
            "created_by_uid": self.created_by_uid,
        }

    def __str__(self):
        if self.id:
            return f"Entry(id='{self.id}', question='{self.question}', answer='{self.answer}', context='{self.context}', generated_by='{self.generated_by}', users={self.users}, created_by='{self.created_by}', created_by_uid='{self.created_by_uid}', rating={self.rating})"
        return f"Q: {self.question},  A: {self.answer}"

    @classmethod
    def from_doc(cls, doc: DocumentReference) -> "Entry":
        logging.debug("Decoding %s", doc)
        if isinstance(doc, DocumentSnapshot):
            return Entry.from_dict(doc.id, doc.to_dict())
        else:
            return Entry.from_dict(doc.get().id, doc.get().to_dict())

    @classmethod
    def from_dict(cls, id: str, data: Dict) -> "Entry":
        parsed = {}
        try:
            parsed = json.loads(data.get("users", "{}"))  # deserialize from JSON
        except:
            pass

        obj = cls(
            id=id,
            question=data.get("question", ""),
            answer=data.get("answer", ""),
            context=data.get("context", ""),
            generated_by=data.get("generated_by", ""),
            users=parsed,
            created_by=data.get("created_by", ""),
            created_by_uid=data.get("created_by_uid", ""),
        )
        obj.calculate_rating()
        return obj

    def calculate_rating(self):
        if not self.users:
            self.rating = 0.0
        else:
            self.rating = sum(self.users.values()) / len(self.users)
