from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    image_data = db.Column(db.Text, nullable=False)  # Base64 encoded image
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_agent = db.Column(db.String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'confidence': self.confidence,
            'image_data': self.image_data,
            'timestamp': self.timestamp.isoformat(),
            'thumbnail': self.create_thumbnail()
        }

    def create_thumbnail(self):
        # Create a simple thumbnail from the base64 data
        try:
            import base64
            from io import BytesIO
            from PIL import Image
            img_data = base64.b64decode(self.image_data.split(',')[1])
            img = Image.open(BytesIO(img_data))
            img.thumbnail((150, 100))
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"
        except:
            return self.image_data  # Return original if thumbnail creation fails
