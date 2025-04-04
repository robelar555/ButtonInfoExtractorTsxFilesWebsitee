"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUploader from "@/components/FileUploader";
import ComponentPreview from "@/components/ComponentPreview";
import JsonOutput from "@/components/JsonOutput";
import { Button } from "@/components/ui/button";
import { Download, Play } from "lucide-react";

interface ComponentNode {
  name: string;
  buttons: string[];
  children?: ComponentNode[];
}

export default function Page() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [componentData, setComponentData] = useState<ComponentNode[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [jsonOutput, setJsonOutput] = useState("{}");

  const handleFileUpload = (file: File) => {
    // Check if file already exists in the list
    if (!uploadedFiles.some((f) => f.name === file.name)) {
      setUploadedFiles((prev) => [...prev, file]);
    }
  };

  const handleFileRemove = (fileToRemove: File) => {
    setUploadedFiles((prev) => prev.filter((file) => file !== fileToRemove));
  };

  // Function to extract button text from TSX content
  const extractButtonsFromTSX = async (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          resolve([]);
          return;
        }

        // Extract button text using regex
        // Look for button elements with text content
        const buttonRegex = /<Button[^>]*>([^<]+)<\/Button>/g;
        const buttonMatches = [...content.matchAll(buttonRegex)];
        const buttonTexts = buttonMatches
          .map((match) => match[1].trim())
          .filter((text) => text.length > 0); // Skip buttons with no text content

        // If no buttons found with the first regex, try another pattern
        if (buttonTexts.length === 0) {
          // Look for button elements with children that might be text
          const altButtonRegex = /<Button[^>]*>([\s\S]*?)<\/Button>/g;
          const altMatches = [...content.matchAll(altButtonRegex)];
          const altTexts = altMatches
            .map((match) => {
              const innerContent = match[1].trim();
              // Remove any HTML tags to get just the text
              return innerContent.replace(/<[^>]*>/g, "").trim();
            })
            .filter((text) => text.length > 0); // Skip buttons with no text content

          resolve(altTexts.length > 0 ? altTexts : []);
        } else {
          resolve(buttonTexts);
        }
      };
      reader.onerror = () => resolve(["Error reading file"]);
      reader.readAsText(file);
    });
  };

  const handleGenerateAnalysis = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);

    try {
      // Process each file to extract component and button information
      const componentsPromises = uploadedFiles.map(async (file) => {
        const buttonTexts = await extractButtonsFromTSX(file);

        // Create the component object without children initially
        const componentObj = {
          name: file.name.replace(".tsx", ""),
          buttons: buttonTexts.length > 0 ? buttonTexts : [],
        };

        // Only add children if there are actual button texts found
        // This removes the ChildComponent when there's no value
        if (buttonTexts.length > 0) {
          componentObj.children = [
            {
              name: "ChildComponent",
              buttons: ["Child Button"],
            },
          ];
        }

        return componentObj;
      });

      const mockComponents = await Promise.all(componentsPromises);
      setComponentData(mockComponents);
      setJsonOutput(JSON.stringify(mockComponents, null, 2));
    } catch (error) {
      console.error("Error processing files:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-background">
      <div className="w-full max-w-6xl space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            React Component Mapper
          </h1>
          <p className="text-muted-foreground">
            Upload .tsx files to extract component names and buttons
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Upload TSX Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploader
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                files={uploadedFiles}
                isProcessing={isProcessing}
              />

              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleGenerateAnalysis}
                  disabled={uploadedFiles.length === 0 || isProcessing}
                  className="flex items-center gap-2"
                >
                  <Play size={16} />
                  Generate Analysis
                </Button>
              </div>
            </CardContent>
          </Card>

          {componentData.length > 0 && (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Component Preview</TabsTrigger>
                    <TabsTrigger value="json">JSON Output</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="mt-4">
                    <ComponentPreview componentData={componentData} />
                  </TabsContent>
                  <TabsContent value="json" className="mt-4">
                    <JsonOutput
                      jsonData={jsonOutput}
                      isLoading={isProcessing}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
