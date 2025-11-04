export class TemplateService {
  static instance = null;
  fabricInstance = null;
  loadingTemplates = new Set();

  static getInstance() {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  async getFabricInstance() {
    if (!this.fabricInstance) {
      const { loadFabric } = await import('@/lib/fabric-loader');
      this.fabricInstance = await loadFabric();
    }
    return this.fabricInstance;
  }

  async loadTemplate(templateId) {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  }

  extractElementsFromTemplate(templateData) {
    let elementsToLoad = null;
    
    if (templateData.canvasData && templateData.canvasData.objects) {
      elementsToLoad = templateData.canvasData.objects;
    } else if (templateData.canvasData && templateData.canvasData.elements) {
      elementsToLoad = templateData.canvasData.elements;
    } else if (templateData.builderData) {
      if (templateData.builderData.elements) {
        elementsToLoad = templateData.builderData.elements;
      } else if (templateData.builderData.objects) {
        elementsToLoad = templateData.builderData.objects;
      } else if (templateData.builderData.canvas && templateData.builderData.canvas.objects) {
        elementsToLoad = templateData.builderData.canvas.objects;
      }
    } else if (templateData.elements) {
      elementsToLoad = templateData.elements;
    }
    
    // Clean textBaseline issues
    if (elementsToLoad && Array.isArray(elementsToLoad)) {
      elementsToLoad = elementsToLoad.map((obj) => {
        const cleanObj = { ...obj };
        if (cleanObj.textBaseline && cleanObj.textBaseline === 'alphabetical') {
          cleanObj.textBaseline = 'alphabetic';
        }
        // Ensure styles exists for text objects
        if ((cleanObj.type === 'textbox' || cleanObj.type === 'text' || cleanObj.type === 'i-text') && !cleanObj.styles) {
          cleanObj.styles = {};
        }
        return cleanObj;
      });
    }
    
    return elementsToLoad;
  }

  async loadTemplateIntoCanvas(canvas, templateId, baseDimensions) {
    if (this.loadingTemplates.has(templateId)) {
      console.log('Template already loading, skipping...');
      return;
    }
    
    this.loadingTemplates.add(templateId);
    
    try {
      console.log('📄 Loading template:', templateId);
      
      const templateData = await this.loadTemplate(templateId);
      console.log('📄 Template data loaded:', templateData);
      
      if (!templateData) {
        throw new Error('Template data is null or undefined');
      }
      
      const elementsToLoad = this.extractElementsFromTemplate(templateData);
      
      if (!elementsToLoad || elementsToLoad.length === 0) {
        console.warn('No elements found in template');
        return;
      }

      this.validateCanvas(canvas);
      this.clearCanvas(canvas, baseDimensions);
      
      const fabric = await this.getFabricInstance();
      if (!fabric) {
        throw new Error('Fabric.js not available');
      }
      
      await this.createAndAddObjects(canvas, fabric, elementsToLoad);
      
      canvas.renderAll();
      
      // Explicitly save state after template loads (force save bypasses user action check)
      if (canvas.saveState) {
        canvas.saveState(true); // Force save after template load
      }
      
      // Mark template as loaded to enable undo/redo
      if (canvas.markTemplateLoaded) {
        canvas.markTemplateLoaded();
      }
      
      console.log('✅ Template loaded successfully - Objects count:', canvas.getObjects().length);
      
    } catch (error) {
      console.error('Error loading template into canvas:', error);
      throw error;
    } finally {
      this.loadingTemplates.delete(templateId);
    }
  }

  validateCanvas(canvas) {
    if (!canvas) {
      throw new Error('Canvas is null or undefined');
    }
    
    const element = canvas.getElement();
    if (!element) {
      throw new Error('Canvas element is null');
    }
    
    const ctx = canvas.getContext();
    if (!ctx) {
      throw new Error('Canvas context is null - canvas may have been disposed');
    }
  }

  clearCanvas(canvas, baseDimensions) {
    // Temporarily mark as restoring to prevent state saves during clear
    const wasRestoring = canvas.canvasManager?.isRestoring || false;
    if (canvas.canvasManager) {
      canvas.canvasManager.isRestoring = true;
    }
    
    const objects = canvas.getObjects();
    while (objects.length > 0) {
      canvas.remove(objects[0]);
    }
    
    canvas.backgroundColor = '#ffffff';
    
    const baseWidth = baseDimensions?.width || 800;
    const baseHeight = baseDimensions?.height || 1000;
    
    canvas.setWidth(baseWidth);
    canvas.setHeight(baseHeight);
    canvas.setZoom(1);
    
    console.log('🎨 Canvas cleared and ready - Objects count:', canvas.getObjects().length);
    canvas.renderAll();
    
    // Restore restoring flag
    if (canvas.canvasManager) {
      canvas.canvasManager.isRestoring = wasRestoring;
    }
  }

  async createAndAddObjects(canvas, fabric, elementsToLoad) {
    const objectsToAdd = [];
    
    for (const elementData of elementsToLoad) {
      try {
        let obj = null;
        
        const cleanData = {
          left: elementData.left || 0,
          top: elementData.top || 0,
          fontSize: elementData.fontSize || 12,
          fontFamily: elementData.fontFamily || 'Arial',
          fill: elementData.fill || '#000000',
          fontWeight: elementData.fontWeight || 'normal',
          textBaseline: 'alphabetic',
          fontStyle: elementData.fontStyle || 'normal',
          textAlign: elementData.textAlign || 'left',
          width: elementData.width || 200,
          height: elementData.height || 50,
          originX: 'left',
          originY: 'top'
        };
        
        if (elementData.type === 'textbox' && elementData.text) {
          obj = new fabric.Textbox(elementData.text, cleanData);
        } else if (elementData.type === 'text' && elementData.text) {
          obj = new fabric.Text(elementData.text, cleanData);
        } else if (elementData.type === 'i-text' && elementData.text) {
          obj = new fabric.IText(elementData.text, cleanData);
        } else if (elementData.type === 'rect') {
          const rectData = {
            left: cleanData.left,
            top: cleanData.top,
            width: elementData.width || cleanData.width,
            height: elementData.height || cleanData.height,
            fill: elementData.fill || cleanData.fill,
            stroke: elementData.stroke,
            strokeWidth: elementData.strokeWidth,
            originX: 'left',
            originY: 'top'
          };
          obj = new fabric.Rect(rectData);
        } else if (elementData.type === 'line') {
          const x1 = elementData.left || 0;
          const y1 = elementData.top || 0;
          const x2 = (elementData.left || 0) + (elementData.width || 0);
          const y2 = (elementData.top || 0);
          const lineOptions = {
            stroke: elementData.stroke || elementData.fill || '#000000',
            strokeWidth: elementData.strokeWidth || Math.max(1, elementData.height || 1)
          };
          obj = new fabric.Line([x1, y1, x2, y2], lineOptions);
        }
        
        if (obj && (obj.type === 'text' || obj.type === 'textbox' || obj.type === 'i-text')) {
          obj.set({ textBaseline: 'alphabetic' });
          objectsToAdd.push(obj);
        } else if (obj) {
          objectsToAdd.push(obj);
        }
      } catch (elementError) {
        console.error('Error creating element:', elementError);
      }
    }
    
    if (objectsToAdd.length > 0) {
      canvas.add(...objectsToAdd);
    }
  }
}

