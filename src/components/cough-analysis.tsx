"use client"

import { useState, useRef } from "react"
import { analysisService, type AnalysisResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, Upload, CheckCircle, AlertTriangle } from "lucide-react"

interface AnalysisComponentProps {
  onAnalysisComplete?: (analysis: AnalysisResponse) => void
}

export function CoughAnalysisComponent({ onAnalysisComplete }: AnalysisComponentProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file is audio
      if (!selectedFile.type.startsWith("audio/")) {
        setError("Please select an audio file")
        setFile(null)
        return
      }
      // Validate file size (max 25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError("File size must be less than 25MB")
        setFile(null)
        return
      }
      setError(null)
      setFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      if (!droppedFile.type.startsWith("audio/")) {
        setError("Please drop an audio file")
        return
      }
      if (droppedFile.size > 25 * 1024 * 1024) {
        setError("File size must be less than 25MB")
        return
      }
      setError(null)
      setFile(droppedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a file")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await analysisService.analyzeCough(file)
      setAnalysis(result)
      onAnalysisComplete?.(result)
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : "Analysis failed. Please try again."
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "border-green-200 bg-green-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "high":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "medium":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "high":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cough Analysis</CardTitle>
          <CardDescription>
            Upload an audio recording of your cough for analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 items-start">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File Input Area */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm font-medium text-gray-900">
                {file ? file.name : "Drag and drop an audio file or click to select"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: MP3, WAV, OGG, M4A (Max 25MB)
              </p>
            </div>

            <Button
              type="submit"
              disabled={!file || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze Cough"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Card */}
      {analysis && (
        <Card className={`border-2 ${getRiskColor(analysis.risk_level)}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>Based on your cough recording</CardDescription>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getRiskBadgeColor(analysis.risk_level)}`}>
                {getRiskIcon(analysis.risk_level)}
                {analysis.risk_level.charAt(0).toUpperCase() + analysis.risk_level.slice(1)} Risk
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">Summary</p>
              <p className="text-sm text-gray-700">{analysis.summary}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Severity</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {analysis.severity}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase">Confidence</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {analysis.confidence.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900 mb-1">Recommendation</p>
              <p className="text-sm text-gray-700">{analysis.recommendation}</p>
            </div>

            {/* Actions */}
            {analysis.actions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Suggested Actions</p>
                <ul className="space-y-2">
                  {analysis.actions.map((action, index) => (
                    <li key={index} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-primary font-bold">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium mb-1">Medical Disclaimer</p>
              <p className="text-xs text-blue-700">{analysis.disclaimer}</p>
            </div>

            <Button
              onClick={() => {
                setAnalysis(null)
                setFile(null)
              }}
              variant="outline"
              className="w-full"
            >
              Analyze Another Cough
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
