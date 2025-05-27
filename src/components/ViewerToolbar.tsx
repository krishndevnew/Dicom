import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  RotateCcw,
  RotateCw,
  Layout,
  Contrast,
  Ruler,
  Download,
  FlipHorizontal,
  FlipVertical,
  Play,
  RefreshCw,
  Share2,
  Grid2X2,
  Circle,
  Square,
  ArrowRight,
  Pentagon,
  MousePointer,
  ArrowDownRight,
  Pencil,
  X,
  Search,
  ArrowUpDown,
  TextCursorInput,
  Printer,
  Mail,
  FileImage,
  Image,
  MoreHorizontal
} from 'lucide-react';

interface ViewerToolbarProps {
  activeTool: string;
  onToolChange: (toolName: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPan: () => void;
  onFit: () => void;
  onRotate: (direction: 'cw' | 'ccw') => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onWindowLevel: () => void;
  onReset: () => void;
  onInvertColors: () => void;
  onFullScreen: () => void;
  onNextImage: () => void;
  onPrevImage: () => void;
  layout: string;
  onLayoutChange: (layout: string) => void;
  currentImageIndex: number;
  totalImages: number;
  onClearMeasurements?: () => void;
  onPlayCine?: () => void;
  onPrintImage?: () => void;
  onAnnotate?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  activeTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  onPan,
  onFit,
  onRotate,
  onFlipHorizontal,
  onFlipVertical,
  onWindowLevel,
  onReset,
  onInvertColors,
  onFullScreen,
  onNextImage,
  onPrevImage,
  layout,
  onLayoutChange,
  currentImageIndex,
  totalImages,
  onClearMeasurements,
  onPlayCine,
  onPrintImage,
  onAnnotate,
  onShare,
  onExport
}) => {
  const [showDropdowns, setShowDropdowns] = useState({
    layout: false,
    zoom: false,
    measure: false,
    annotate: false,
    export: false,
    more: false
  });

  const dropdownRefs = {
    layout: useRef<HTMLDivElement>(null),
    zoom: useRef<HTMLDivElement>(null),
    measure: useRef<HTMLDivElement>(null),
    annotate: useRef<HTMLDivElement>(null),
    export: useRef<HTMLDivElement>(null),
    more: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setShowDropdowns(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: keyof typeof showDropdowns) => {
    setShowDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown]
    }));
  };

  const measureTools = [
    { label: 'Line', icon: <Ruler size={16} />, tool: 'Length' },
    { label: 'Ellipse', icon: <Circle size={16} />, tool: 'EllipticalRoi' },
    { label: 'Rectangle', icon: <Square size={16} />, tool: 'RectangleRoi' },
    { label: 'Area', icon: <Pentagon size={16} />, tool: 'FreehandRoi' },
    { label: 'Angle', icon: <ArrowDownRight size={16} />, tool: 'Angle' },
    { label: 'Arrow', icon: <ArrowRight size={16} />, tool: 'ArrowAnnotate' },
    { label: 'Point', icon: <MousePointer size={16} />, tool: 'Probe' }
  ];

  return (
    <div className="bg-background border-b p-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevImage}
            disabled={currentImageIndex <= 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentImageIndex + 1} / {totalImages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={onNextImage}
            disabled={currentImageIndex >= totalImages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-6 border-l border-border" />

        <Button
          variant={activeTool === 'Pan' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onToolChange('Pan')}
        >
          <Move className="h-4 w-4" />
        </Button>

        <div ref={dropdownRefs.zoom} className="relative">
          <Button
            variant={activeTool === 'Zoom' ? 'default' : 'outline'}
            size="icon"
            onClick={() => toggleDropdown('zoom')}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          {showDropdowns.zoom && (
            <div className="absolute top-full mt-1 w-40 bg-popover border rounded-md shadow-lg z-50">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onZoomIn();
                  toggleDropdown('zoom');
                }}
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onZoomOut();
                  toggleDropdown('zoom');
                }}
              >
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  onFit();
                  toggleDropdown('zoom');
                }}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                Fit to Screen
              </Button>
            </div>
          )}
        </div>

        <Button
          variant={activeTool === 'Wwwc' ? 'default' : 'outline'}
          size="icon"
          onClick={() => onToolChange('Wwwc')}
        >
          <Contrast className="h-4 w-4" />
        </Button>

        <div ref={dropdownRefs.measure} className="relative">
          <Button
            variant={measureTools.some(t => t.tool === activeTool) ? 'default' : 'outline'}
            size="icon"
            onClick={() => toggleDropdown('measure')}
          >
            <Ruler className="h-4 w-4" />
          </Button>
          {showDropdowns.measure && (
            <div className="absolute top-full mt-1 w-48 bg-popover border rounded-md shadow-lg z-50 grid grid-cols-2 gap-1 p-2">
              {measureTools.map((tool) => (
                <Button
                  key={tool.tool}
                  variant={activeTool === tool.tool ? 'default' : 'ghost'}
                  className="justify-start"
                  onClick={() => {
                    onToolChange(tool.tool);
                    toggleDropdown('measure');
                  }}
                >
                  {tool.icon}
                  <span className="ml-2">{tool.label}</span>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 border-l border-border" />

        <Button
          variant="outline"
          size="icon"
          onClick={() => onRotate('ccw')}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onRotate('cw')}
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onFlipHorizontal}
        >
          <FlipHorizontal className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onFlipVertical}
        >
          <FlipVertical className="h-4 w-4" />
        </Button>

        <div className="h-6 border-l border-border" />

        <Button
          variant="outline"
          size="icon"
          onClick={onPlayCine}
        >
          <Play className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onPrintImage}
        >
          <Printer className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onExport}
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>

        <div ref={dropdownRefs.layout} className="relative">
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleDropdown('layout')}
          >
            <Layout className="h-4 w-4" />
          </Button>
          {showDropdowns.layout && (
            <div className="absolute top-full mt-1 w-40 bg-popover border rounded-md shadow-lg z-50">
              {['1x1', '1x2', '2x2', '3x3'].map((l) => (
                <Button
                  key={l}
                  variant={layout === l ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    onLayoutChange(l);
                    toggleDropdown('layout');
                  }}
                >
                  <Grid2X2 className="h-4 w-4 mr-2" />
                  {l}
                </Button>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onFullScreen}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};