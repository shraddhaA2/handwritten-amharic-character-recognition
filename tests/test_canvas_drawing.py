"""
Test Canvas Drawing Simulation and Validation
Tests how the ML pipeline processes drawn character images.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.predict import get_predictor
from ml.preprocessing import preprocess_image_stages

print("[Test] 1. Creating simulated 280x280 canvas drawing of 'ሀ'...")
# Create a 280x280 white canvas
canvas = Image.new("RGB", (280, 280), (255, 255, 255))
draw = ImageDraw.Draw(canvas)

# Draw character 'ሀ' (two vertical legs and an arched top/middle)
# Stroke width 14 to simulate smooth brush
# Left leg
draw.line([(80, 70), (80, 220)], fill=(0, 0, 0), width=16)
# Top arch/bar
draw.line([(80, 70), (200, 70)], fill=(0, 0, 0), width=16)
# Right leg
draw.line([(200, 70), (200, 220)], fill=(0, 0, 0), width=16)

# Test preprocessing stages
stages, tensor, _ = preprocess_image_stages(canvas)
print(f"  Canvas Dimensions    : {canvas.size}")
print(f"  Preprocessed Tensor  : {tensor.shape}")
print(f"  Stroke detected      : {stages['centered_padded'].max() > 0}")

print("\n[Test] 2. Running prediction on drawn character...")
predictor = get_predictor()
result = predictor.predict(canvas)

print(f"  Predicted Character  : {result['predicted_character']} ({result['phonetic']})")
print(f"  Class Label          : {result['class_label']} (ID: {result['class_id']})")
print(f"  Decision Margin      : {result['decision_score']}")
print(f"  Top Candidate Rank 1 : {result['top_candidates'][0]['character']}")

print("\nTop 5 Candidates for Drawn Character:")
for cand in result["top_candidates"]:
    print(f"  {cand['rank']}. {cand['character']} ({cand['phonetic']}) | Score: {cand['decision_score']:+.4f} | Conf: {cand['confidence']*100:.2f}%")

print("\nCanvas simulation test completed successfully!")
