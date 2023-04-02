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
import logging
import re
from typing import Dict, List

import openai
import tiktoken

from metta.data.firestore import Entry


class ChatGPTQAGenerator:
    """A Chat GPT QA Generator can generate a series of question and answer pairs, from
    text.
    """

    def __init__(self, prompt="", model_name="gpt-3.5-turbo", max_tokens=4097) -> None:
        self.model = model_name
        self.starting_prompt = open(prompt, "r", encoding="utf-8").read()
        self.max_tokens = max_tokens

    def _encode_messages(self, source_text: str) -> List[Dict]:
        """Encode multiple prompt instructions into a message for ChatGPT."""
        prompt = self.starting_prompt + "\n"
        prompt += source_text
        return [{"role": "user", "content": prompt}]

    def _num_tokens_from_messages(self, messages: List[Dict]) -> int:
        """Returns the number of tokens used by a list of messages.

        Note: Not all models are capable of counting the tokens, and it
        might not be 'exact'
        """
        try:
            encoding = tiktoken.encoding_for_model(self.model)
        except KeyError:
            encoding = tiktoken.get_encoding("cl100k_base")
        num_tokens = 0
        for message in messages:
            num_tokens += (
                4  # every message follows <im_start>{role/name}\n{content}<im_end>\n
            )
            for key, value in message.items():
                num_tokens += len(encoding.encode(value))
                if key == "name":  # if there's a name, the role is omitted
                    num_tokens += -1  # role is always required and always 1 token
        num_tokens += 2  # every reply is primed with <im_start>assistant
        return num_tokens

    def process_single_answer(self, result: Dict) -> List[Entry]:
        """Process a single answer from open AI's chat model.

        This expects the Q&A to have the following format:
        1. Question
        - Answer

        2. Question
        - Answer

        Make sure you prompt the AI to generate this format.
        """
        text = result["message"]["content"]
        entries = []
        question = ""
        answer = ""

        for line in text.splitlines():
            line = line.strip()
            if line == "":
                continue
            if re.match(r"\d+\.", line):
                question = line[line.index(".") + 1 :].strip()
            elif line.startswith("-"):
                answer = line[2:].strip()
                if question and answer:
                    entry = Entry(
                        id="",
                        question=question,
                        answer=answer,
                        created_by=self.model,
                    )
                    entries.append(entry)
                    question = ""
                    answer = ""

        # If the tokenizer ran out of space we might have a partial
        # answer, if so we remove it.
        if result["finish_reason"] == "length" and answer:
            entries.pop()
        return entries

    def process_reply(self, results: List[Dict]) -> List[Entry]:
        replies = []
        for result in results:
            replies += self.process_single_answer(result)
        return replies

    def ask_ai(self, source_text: str) -> List[Entry]:
        messages = self._encode_messages(source_text)
        logging.info("Using %s as messages", messages)

        # Note it looks like we are off a bit..
        entry_tokens = self._num_tokens_from_messages(messages)
        max_tokens = self.max_tokens - int(1.05 * entry_tokens)
        logging.debug(
            "The question requires %s tokens, +/- %s left for Q&A generation",
            entry_tokens,
            max_tokens,
        )
        for attempt in range(0, 5):
            try:
                logging.debug("Attempt %s", attempt)
                completion = openai.ChatCompletion.create(
                    model=self.model, max_tokens=max_tokens, messages=messages
                )
                return completion.choices
            except openai.error.OpenAIError as e:
                if e.code == "context_length_exceeded":
                    logging.info("Exceeded token length.. reducing request size.")
                    max_tokens = int(max_tokens * 0.9)
                else:
                    logging.warning("OpenAIError: %s.", e)
                    raise

    def generate_questions(self, source_text: str) -> List[Entry]:
        if not source_text:
            raise ValueError("No source text provided.")
        results = self.ask_ai(source_text)
        logging.info("OpenAI (%s): %s", self.model, results)
        return self.process_reply(results)
