"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Mic, Square, Upload, Play, Trash2, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function AudioRecorder({ onComplete }: { onComplete: (blob: Blob) => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [barHeights] = useState(() => Array.from({ length: 12 }, () => Math.random() * 20 + 10))

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
        setRecordedBlob(blob)
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
      console.error("[v0] Microphone access error:", err)
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

  const reset = () => {
    setRecordedBlob(null)
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

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File size must be less than 50MB.")
      return
    }

    try {
      const blob = new Blob([file], { type: file.type })
      setRecordedBlob(blob)
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

  return (
    <div className="flex flex-col items-center text-center space-y-6 md:space-y-8 py-2 md:py-4">
      <div className="space-y-2 px-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Record your cough</h2>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          Please provide a sample of 3-5 distinct coughs in a quiet environment.
        </p>
        {error && <p className="text-xs sm:text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}
      </div>

      <div className="relative flex items-center justify-center">
        {!recordedBlob ? (
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
              <Button variant="outline" onClick={reset} className="gap-2 border-slate-200 bg-transparent h-11 sm:h-10">
                <Trash2 className="w-4 h-4" /> Retake
              </Button>
              <Button
                onClick={() => onComplete(recordedBlob)}
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

      {!isRecording && !recordedBlob && (
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
  )
}
