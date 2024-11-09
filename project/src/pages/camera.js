'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Mic, MicOff, Pause, Play, StopCircle, ChevronUp, ChevronDown } from "lucide-react"

export default function VideoNoteApp() {
  const videoRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [note, setNote] = useState("")
  const [isNotesExpanded, setIsNotesExpanded] = useState(false)

  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        setNote(prevNote => prevNote + "Lorem ipsum dolor sit amet. ")
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isRecording, isPaused])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accessing the camera:", err)
    }
  }

  const toggleRecording = () => {
    if (!isRecording) {
      startCamera()
    }
    setIsRecording(!isRecording)
    setIsPaused(false)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const toggleNotesExpansion = () => {
    setIsNotesExpanded(!isNotesExpanded)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-grow flex flex-col">
        <div className="relative flex-grow">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-4">
            <button
              onClick={toggleRecording}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? 
                <StopCircle className="h-6 w-6 text-red-500" /> : 
                <Camera className="h-6 w-6 text-white" />
              }
            </button>
            {isRecording && (
              <button
                onClick={togglePause}
                className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
              >
                {isPaused ? 
                  <Play className="h-6 w-6 text-white" /> : 
                  <Pause className="h-6 w-6 text-white" />
                }
              </button>
            )}
            <button
              onClick={toggleMute}
              className="p-2 bg-gray-800/80 hover:bg-gray-700/80 rounded-full transition-colors"
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isMuted ? 
                <MicOff className="h-6 w-6 text-white" /> : 
                <Mic className="h-6 w-6 text-white" />
              }
            </button>
          </div>
        </div>
        <div 
          className={`bg-gray-800 transition-all duration-300 ease-in-out ${
            isNotesExpanded ? 'h-1/2' : 'h-20'
          }`}
        >
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={toggleNotesExpansion}
          >
            <h2 className="text-lg font-semibold">Generated Notes</h2>
            {isNotesExpanded ? 
              <ChevronDown className="h-6 w-6" /> : 
              <ChevronUp className="h-6 w-6" />
            }
          </div>
          <div className={`px-4 pb-4 ${isNotesExpanded ? 'h-[calc(100%-4rem)] overflow-y-auto' : 'h-0 overflow-hidden'}`}>
            <p className="text-sm text-gray-300">{note}</p>
          </div>
        </div>
      </main>
    </div>
  )
}