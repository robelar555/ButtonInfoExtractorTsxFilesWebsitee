"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ComponentNode {
  name: string;
  buttons: string[];
  children?: ComponentNode[];
}

interface ComponentPreviewProps {
  componentData?: ComponentNode[];
}

const ComponentPreview = ({ componentData = [] }: ComponentPreviewProps) => {
  return (
    <Card className="w-full h-full bg-card">
      <CardHeader>
        <CardTitle>Component Preview</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[500px]">
        {componentData.length > 0 ? (
          <div className="space-y-2">
            {componentData.map((component, index) => (
              <ComponentNode key={index} component={component} level={0} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>No components to preview</p>
            <p className="text-sm">
              Upload a .tsx file to see the component structure
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface ComponentNodeProps {
  component: ComponentNode;
  level: number;
}

const ComponentNode = ({ component, level }: ComponentNodeProps) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = component.children && component.children.length > 0;

  return (
    <div className="border-l-2 border-muted pl-4">
      <div className="flex items-center gap-2 py-1">
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-accent rounded-sm"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        <div className="font-medium">{component.name}</div>
      </div>

      {component.buttons.length > 0 && (
        <div className="ml-6 mb-2">
          <div className="text-sm text-muted-foreground">Buttons:</div>
          <div className="flex flex-wrap gap-2 mt-1">
            {component.buttons.map((button, index) => (
              <div
                key={index}
                className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded-md"
              >
                {button}
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && hasChildren && (
        <div className="ml-2 mt-1">
          {component.children!.map((child, index) => (
            <ComponentNode key={index} component={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComponentPreview;
