import torch
from tokenizers import Tokenizer

from src.generation import generate
from src.transformer_lm import TransformerLM


def main():
    tokenizer = Tokenizer.from_file("tokenizer/tokenizer.json")

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
    state_dict = torch.load("weights/final_model.pt", map_location="cpu")
    model.load_state_dict(state_dict.get("model", state_dict))

    prompt = input("Prompt: ")
    prompt_ids = torch.tensor(tokenizer.encode(prompt).ids, dtype=torch.long)
    prompt_text = tokenizer.decode(prompt_ids.tolist())

    print(prompt_text, end="", flush=True)

    # Decode the whole output each step and print only the new part,
    # so spaces and multi-token words come out right
    new_ids = []
    printed = ""
    for token_id in generate(
        model,
        prompt_ids,
        max_new_tokens=256,
        eot_token_id=tokenizer.token_to_id("<|endoftext|>"),
    ):
        new_ids.append(token_id)
        text = tokenizer.decode(prompt_ids.tolist() + new_ids)[len(prompt_text):]
        print(text[len(printed):], end="", flush=True)
        printed = text

    print()


if __name__ == "__main__":
    main()
