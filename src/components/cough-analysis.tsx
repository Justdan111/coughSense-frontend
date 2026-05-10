"use client"

import { useState, useRef, useEffect } from "react"
import { analysisService, type AssessResponse } from "@/lib/api"
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
  CheckCircle,
  AlertCircle,
  RefreshCcw,
  Share2,
  Info,
} from "lucide-react"

export type AnalysisStep = "audio" | "symptoms" | "analyzing" | "results"

interface SymptomState {
  fever: boolean
  blood: boolean
  chest_pain: boolean
  difficulty_breathing: boolean
  save_for_training: boolean
}

interface CoughAnalysisComponentProps {
  onAnalysisComplete?: (analysis: AssessResponse) => void
}

export function CoughAnalysisComponent({ onAnalysisComplete }: CoughAnalysisComponentProps) {
  const [step, setStep] = useState<AnalysisStep>("audio")
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [coughConfidence, setCoughConfidence] = useState<number | null>(null)
  const [symptoms, setSymptoms] = useState<SymptomState>({
    fever: false,
    blood: false,
    chest_pain: false,
    difficulty_breathing: false,
    save_for_training: false,
  })
  const [assessment, setAssessment] = useState<AssessResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Audio recording states
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordedMimeTypeRef = useRef<string>("audio/webm")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [barHeights] = useState(() => Array.from({ length: 12 }, () => Math.random() * 20 + 10))

  const steps = [
    { id: "audio", label: "Audio Sample" },
    { id: "symptoms", label: "Symptoms" },
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

  // Browsers don't reliably encode WAV via MediaRecorder. We negotiate the best
  // supported container/codec the current browser offers, then send the same
  // type all the way through to the backend so it isn't mislabeled.
  const pickSupportedMimeType = (): string => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ]
    if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
      for (const candidate of candidates) {
        if (MediaRecorder.isTypeSupported(candidate)) return candidate
      }
    }
    return "audio/webm"
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = pickSupportedMimeType()
      recordedMimeTypeRef.current = mimeType
      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blobType = mediaRecorder.mimeType || mimeType
        recordedMimeTypeRef.current = blobType
        const blob = new Blob(audioChunksRef.current, { type: blobType })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError(null)
      setDuration(0)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
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
    setCoughConfidence(null)
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
    if (file.size > 50 * 1024 * 1024) {
      setError("File size must be less than 50MB.")
      return
    }
    try {
      setAudioBlob(new Blob([file], { type: file.type }))
      setAudioUrl(URL.createObjectURL(file))
      setError(null)
    } catch (err) {
      console.error("Error loading file:", err)
      setError("Failed to load the audio file. Please try again.")
    }
  }

  const saveToHistory = (result: AssessResponse) => {
    try {
      const saved = localStorage.getItem("analysis_history")
      const history = saved ? JSON.parse(saved) : []
      const updated = [{ ...result, timestamp: new Date().toISOString() }, ...history].slice(0, 20)
      localStorage.setItem("analysis_history", JSON.stringify(updated))
    } catch (err) {
      console.error("Failed to save to history:", err)
    }
  }

  // Map a MIME type to a sensible filename extension so the backend, browsers,
  // and any intermediate proxy/log can identify the format from the filename too.
  const extensionForMimeType = (mimeType: string): string => {
    const base = mimeType.split(";", 1)[0].trim().toLowerCase()
    switch (base) {
      case "audio/webm":
        return "webm"
      case "audio/ogg":
        return "ogg"
      case "audio/mp4":
      case "audio/x-m4a":
        return "m4a"
      case "audio/aac":
        return "aac"
      case "audio/mpeg":
      case "audio/mp3":
        return "mp3"
      case "audio/flac":
        return "flac"
      case "audio/wav":
      case "audio/x-wav":
        return "wav"
      default:
        return "bin"
    }
  }

  // Step 1: upload audio → get cough_confidence from /analyze
  const handleAnalyzeAudio = async () => {
    if (!audioBlob) return
    setStep("analyzing")
    setError(null)
    try {
      const blobType = audioBlob.type || recordedMimeTypeRef.current || "audio/webm"
      const extension = extensionForMimeType(blobType)
      const audioFile = new File([audioBlob], `cough_recording.${extension}`, {
        type: blobType,
      })
      const result = await analysisService.analyzeCough(audioFile)
      console.log("Analyze result:", result)
      // Validate response contains expected confidence field
      if (result == null || typeof result.confidence !== "number" || !isFinite(result.confidence)) {
        console.error("Analyze response missing numeric `confidence` field", result)
        setError("Analysis returned no confidence value. Please try again or contact support.")
        setStep("audio")
        return
      }
      // Store the raw confidence for the assess call
      setCoughConfidence(result.confidence)
      setStep("symptoms")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.")
      setStep("audio")
    }
  }

  // Step 2: combine confidence + symptoms → get full assessment
  const handleAssess = async () => {
    if (coughConfidence == null || typeof coughConfidence !== "number" || !isFinite(coughConfidence)) {
      setError("Missing confidence from analysis. Please run the audio analysis first.")
      setStep("audio")
      return
    }
    setStep("analyzing")
    setError(null)
    try {
      const assessPayload = {
        cough_confidence: coughConfidence,
        ...symptoms,
      }
      console.log("handleAssess - coughConfidence:", coughConfidence)
      console.log("handleAssess - payload being sent:", assessPayload)
      const result = await analysisService.assess(assessPayload)
      setAssessment(result)
      saveToHistory(result)
      onAnalysisComplete?.(result)
      setStep("results")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Assessment failed. Please try again.")
      setStep("symptoms")
    }
  }

  const handleReset = () => {
    setStep("audio")
    setAudioBlob(null)
    setAudioUrl(null)
    setCoughConfidence(null)
    setAssessment(null)
    setError(null)
    setIsPlaying(false)
    setSymptoms({
      fever: false,
      blood: false,
      chest_pain: false,
      difficulty_breathing: false,
      save_for_training: false,
    })
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  const toggleSymptom = (key: keyof SymptomState) => {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const getRiskIcon = (result: string) => {
    if (result === "less_risky") return <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
    return <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
  }

  const getRiskColor = (result: string) => {
    if (result === "less_risky") {
      return { bg: "bg-risk-low", text: "text-risk-low", border: "border-transparent", badge: "bg-risk-low text-risk-low border-transparent" }
    }
    return { bg: "bg-risk-high", text: "text-risk-high", border: "border-transparent", badge: "bg-risk-high text-risk-high border-transparent" }
  }

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  const symptomOptions: { key: keyof SymptomState; label: string; description: string }[] = [
    { key: "fever", label: "Fever", description: "Temperature above 38°C / 100.4°F" },
    { key: "blood", label: "Coughing blood", description: "Blood present in mucus or sputum" },
    { key: "chest_pain", label: "Chest pain", description: "Pain or tightness in the chest" },
    { key: "difficulty_breathing", label: "Difficulty breathing", description: "Shortness of breath at rest or mild exertion" },
  ]

  return (
    <div
      data-testid="cough-analysis"
      data-step={step}
      className="max-w-3xl mx-auto w-full space-y-6 md:space-y-8 px-4"
    >
      <Stepper steps={steps} currentStep={currentStepIndex} />

      <Card className="p-4 sm:p-6 md:p-8 border-none bg-ct-glass rounded-ct shadow-ct-deep min-h-112.5 sm:min-h-125 flex flex-col justify-center">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Audio Recording ── */}
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
                  <h2 className="text-2xl sm:text-3xl font-semibold text-ct">Record your cough</h2>
                  <p className="text-sm sm:text-base text-ct-muted leading-relaxed">
                    Record one continuous 5–10 second sample containing 3–5 distinct coughs.
                  </p>
                  {error && (
                    <p
                      data-testid="analysis-error"
                      className="text-xs sm:text-sm text-red-500 bg-red-50 p-2 rounded-md"
                    >
                      {error}
                    </p>
                  )}
                </div>

                <div className="relative flex flex-col items-center justify-center">
                  {!audioBlob && (
                    <div className="mb-6 w-full flex items-center justify-center">
                      <div className="w-full max-w-md h-20 bg-linear-to-b from-white/40 to-white/30 rounded-lg flex items-center justify-center shadow-inner">
                        <div className="flex items-end gap-2 w-3/4 px-6">
                          {barHeights.slice(0, 12).map((h, i) => (
                            <div key={i} style={{ height: `${h}px` }} className="w-1.5 bg-ct-primary rounded-full animate-pulse" />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {!audioBlob ? (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      data-testid={isRecording ? "audio-stop" : "audio-record"}
                      data-recording={isRecording ? "true" : "false"}
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isRecording ? "bg-risk-high text-white pulse-ring active" : "bg-ct-primary text-white shadow-ct"
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
                      ) : (
                        <Mic className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
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
                        data-testid="audio-playback-btn"
                        data-playing={isPlaying ? "true" : "false"}
                        onClick={togglePlayback}
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-ct-surface flex items-center justify-center border-2 border-ct-primary/20 hover:border-ct-primary transition-all group"
                      >
                        {isPlaying ? (
                          <Pause className="w-10 h-10 sm:w-12 sm:h-12 text-ct-primary" />
                        ) : (
                          <Play className="w-10 h-10 sm:w-12 sm:h-12 text-ct-primary ml-1 group-hover:scale-110 transition-transform" />
                        )}
                      </motion.button>
                      <div className="flex flex-col sm:flex-row gap-3 w-full px-4 sm:px-0">
                        <Button
                          variant="outline"
                          data-testid="audio-retake-btn"
                          onClick={resetAudio}
                          className="gap-2 border-slate-200 bg-transparent h-11 sm:h-10"
                        >
                          <Trash2 className="w-4 h-4" /> Retake
                        </Button>
                        <Button
                          data-testid="audio-analyze-btn"
                          onClick={handleAnalyzeAudio}
                          className="bg-ct-primary hover:opacity-95 text-white h-11 sm:h-10"
                        >
                          Analyze This Sample
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {isRecording && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 mt-4">
                    <div className="text-xl sm:text-2xl font-mono text-risk-high font-semibold">{formatTime(duration)}</div>
                    <div className="flex gap-2 items-end h-12">
                      {barHeights.map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-risk-high rounded-full animate-[pulse_1.2s_infinite]"
                          style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                {!isRecording && !audioBlob && (
                  <div className="w-full max-w-sm px-4">
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-ct-surface px-2 text-ct-muted">Or upload a file</span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      data-testid="audio-file-input"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      data-testid="audio-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      variant="ghost"
                      className="w-full border-dashed border-2 h-14 sm:h-16 hover:bg-slate-50 text-ct-muted text-sm sm:text-base"
                    >
                      <Upload className="w-5 h-5 mr-2" /> Upload audio or drag & drop
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Symptom Checklist ── */}
          {step === "symptoms" && (
            <motion.div
              key="symptoms"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col space-y-6 py-2 md:py-4">
                <div className="space-y-2 px-1">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-ct">Any other symptoms?</h2>
                  <p className="text-sm sm:text-base text-ct-muted leading-relaxed">
                    Select all that apply. This helps us give you a more accurate assessment.
                  </p>
                  {error && (
                    <p
                      data-testid="analysis-error"
                      className="text-xs sm:text-sm text-red-500 bg-red-50 p-2 rounded-md"
                    >
                      {error}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {symptomOptions.map(({ key, label, description }) => (
                    <button
                      key={key}
                      data-testid={`symptom-${key}`}
                      data-checked={symptoms[key] ? "true" : "false"}
                      onClick={() => toggleSymptom(key)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        symptoms[key]
                          ? "border-ct-primary bg-ct-primary/5"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          symptoms[key] ? "bg-ct-primary border-ct-primary" : "border-slate-300"
                        }`}>
                          {symptoms[key] && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{label}</p>
                          <p className="text-xs text-slate-500">{description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="pt-1 pb-1">
                  <button
                    data-testid="symptom-consent"
                    data-checked={symptoms.save_for_training ? "true" : "false"}
                    onClick={() => toggleSymptom("save_for_training")}
                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      symptoms.save_for_training ? "bg-ct-primary border-ct-primary" : "border-slate-300"
                    }`}>
                      {symptoms.save_for_training && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    Contribute this recording to improve the model (anonymous)
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    data-testid="symptom-back"
                    onClick={() => { setStep("audio"); setError(null) }}
                    className="border-slate-200 text-slate-600 h-11"
                  >
                    Back
                  </Button>
                  <Button
                    data-testid="symptom-submit"
                    onClick={handleAssess}
                    className="flex-1 bg-ct-primary hover:opacity-95 text-white h-11"
                  >
                    Get My Results
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Analyzing ── */}
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
                <div className="relative flex items-center gap-8">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-ct-surface flex items-center justify-center shadow-ct">
                    <div className="w-20 h-20 rounded-full border-4 border-ct-primary/20 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-ct-primary animate-pulse" />
                    </div>
                  </div>

                  <div className="text-left max-w-md">
                    <h2 className="text-xl sm:text-2xl font-semibold text-ct">Analyzing respiratory patterns...</h2>
                    <p className="text-sm sm:text-base text-ct-muted max-w-sm">
                      {coughConfidence === null
                        ? "Extracting acoustic features from your recording."
                        : "Combining audio features with your symptom data."}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-ct-primary" />
                        <div className="text-sm text-ct-muted">Audio validation</div>
                        <div className="ml-auto text-sm font-medium text-ct-primary">✓</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-ct-primary" />
                        <div className="text-sm text-ct-muted">Feature extraction</div>
                        <div className="ml-auto text-sm font-medium text-ct-primary">✓</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-ct-primary/30 animate-pulse" />
                        <div className="text-sm text-ct-muted">Running classification</div>
                        <div className="ml-auto text-sm font-medium text-ct-muted">⟳</div>
                      </div>
                      <div className="flex items-center gap-3 opacity-70">
                        <div className="w-3 h-3 rounded-full border border-slate-100" />
                        <div className="text-sm text-ct-muted">Confidence calibration</div>
                        <div className="ml-auto text-sm text-ct-muted">○</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-xs">
                  <Progress value={66} className="h-2 bg-slate-100" />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Results ── */}
          {step === "results" && assessment && (
            <motion.div
              key="results"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              data-testid="results-card"
              data-result={assessment.result}
            >
              <div className="space-y-6 md:space-y-8 py-2 md:py-4">
                {/* Risk header */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center space-y-3 md:space-y-4 px-4"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full ${getRiskColor(assessment.result).bg} ${getRiskColor(assessment.result).text} mb-2`}>
                    {getRiskIcon(assessment.result)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-center gap-2">
                      <Badge
                        variant="outline"
                        data-testid="results-risk-badge"
                        data-risk={assessment.result}
                        className={`${getRiskColor(assessment.result).badge} uppercase tracking-wider text-xs sm:text-sm`}
                      >
                        {assessment.result === "less_risky" ? "Lower Risk" : "Higher Risk"}
                      </Badge>
                    </div>
                    <p
                      data-testid="results-summary"
                      className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed"
                    >
                      {assessment.summary}
                    </p>
                  </div>
                </motion.div>

                {/* Confidence bar */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
                    <span>Cough Detection Confidence</span>
                    <span data-testid="results-confidence">
                      {assessment.cough_confidence_pct.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={assessment.cough_confidence_pct} className="h-2 bg-slate-100" />
                </motion.div>

                {/* Recommendation */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 md:space-y-4"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-ct-primary" />
                    Recommendation
                  </h3>
                  <p data-testid="results-recommendation" className="text-sm text-slate-600">
                    {assessment.recommendation}
                  </p>
                  {assessment.actions.length > 0 && (
                    <>
                      <h4 className="text-sm font-medium text-slate-900 pt-2">Suggested Actions</h4>
                      <ul data-testid="results-actions" className="space-y-2 md:space-y-3">
                        {assessment.actions.map((action, i) => (
                          <li
                            key={i}
                            data-testid={`results-action-${i}`}
                            className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 leading-relaxed"
                          >
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-ct-primary shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </motion.div>

                {/* Disclaimer */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`${getRiskColor(assessment.result).bg} border ${getRiskColor(assessment.result).border} rounded-xl p-4`}
                >
                  <p data-testid="results-disclaimer" className="text-xs sm:text-sm text-slate-800">
                    <strong>⚠️ Important:</strong> {assessment.disclaimer}
                  </p>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-2 md:pt-4 flex gap-2 px-4 sm:px-0"
                >
                  <Button
                    variant="outline"
                    data-testid="results-new-analysis"
                    onClick={handleReset}
                    className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50 text-sm sm:text-base h-11 sm:h-auto"
                  >
                    <RefreshCcw className="w-4 h-4 mr-2" /> New Analysis
                  </Button>
                  <Button
                    variant="outline"
                    data-testid="results-share"
                    className="text-slate-600 border-slate-200 hover:bg-slate-50 px-3 h-11 sm:h-auto"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
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