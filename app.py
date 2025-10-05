from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import base64
from VisionX.predict import predict_waste_from_base64
from VisionX.models import db, Prediction
import os

app = Flask(__name__)
CORS(app) 

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecosort.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create database tables
with app.app_context():
    db.create_all()

# Path to frontend directory
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'EcoSort1.2-main')

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve_frontend(path):
    return send_from_directory(FRONTEND_DIR, path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'image' not in data:
        return jsonify({'error': 'No image data provided', 'success': False}), 400
    
    base64_image = data['image']
    
    # Check if this is a demo request by looking at request data or headers
    demo_category = data.get('demo_category')  # Frontend can send this
    print(f"DEBUG: demo_category received: {demo_category}")  # Debug print
    
    # Alternative: detect demo images by size (generated images are small)
    if not demo_category:
        try:
            img_data = base64.b64decode(base64_image.split(',')[1])
            if len(img_data) < 10000:  # Very small images are likely generated demo images
                # For demo, we can't determine category from image alone
                # But we can provide better predictions
                pass
        except:
            pass
    
    result = predict_waste_from_base64(base64_image, demo_category)
    
    if result['success']:
        # Store prediction in database
        prediction = Prediction(
            category=result['category'],
            confidence=result['confidence'],
            image_data=base64_image,
            user_agent=request.headers.get('User-Agent', '')
        )
        db.session.add(prediction)
        db.session.commit()
        result['prediction_id'] = prediction.id
    
    return jsonify(result)

@app.route('/history', methods=['GET'])
def get_history():
    limit = int(request.args.get('limit', 10))
    predictions = Prediction.query.order_by(Prediction.timestamp.desc()).limit(limit).all()
    return jsonify({
        'success': True,
        'history': [p.to_dict() for p in predictions]
    })

@app.route('/history/<int:prediction_id>', methods=['DELETE'])
def delete_prediction(prediction_id):
    prediction = Prediction.query.get_or_404(prediction_id)
    db.session.delete(prediction)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/history', methods=['DELETE'])
def clear_history():
    Prediction.query.delete()
    db.session.commit()
    return jsonify({'success': True})

@app.route('/dataset/<category>/<filename>')
def serve_dataset_image(category, filename):
    dataset_path = os.path.join(os.path.dirname(__file__), 'VisionX', 'dataset')
    return send_from_directory(dataset_path, f'{category}/{filename}')

@app.route('/demo-images/<category>')
def get_demo_images(category):
    """Get list of images for a category in dataset"""
    dataset_path = os.path.join(os.path.dirname(__file__), 'VisionX', 'dataset', category)
    if not os.path.exists(dataset_path):
        return jsonify({'images': []})
    
    images = []
    for file in os.listdir(dataset_path):
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):
            images.append(f'/dataset/{category}/{file}')
    
    return jsonify({'images': images})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
