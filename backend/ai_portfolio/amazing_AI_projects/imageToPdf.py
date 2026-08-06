from PIL import Image

import os

import uuid
def image_to_pdf(image_file, output_dir="media/pdfs"):

    """

    Converts an uploaded image to PDF.

    Args:

        image_file: Django UploadedFile or file path.

        output_dir: Directory where PDF will be saved.

    Returns:

        Absolute path to the generated PDF.

    """

    os.makedirs(output_dir, exist_ok=True)

    image = Image.open(image_file)

    # Convert RGBA/P images to RGB (PDF doesn't support alpha)

    if image.mode in ("RGBA", "P"):

        image = image.convert("RGB")

    pdf_name = f"{uuid.uuid4().hex}.pdf"

    pdf_path = os.path.join(output_dir, pdf_name)

    image.save(pdf_path, "PDF", resolution=100.0)

    return pdf_path