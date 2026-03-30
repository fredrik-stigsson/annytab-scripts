#!/usr/bin/env python3
"""
CadQuery WebSocket Server for the Web Component Editor
Requires: pip install cadquery flask flask-cors
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cadquery as cq
import tempfile
import os
import json
import traceback
from io import BytesIO

app = Flask(__name__)
CORS(app)  # Enable CORS for local development

class CadQueryExecutor:
    @staticmethod
    def execute_code(code):
        """Execute CadQuery code and return the resulting shapes"""
        # Create a namespace for execution
        namespace = {
            'cq': cq,
            'show_object': None,
            'result': None
        }
        
        # Collect shown objects
        shown_objects = []
        
        def show_object(obj, name=None, options=None):
            shown_objects.append(obj)
        
        namespace['show_object'] = show_object
        
        try:
            # Execute the code
            exec(code, namespace)
            
            # Get the result (either from 'result' variable or shown objects)
            if 'result' in namespace and namespace['result']:
                result = namespace['result']
            elif shown_objects:
                result = shown_objects[0]
            else:
                result = None
                
            return result, None
            
        except Exception as e:
            return None, traceback.format_exc()
    
    @staticmethod
    def shape_to_json(shape):
        """Convert CadQuery shape to JSON-serializable format for Three.js"""
        if shape is None:
            return None
        
        try:
            # Export to STL and parse
            stl_io = BytesIO()
            cq.exporters.export(shape, stl_io, 'STL')
            stl_io.seek(0)
            
            # Basic geometry info
            bbox = shape.BoundingBox()
            
            return {
                'type': shape.__class__.__name__,
                'boundingBox': {
                    'xmin': bbox.xmin, 'xmax': bbox.xmax,
                    'ymin': bbox.ymin, 'ymax': bbox.ymax,
                    'zmin': bbox.zmin, 'zmax': bbox.zmax
                },
                'stl': stl_io.getvalue().decode('ascii', errors='ignore')
            }
        except Exception as e:
            return {'error': str(e)}

@app.route('/preview', methods=['POST'])
def preview():
    """Execute CadQuery code and return the model data"""
    data = request.get_json()
    code = data.get('code', '')
    
    if not code:
        return jsonify({'error': 'No code provided'}), 400
    
    shape, error = CadQueryExecutor.execute_code(code)
    
    if error:
        return jsonify({'error': error}), 400
    
    if shape is None:
        return jsonify({'error': 'No shape generated. Use result = ... or show_object()'}), 400
    
    model_data = CadQueryExecutor.shape_to_json(shape)
    
    return jsonify({
        'success': True,
        'model': shape.__class__.__name__,
        'modelData': model_data
    })

@app.route('/export', methods=['POST'])
def export_model():
    """Export the model to STL or STEP format"""
    data = request.get_json()
    shape_json = data.get('model')
    format_type = data.get('format', 'stl')
    
    # Recreate shape from stored data (simplified)
    # In production, you'd want to store the actual shape or re-execute the code
    
    return jsonify({'error': 'Export requires shape recreation'}), 501

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'cadquery_version': cq.__version__})

if __name__ == '__main__':
    print("Starting CadQuery Server on http://localhost:5000")
    print("Make sure CadQuery is installed: pip install cadquery")
    app.run(host='0.0.0.0', port=5000, debug=True)
