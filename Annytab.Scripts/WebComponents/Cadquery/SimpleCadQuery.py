"""
Auto-generated from SOLIDWORKS: bracket.sldprt
Generated: 2024-01-15 14:30:00
"""

import cadquery as cq

# ============================================
# PARAMETERS (from SOLIDWORKS Global Variables)
# ============================================
# BaseWidth = 100 mm
BaseWidth = 100
# BaseLength = 150 mm
BaseLength = 150
# BaseHeight = BaseWidth * 0.5
BaseHeight = BaseWidth * 0.5

# ============================================
# MODEL CONSTRUCTION
# ============================================

def build_model():
    """Build the SOLIDWORKS model in CadQuery"""
    result = cq.Workplane("XY")
    # Feature: Base-Extrude (Extrude)
    result = (result
        .rect(BaseWidth, BaseLength)
        .extrude(BaseHeight))
    # Feature: Hole (Hole)
    result = result.faces(">Z").hole(5)  # Manual: specify diameter and position
    # Feature: Fillet1 (Fillet)
    result = result.fillet(2)
    return result

# ============================================
# EXPORT
# ============================================

if __name__ == "__main__":
    model = build_model()
    cq.exporters.export(model, "model.step")
    cq.exporters.export(model, "model.stl")
