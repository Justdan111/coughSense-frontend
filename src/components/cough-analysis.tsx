"use client"

import { useState, useRef, useEffect } from "react"
import { analysisService, type AnalysisResponse } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Stepper } from "@/components/ui/stepper"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  Trash2,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Share2,
  Info,
  Loader2,
} from "lucide-react"

export type AnalysisStep = "audio" | "analyzing" | "results"

interface CoughAnalysisComponentProps {
  onAnalysisComplete?: (analysis: AnalysisResponse) => void
}

export function CoughAnalysisComponent({ onAnalysisComplete }: CoughAnalysisComponentProps) {
  const [step, setStep] = useState<AnalysisStep>("audio")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [barHeights] = useState(() => Array.from({ length: 12 }, () => Math.random() * 20 + 10))

  const steps = [
    { id: "audio", label: "Audio Sample" },
    { id: "analyzing", label: "AI Analysis" },
    { id: "results", label: "Results" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } catch (err) {
      console.error("Microphone access error:", err)
      setError("Microphone access denied. Please check your browser settings.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl!)
      audioRef.current.onended = () => setIsPlaying(false)
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const resetAudio = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File size must be less than 50MB.")
      return
    }

    try {
      const blob = new Blob([file], { type: file.type })
      setAudioBlob(blob)
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setError(null)
    } catch (err) {
      console.error("Error loading file:", err)
      setError("Failed to load the audio file. Please try again.")
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // Save analysis result to localStorage
  const saveToHistory = (result: AnalysisResponse) => {
    try {
      const saved = localStorage.getItem("analysis_history")
      let history = []
      if (saved) {
        try {
          history = JSON.parse(saved)
        } catch (e) {
          console.error("Failed to parse history:", e)
        }
      }

      const newEntry = {
        ...result,
        timestamp: new Date().toISOString(),
      }

      // Add to beginning and keep only last 20 entries
      const updatedHistory = [newEntry, ...history].slice(0, 20)
      localStorage.setItem("analysis_history", JSON.stringify(updatedHistory))
    } catch (err) {
      console.error("Failed to save to history:", err)
    }
  }

  const handleAnalyze = async () => {
    if (!audioBlob) return

    setStep("analyzing")
    setError(null)

    try {
      // Convert blob to file for API
      const audioFile = new File([audioBlob], "cough_recording.wav", {
        type: audioBlob.type || "audio/wav",
      })

      const result = await analysisService.analyzeCough(audioFile)
      setAnalysis(result)
      
      // Save to localStorage for history
      saveToHistory(result)
      
      onAnalysisComplete?.(result)
      setStep("results")
    } catch (err: Error | unknown) {
      console.error("Analysis error:", err)
      const errorMessage = err instanceof Error ? err.message : "Analysis failed. Please try again."
      setError(errorMessage)
      setStep("audio") // Go back to audio step on error
    }
  }

  const handleReset = () => {
    setStep("audio")
    setAudioBlob(null)
    setAudioUrl(null)
    setAnalysis(null)
    setError(null)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
      case "medium":
        return <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
      case "high":
        return <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
      default:
        return <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return { bg: "bg-green-50", text: "text-green-500", border: "border-green-200", badge: "bg-green-50 text-green-700 border-green-200" }
      case "medium":
        return { bg: "bg-amber-50", text: "text-amber-500", border: "border-amber-200", badge: "bg-amber-50 text-amber-700 border-amber-200" }
      case "high":
        return { bg: "bg-red-50", text: "text-red-500", border: "border-red-200", badge: "bg-red-50 text-red-700 border-red-200" }
      default:
        return { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", badge: "bg-slate-50 text-slate-700 border-slate-200" }
    }
  }

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 md:space-y-8">
      <Stepper steps={steps} currentStep={currentStepIndex} />

      <Card className="p-4 sm:p-6 md:p-8 border-none shadow-xl bg-white min-h-[450px] sm:min-h-[500px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* Audio Recording Step */}
          {step === "audio" && (
            <motion.div
              key="audio"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 py-2 md:py-4">
                <div className="space-y-2 px-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Record your cough</h2>
                  <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                    Please provide a sample of 3-5 distinct coughs in a quiet environment.
                  </p>
                  {error && <p className="text-xs sm:text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}
                </div>

                <div className="relative flex items-center justify-center">
                  {!audioBlob ? (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${
                        isRecording ? "bg-red-500 animate-pulse scale-110" : "bg-brand-teal hover:scale-105"
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      ) : (
                        <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                      )}
                    </motion.button>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-4 md:gap-6"
                    >
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={togglePlayback}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-brand-soft flex items-center justify-center border-2 border-brand-teal/20 hover:border-brand-teal transition-all group"
                      >
                        {isPlaying ? (
                          <Pause className="w-10 h-10 sm:w-12 sm:h-12 text-brand-teal" />
                        ) : (
                          <Play className="w-10 h-10 sm:w-12 sm:h-12 text-brand-teal ml-1 group-hover:scale-110 transition-transform" />
                        )}
                      </motion.button>
                      <div className="flex flex-col sm:flex-row gap-3 w-full px-4 sm:px-0">
                        <Button variant="outline" onClick={resetAudio} className="gap-2 border-slate-200 bg-transparent h-11 sm:h-10">
                          <Trash2 className="w-4 h-4" /> Retake
                        </Button>
                        <Button
                          onClick={handleAnalyze}
                          className="bg-brand-teal hover:bg-brand-teal/90 h-11 sm:h-10"
                        >
                          Analyze This Sample
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {isRecording && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
                    <div className="text-xl sm:text-2xl font-mono text-red-500 font-semibold">{formatTime(duration)}</div>
                    <div className="flex gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-red-500 rounded-full animate-pulse"
                          style={{
                            height: `${barHeights[i]}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {!isRecording && !audioBlob && (
                  <div className="w-full max-w-sm px-4">
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">Or upload a file</span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={triggerFileInput}
                      variant="ghost"
                      className="w-full border-dashed border-2 h-14 sm:h-16 hover:bg-slate-50 text-slate-500 text-sm sm:text-base"
                    >
                      <Upload className="w-5 h-5 mr-2" /> Select Audio File
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Analyzing Step */}
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-brand-soft flex items-center justify-center">
                    <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-brand-teal animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-brand-teal/20 animate-ping" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Analyzing your cough...</h2>
                  <p className="text-sm sm:text-base text-slate-500 max-w-sm mx-auto">
                    Our AI is processing your audio sample. This may take a few moments.
                  </p>
                </div>
                <div className="w-full max-w-xs">
                  <Progress value={66} className="h-2 bg-slate-100" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Step */}
          {step === "results" && analysis && (
            <motion.div
              key="results"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6 md:space-y-8 py-2 md:py-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center space-y-3 md:space-y-4 px-4"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full ${getRiskColor(analysis.risk_level).bg} ${getRiskColor(analysis.risk_level).text} mb-2`}>
                    {getRiskIcon(analysis.risk_level)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${getRiskColor(analysis.risk_level).badge} uppercase tracking-wider text-xs sm:text-sm`}
                      >
                        {analysis.risk_level.charAt(0).toUpperCase() + analysis.risk_level.slice(1)} Risk
                      </Badge>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{analysis.severity}</h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>
                </motion.div>

                <div className="space-y-4 md:space-y-6 px-4 sm:px-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
                      <span>AI Confidence Score</span>
                      <span>{analysis.confidence.toFixed(1)}%</span>
                    </div>
                    <Progress value={analysis.confidence} className="h-2 bg-slate-100" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 md:space-y-4"
                  >
                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
                      <Info className="w-4 h-4 text-brand-teal" />
                      Recommendation
                    </h3>
                    <p className="text-sm text-slate-600">{analysis.recommendation}</p>
                    
                    {analysis.actions.length > 0 && (
                      <>
                        <h4 className="text-sm font-medium text-slate-900 pt-2">Suggested Actions</h4>
                        <ul className="space-y-2 md:space-y-3">
                          {analysis.actions.map((action, i) => (
                            <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                              <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`${getRiskColor(analysis.risk_level).bg} border ${getRiskColor(analysis.risk_level).border} rounded-xl p-4`}
                  >
                    <p className="text-xs sm:text-sm text-slate-800">
                      <strong>⚠️ Important:</strong> {analysis.disclaimer}
                    </p>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2 md:pt-4 flex flex-col gap-3 px-4 sm:px-0"
                >
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50 text-sm sm:text-base h-11 sm:h-auto"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" /> New Analysis
                    </Button>
                    <Button variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-50 px-3 h-11 sm:h-auto">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="text-center text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed px-4">
        Disclaimer: This tool is for informational purposes only and is not a substitute for professional medical
        advice, diagnosis, or treatment. Always seek the advice of your physician.
      </div>
    </div>
  )
}
