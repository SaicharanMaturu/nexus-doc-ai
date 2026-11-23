import subprocess
import json
import os
import io
import shutil
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

PS_SCRIPT_PATH = Path(__file__).resolve().parent / "win_ocr.ps1"

def get_tesseract_cmd() -> Optional[str]:
    """
    Locates the tesseract executable on Windows, Linux, and macOS.
    """
    env_path = os.environ.get("TESSERACT_CMD")
    if env_path and os.path.exists(env_path):
        return env_path
    
    which_path = shutil.which("tesseract")
    if which_path and os.path.exists(which_path):
        return which_path
        
    candidate_paths = [
        os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        "/usr/bin/tesseract",
        "/usr/local/bin/tesseract",
        "/opt/homebrew/bin/tesseract"
    ]
    for p in candidate_paths:
        if os.path.exists(p):
            return p
    return None

def run_windows_media_ocr(image_path: str) -> Dict[str, Any]:
    """
    Genuine Hardware-Accelerated OCR using Windows Native Media OCR Engine
    (Windows.Media.Ocr.OcrEngine).
    Extracts actual optical text, line geometry, and word-level bounding boxes.
    """
    abs_image_path = str(Path(image_path).resolve())
    if not os.path.exists(abs_image_path):
        return {"text": "", "lines": [], "success": False, "error": f"Image file not found: {abs_image_path}"}

    try:
        cmd = [
            "powershell",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy", "Bypass",
            "-File", str(PS_SCRIPT_PATH),
            "-ImagePath", abs_image_path
        ]
        
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=25
        )

        if proc.returncode != 0:
            return {
                "text": "",
                "lines": [],
                "success": False,
                "error": f"Windows OCR process error: {proc.stderr.strip()}"
            }

        out_json = json.loads(proc.stdout.strip())
        recognized_text = out_json.get("Text") or ""
        return {
            "text": recognized_text,
            "lines": out_json.get("Lines", []),
            "success": bool(recognized_text),
            "engine": "Windows.Media.Ocr (Native OS Hardware Accelerated)"
        }
    except Exception as e:
        return {
            "text": "",
            "lines": [],
            "success": False,
            "error": str(e)
        }

def run_tesseract_ocr(image_path: str) -> Dict[str, Any]:
    """
    Cross-platform fallback OCR using pytesseract.
    Parses word-level output from pytesseract.image_to_data using float() parsing,
    filters out invalid confidence values (conf < 0.0 or unparseable),
    and calculates average confidence ONLY from valid recognized non-empty words.
    Builds compatible line/word bounding boxes.
    """
    if not os.path.exists(image_path):
        return {"text": "", "lines": [], "confidence": 0.0, "word_count": 0, "success": False, "error": f"Image file not found: {image_path}"}

    try:
        import pytesseract
        from PIL import Image

        tess_cmd = get_tesseract_cmd()
        if tess_cmd:
            pytesseract.pytesseract.tesseract_cmd = tess_cmd

        img = Image.open(image_path)
        data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

        valid_confs: List[float] = []
        words_by_line: Dict[Tuple[int, int, int], List[Dict[str, Any]]] = {}

        n_boxes = len(data.get("text", []))
        for i in range(n_boxes):
            raw_text = data["text"][i]
            word_str = str(raw_text).strip()
            if not word_str:
                continue

            conf_raw = data.get("conf", [None])[i]
            try:
                conf_val = float(conf_raw)
                if conf_val < 0.0:
                    continue
            except (ValueError, TypeError):
                continue

            # Valid recognized non-empty word with non-negative float confidence
            valid_confs.append(conf_val)

            block_num = data.get("block_num", [0])[i]
            par_num = data.get("par_num", [0])[i]
            line_num = data.get("line_num", [0])[i]
            left = data.get("left", [0])[i]
            top = data.get("top", [0])[i]
            width = data.get("width", [0])[i]
            height = data.get("height", [0])[i]

            line_key = (block_num, par_num, line_num)
            if line_key not in words_by_line:
                words_by_line[line_key] = []

            words_by_line[line_key].append({
                "Text": word_str,
                "Confidence": conf_val,
                "BoundingRect": {
                    "X": left,
                    "Y": top,
                    "Width": width,
                    "Height": height
                }
            })

        lines_list: List[Dict[str, Any]] = []
        all_words_text: List[str] = []
        for line_key in sorted(words_by_line.keys()):
            line_words = words_by_line[line_key]
            line_text = " ".join(w["Text"] for w in line_words)
            all_words_text.append(line_text)
            lines_list.append({
                "Words": line_words,
                "LineText": line_text
            })

        full_extracted_text = "\n".join(all_words_text)
        avg_confidence = round(float(sum(valid_confs) / len(valid_confs)), 2) if valid_confs else 0.0

        return {
            "text": full_extracted_text,
            "lines": lines_list,
            "confidence": avg_confidence,
            "word_count": len(valid_confs),
            "success": True,
            "engine": "Tesseract OCR (Cross-Platform Fallback)"
        }
    except Exception as e:
        return {
            "text": "",
            "lines": [],
            "confidence": 0.0,
            "word_count": 0,
            "success": False,
            "error": f"Tesseract OCR fallback failed: {str(e)}"
        }

def run_ocr_with_fallback(image_path: str, force_engine: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes OCR with automatic fallback:
    1. If force_engine == 'tesseract', runs Tesseract directly.
    2. Otherwise, tries Windows.Media.Ocr first (if on Windows).
    3. If Windows.Media.Ocr fails or returns empty, falls back to Tesseract OCR.
    """
    if force_engine == "tesseract":
        return run_tesseract_ocr(image_path)

    if force_engine == "windows":
        return run_windows_media_ocr(image_path)

    # Automatic fallback
    if os.name == "nt":
        win_res = run_windows_media_ocr(image_path)
        if win_res.get("success") and win_res.get("text"):
            win_res["ocr_engine_used"] = "Windows.Media.Ocr (Native OS Hardware Accelerated)"
            return win_res

    # Fallback to Tesseract
    tess_res = run_tesseract_ocr(image_path)
    if tess_res.get("success") and tess_res.get("text"):
        tess_res["ocr_engine_used"] = "Tesseract OCR (Cross-Platform Fallback)"
        return tess_res

    # If both failed, return failure dict
    return {
        "text": "",
        "lines": [],
        "confidence": 0.0,
        "success": False,
        "ocr_engine_used": "None (All engines exhausted)",
        "error": "Both Windows.Media.Ocr and Tesseract fallback failed."
    }
