import json
import sys
import threading
from pathlib import Path

import torch
from tokenizers import Tokenizer

# The story model lives in story_model/ next to this file (imports itself as `src`)
STORY_DIR = Path(__file__).resolve().parent / "story_model"
if str(STORY_DIR) not in sys.path:
    sys.path.insert(0, str(STORY_DIR))

from src.generation import generate  # noqa: E402
from src.transformer_lm import TransformerLM  # noqa: E402

TOKENIZER_PATH = STORY_DIR / "tokenizer" / "tokenizer.json"
WEIGHTS_PATH = STORY_DIR / "weights" / "final_model.pt"

DEFAULT_MAX_NEW_TOKENS = 256
MAX_NEW_TOKENS_LIMIT = 512

_model = None
_tokenizer = None
_load_lock = threading.Lock()


def _load_tokenizer():
    # tokenizer.json was saved by a newer `tokenizers` that stores BPE merges as
    # ["a", "b"] pairs; the pinned 0.15.x only reads "a b" strings, so convert here.
    data = json.loads(TOKENIZER_PATH.read_text(encoding="utf-8"))
    merges = data.get("model", {}).get("merges", [])
    if merges and isinstance(merges[0], list):
        data["model"]["merges"] = [" ".join(pair) for pair in merges]
    return Tokenizer.from_str(json.dumps(data))


def _load():
    """Load the model and tokenizer once, on first use."""
    global _model, _tokenizer
    if _model is not None:
        return _model, _tokenizer

    with _load_lock:
        if _model is None:
            tokenizer = _load_tokenizer()

            # Must match the settings used for training
            model = TransformerLM(
                vocab_size=8192,
                context_length=256,
                d_model=512,
                num_layers=4,
                n_q_heads=16,
                n_kv_heads=4,
                d_ff=1344,
                rope_theta=10000.0,
                norm_eps=1e-5,
                device=torch.device("cpu"),
            )
            state_dict = torch.load(WEIGHTS_PATH, map_location="cpu")
            model.load_state_dict(state_dict.get("model", state_dict))
            model.eval()

            _tokenizer = tokenizer
            _model = model

    return _model, _tokenizer


def stream_story(prompt, max_new_tokens=DEFAULT_MAX_NEW_TOKENS, temperature=0.8, top_p=0.9):
    """Yield the story text piece by piece, starting with the prompt itself."""
    model, tokenizer = _load()

    prompt_ids = torch.tensor(tokenizer.encode(prompt).ids, dtype=torch.long)
    prompt_text = tokenizer.decode(prompt_ids.tolist())
    yield prompt_text

    # Decode the whole output each step and yield only the new part,
    # so spaces and multi-token words come out right
    new_ids = []
    sent = ""
    for token_id in generate(
        model,
        prompt_ids,
        max_new_tokens=max_new_tokens,
        temperature=temperature,
        top_p=top_p,
        eot_token_id=tokenizer.token_to_id("<|endoftext|>"),
    ):
        new_ids.append(token_id)
        text = tokenizer.decode(prompt_ids.tolist() + new_ids)[len(prompt_text):]
        if len(text) > len(sent):
            yield text[len(sent):]
            sent = text


def create_story(prompt, max_new_tokens=DEFAULT_MAX_NEW_TOKENS, temperature=0.8, top_p=0.9):
    return "".join(stream_story(prompt, max_new_tokens, temperature, top_p))
