"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy } from "lucide-react";

interface JsonOutputProps {
  jsonData?: string;
  isLoading?: boolean;
}

const JsonOutput = ({
  jsonData = "{}",
  isLoading = false,
}: JsonOutputProps) => {
  const [activeTab, setActiveTab] = useState("formatted");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonData);
    // Could add a toast notification here
  };

  const downloadJson = () => {
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "component-mapping.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatJson = (json: string) => {
    try {
      const parsed = JSON.parse(json);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return json;
    }
  };

  return (
    <Card className="w-full h-full bg-card border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>JSON Output</span>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="h-8"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </CardTitle>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-60 grid-cols-2">
            <TabsTrigger value="formatted">Formatted</TabsTrigger>
            <TabsTrigger value="raw">Raw</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="formatted" className="mt-0">
                <pre className="bg-muted p-4 rounded-md overflow-auto h-80 text-sm">
                  {formatJson(jsonData)}
                </pre>
              </TabsContent>
              <TabsContent value="raw" className="mt-0">
                <pre className="bg-muted p-4 rounded-md overflow-auto h-80 text-sm">
                  {jsonData}
                </pre>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={downloadJson}
          className="w-full"
          disabled={isLoading || jsonData === "{}"}
        >
          Download JSON
        </Button>
      </CardFooter>
    </Card>
  );
};

export default JsonOutput;
