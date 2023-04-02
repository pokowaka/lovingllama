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

import click

from metta.ai.qa_generator import ChatGPTQAGenerator
from metta.data.firestore import Firestore
from tqdm import tqdm

@click.group()
@click.option("--verbose/--no-verbose", default=False, help="Log more verbose")
@click.option("--log-to-file", default=None, help="File to write logs to.")
@click.pass_context
def cli(ctx, verbose, log_to_file):
    ctx.ensure_object(dict)
    logging.basicConfig(
        format="%(asctime)s %(levelname)s:%(message)s",
        filename=log_to_file,
        level=logging.DEBUG if verbose else logging.INFO,
    )


@cli.command()
@click.argument("field")
@click.argument("op_string")
@click.argument("value")
def query(field: str, op_string: str, value: str):
    """Query firestore for entries.

    <field> A field path (.-delimited list of field names) for the field to filter on.

    <op_string> A comparison operation in the form of a string. Acceptable values are <, <=, ==, >=, >, and in.

    <value> The value to compare the field against in the filter. If value is :data:None or a NaN, then == is the only allowed operation. If op_string is in, value must be a sequence of values.

    For example:

        query created_by "==" "gpt-3.5-turbo"

    Should list all the entries created by the gpt-3.5-turbo model
    """
    store = Firestore()
    for entry in store.query(field, op_string, value):
        print(entry)


@cli.command()
def list():
    """List all entries in firestore"""
    store = Firestore()
    for entry in store.list():
        print(entry)


@cli.command()
@click.argument("fname")
def export(fname):
    """Export all entries from the store for training your own model to the given
    filename in the json format."""
    store = Firestore()
    entries = [entry for entry in store.list()]
    with open(fname, "w", encoding="utf-8") as f:
        f.write(json.dumps(entries))


@cli.command
@click.argument("id")
def get(id: str):
    """Gets the entry with the given id."""
    store = Firestore()
    print(store.get(id))


@cli.command
@click.option(
    "--prompt",
    default="Generate 20 numbered questions and answers",
    help="prompt prefix to use",
)
@click.argument("id")
@click.option(
    "--save/--no-save", default=True, help="Save the generated questions to the store"
)
def generate(prompt: str, id: str, save: bool):
    """
    Generate a set of questions from the entry with the given id.

    The .context field of the entry will be used to generate the set of questions.

    Created entries will be written to the database.
    """
    ai = ChatGPTQAGenerator(prompt=prompt)
    store = Firestore()
    entry = store.get(id)
    for qanda in ai.generate_questions(entry.context):
        qanda.generated_by = entry.id
        if save:
            ts, ref = store.add(qanda)
            qanda.id = ref.get().id
        print(qanda)


@cli.command
@click.option(
    "--save/--no-save", default=True, help="Save the generated questions to the store"
)
@click.option(
    "--prompt",
    default="Generate 20 numbered questions and answers",
    help="prompt prefix to use",
)
@click.argument("field")
@click.argument("op_string")
@click.argument("value")
def generate_query(prompt: str, field: str, op_string: str, value: str, save: bool):
    """
    Generate a set of questions entry that matches the given query.
    The .context field of the entry will be used to generate the set of questions.
    Created entries will be written to the database.

    <field> A field path (.-delimited list of field names) for the field to filter on.

    <op_string> A comparison operation in the form of a string. Acceptable values are <, <=, ==, >=, >, and in.

    <value> The value to compare the field against in the filter. If value is :data:None or a NaN, then == is the only allowed operation. If op_string is in, value must be a sequence of values.
    """
    ai = ChatGPTQAGenerator(prompt=prompt)
    store = Firestore()

    for entry in tqdm(store.query(field, op_string, value)):
        for qanda in ai.generate_questions(entry.context):
            qanda.generated_by = entry.id
            if save:
                ts, ref = store.add(qanda)
                qanda.id = ref.get().id
            print(qanda)


if __name__ == "__main__":
    cli(obj={})
