import os
import uuid
import torch
from TTS.api import TTS

# ==========================================================
# Configuration
# ==========================================================

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Optional GPU optimizations
if DEVICE == "cuda":
    torch.backends.cudnn.benchmark = True
    torch.set_float32_matmul_precision("high")

# Load model ONLY ONCE
print(f"Loading XTTS model on {DEVICE}...")

tts = TTS(
    model_name="tts_models/multilingual/multi-dataset/xtts_v2"
).to(DEVICE)

print("XTTS Loaded Successfully!")

# ==========================================================
# TTS Function
# ==========================================================

def generate_voice(
    text,
    speaker_wav,
    language="en",
    output_dir="media/tts"
):
    """
    Generate cloned speech.

    Args:
        text (str): Text to convert.
        speaker_wav (str): Reference voice wav.
        language (str): Language code.
        output_dir (str): Folder to save output.

    Returns:
        str: Generated wav path.
    """

    os.makedirs(output_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex}.wav"
    output_path = os.path.join(output_dir, filename)

    with torch.inference_mode():

        tts.tts_to_file(
            text=text,
            speaker_wav=speaker_wav,
            language=language,
            file_path=output_path,
        )

    return output_path