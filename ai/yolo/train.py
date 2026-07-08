import os
import shutil
from ultralytics import YOLO

def main():
    # Path to the data configuration file
    data_yaml = r"C:\Users\Rishabh Goyal\Documents\Mediguide\ai\yolo\data.yaml"
    
    # Load the pretrained nano YOLOv8 model
    model = YOLO("yolov8n.pt")
    
    # Run training with specific configurations
    # We apply augmentations: degrees (rotation), blur (blur), and hsv_v (brightness fraction)
    print("Starting YOLOv8n training...")
    results = model.train(
        data=data_yaml,
        epochs=5,
        imgsz=640,
        degrees=15.0,  # rotation within +-15 degrees
        hsv_v=0.4,     # HSV-Val (brightness) adjustment fraction
        project=r"C:\Users\Rishabh Goyal\Documents\Mediguide\ai\yolo\runs",
        name="prescription_yolov8n",
        exist_ok=True
    )
    
    print("Training process finished.")
    
    # Location of the best weights from training
    best_weights_path = os.path.join(
        r"C:\Users\Rishabh Goyal\Documents\Mediguide\ai\yolo\runs",
        "prescription_yolov8n",
        "weights",
        "best.pt"
    )
    
    # Define target path for the weights
    target_dir = r"C:\Users\Rishabh Goyal\Documents\Mediguide\ai\yolo\models"
    os.makedirs(target_dir, exist_ok=True)
    target_weights_path = os.path.join(target_dir, "best.pt")
    
    if os.path.exists(best_weights_path):
        shutil.copy2(best_weights_path, target_weights_path)
        print(f"Copied best weights to {target_weights_path}")
    else:
        print(f"Error: Best weights not found at {best_weights_path}")

if __name__ == "__main__":
    main()
