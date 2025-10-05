# EcoSort AI 🤖♻️

Smart AI-based Waste Segregation System that uses machine learning to classify waste materials into categories like Plastic, Metal, Organic, Paper, Glass, and more.

![EcoSort AI Logo](EcoSort1.2-main/output.svg)

## 🌟 Features

- **AI-Powered Classification**: Advanced machine learning model for accurate waste categorization
- **Multiple Input Methods**: Upload images, capture with webcam, or use demo mode
- **Real-time Processing**: Instant results with confidence scores
- **Persistent History**: SQLite database stores all predictions with timestamps
- **Beautiful UI**: Modern, responsive design with dark/light theme support
- **Demo Mode**: Showcase functionality with pre-loaded categorized images
- **Analytics Dashboard**: Visual charts showing waste category distribution
- **Download Results**: Export classification results as text files

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js (optional, for frontend development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/piyush080205/Ecosort1.3.git
   cd ecosort-1.3
   ```

2. **Backend Setup:**
   ```bash
   cd VisionX
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   ```bash
   # No additional setup required - frontend is served by Flask
   ```

4. **Run the Application:**
   ```bash
   python app.py
   ```

5. **Open Browser:**
   Navigate to `http://localhost:5000`

## 📖 Usage

### 🖼️ Image Classification
1. **Upload Image**: Click "Upload from Device" to select an image file
2. **Webcam Capture**: Click "Capture with Webcam" to take a live photo
3. **Demo Mode**: Click "Demo Mode" for instant AI demonstration with sample images

### 📊 Analytics
- View waste category distribution in the analytics section
- Browse prediction history with thumbnails
- Clear history when needed

### 🌙 Theme Toggle
- Switch between dark and light themes using the moon/sun icon in the navigation

## 🎯 Demo Mode

The demo mode showcases EcoSort AI's capabilities using pre-categorized images:

- **Automatic Processing**: One-click demonstration with instant results
- **High Accuracy**: Correct predictions with 90-99% confidence
- **Category Showcase**: Demonstrates all supported waste categories
- **Fallback System**: Uses local dataset images or gallery images if unavailable

## 🛠️ Technology Stack

### Backend
- **Flask**: Web framework for API and static file serving
- **TensorFlow/Keras**: Machine learning framework
- **SQLite**: Database for storing predictions
- **SQLAlchemy**: ORM for database operations
- **Pillow**: Image processing library

### Frontend
- **HTML5/CSS3**: Modern responsive design
- **Vanilla JavaScript**: Client-side functionality
- **Chart.js**: Analytics visualization
- **Font Awesome**: Icons and UI elements

### Development
- **Python**: Backend development
- **Git**: Version control
- **Pip**: Package management

## 📁 Project Structure

```
ecosort-1.3/
├── VisionX/                    # Backend Python application
│   ├── app.py                 # Main Flask application
│   ├── predict.py            # AI prediction logic
│   ├── models.py             # Database models
│   ├── requirements.txt      # Python dependencies
│   ├── dataset/              # Training/validation images
│   │   ├── glass/           # Glass waste images
│   │   ├── metal/           # Metal waste images
│   │   ├── paper/           # Paper waste images
│   │   └── plastic/         # Plastic waste images
│   └── ecosort.db           # SQLite database (auto-generated)
├── EcoSort1.2-main/          # Frontend static files
│   ├── index.html           # Main HTML page
│   ├── style.css            # CSS stylesheets
│   ├── script.js            # JavaScript functionality
│   └── output.svg           # EcoSort AI logo
└── README.md                # This file
```

## 🔌 API Endpoints

### Core Endpoints
- `GET /` - Serve frontend application
- `POST /predict` - Classify waste from image data
- `GET /health` - Health check endpoint

### Database Endpoints
- `GET /history` - Retrieve prediction history
- `DELETE /history` - Clear all history
- `DELETE /history/<id>` - Delete specific prediction

### Dataset Endpoints
- `GET /dataset/<category>/<filename>` - Serve dataset images
- `GET /demo-images/<category>` - List images for demo category

## 🗄️ Database Schema

### Prediction Table
```sql
CREATE TABLE prediction (
    id INTEGER PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    confidence FLOAT NOT NULL,
    image_data TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent VARCHAR(500)
);
```

## 🎨 Customization

### Adding New Categories
1. Update `CLASSES` list in `predict.py`
2. Add disposal instructions in `script.js` categories array
3. Add corresponding emoji and color in frontend
4. Update dataset folder structure

### Styling
- Modify `style.css` for UI customization
- Update CSS variables for theme changes
- Add new color schemes in `:root` section

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use meaningful commit messages
- Test new features thoroughly
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TensorFlow/Keras** for machine learning capabilities
- **Flask** for robust web framework
- **Unsplash** for demo images (fallback gallery)
- **Font Awesome** for beautiful icons
- **Chart.js** for data visualization

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check the troubleshooting section below

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Ensure all dependencies are installed
pip install -r requirements.txt

# Check Python version (3.8+ required)
python --version
```

**Demo images not loading:**
- Check if dataset folders exist and contain .jpg/.png files
- Verify Flask server is running on port 5000

**AI model not working:**
- Ensure `waste_model.h5` exists in VisionX directory
- Check TensorFlow installation

**Database issues:**
- Delete `ecosort.db` to recreate database
- Check file permissions in VisionX directory

## 🎯 Future Enhancements

- [ ] Mobile app development
- [ ] Real-time video analysis
- [ ] Multi-language support
- [ ] Advanced analytics and reporting
- [ ] Integration with waste management systems
- [ ] User accounts and profiles
- [ ] Social features and leaderboards

---

**Made with ❤️ for environmental sustainability**

*Developed by Vision X - EcoSort AI Team*
