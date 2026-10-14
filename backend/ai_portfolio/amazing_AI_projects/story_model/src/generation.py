import torch


@torch.inference_mode()
def generate(model, prompt_ids, max_new_tokens, temperature=0.8, top_p=0.9, eot_token_id=None):
    """Yield new token IDs one at a time, as soon as each is sampled."""
    model.eval()
    sequence = prompt_ids.clone()

    for _ in range(max_new_tokens):
        context = sequence[-model.context_length:]
        logits = model(context.unsqueeze(0))[0, -1] / temperature
        probs = torch.softmax(logits, dim=-1)

        # Top-p: keep the smallest set of tokens whose probability reaches top_p
        sorted_probs, sorted_ids = torch.sort(probs, descending=True)
        cumulative = torch.cumsum(sorted_probs, dim=0)
        sorted_probs[cumulative - sorted_probs > top_p] = 0
        sorted_probs /= sorted_probs.sum()

        next_token = sorted_ids[torch.multinomial(sorted_probs, 1)]
        if next_token.item() == eot_token_id:
            break

        sequence = torch.cat((sequence, next_token))
        yield next_token.item()
